import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import * as dotenv from 'dotenv';
import { PrismaService } from 'src/prisma.service';

dotenv.config();

type JwtPayload = {
  sub: string; // e.g. "auth0|abc123" or "google-oauth2|xyz"
  iss: string;
  aud: string | string[];
  scope?: string;
};

export interface JwtUser {
  userId: number;
  provider: string;
  providerId: string;
  sub: string;
  scopes: string[];
}

function splitSub(sub: string) {
  // "provider|id" → { provider, providerId }
  const [provider, ...rest] = sub.split('|');
  return { provider, providerId: rest.join('|') };
}

const ISSUER = process.env.VITE_AUTH0_ISSUER_URL?.replace(/\/$/, '') || '';
const AUDIENCE = process.env.VITE_AUTH0_AUDIENCE || '';

if (!ISSUER || !AUDIENCE) {
  throw new Error(
    'JwtStrategy requires VITE_AUTH0_ISSUER_URL and VITE_AUTH0_AUDIENCE. ' +
      'Set them in Render Dashboard → Environment (e.g. ISSUER https://your-tenant.auth0.com/)',
  );
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${ISSUER}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: AUDIENCE,
      issuer: `${ISSUER}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    // You can see the JWT here
    console.log('JWT payload', payload);

    const { sub } = payload;
    const { provider, providerId } = splitSub(sub);

    // 1) Find Authentication by provider+providerId
    let auth = await this.prisma.authentication.findFirst({
      where: { provider, providerId },
      include: { user: true },
    });

    // 2) If missing, create User + Authentication (using whatever claims we have)
    if (!auth) {
      // create a minimal user that satisfies required fields in the schema
      const generatedUsername = `${provider}_${providerId}`.slice(0, 191);
      const generatedEmail = `${provider}_${providerId}@auth.local`.slice(0, 191);

      try {
        // create and return the nested authentication in one call to avoid a second query
        await this.prisma.user.create({
          data: {
            username: generatedUsername,
            email: generatedEmail,
            // passwordHash is required by schema; external-auth users get an empty string
            passwordHash: '',
            authentications: {
              create: {
                provider,
                providerId,
              },
            },
          },
          include: { authentications: true },
        });

        // fetch the authentication with its user relation so `auth` has the same shape
        auth = await this.prisma.authentication.findFirst({
          where: { provider, providerId },
          include: { user: true },
        });

        // Verify auth was created successfully
        if (!auth) {
          throw new Error(`Failed to create or fetch authentication for ${provider}|${providerId}`);
        }
      } catch (err) {
        // If creation failed due to a race (unique constraint) or other transient error,
        // attempt to find the authentication created by the concurrent request.
        console.error('[JwtStrategy] user.create failed, attempting to recover:', err);
        auth = await this.prisma.authentication.findFirst({
          where: { provider, providerId },
          include: { user: true },
        });

        // if we still don't have an auth, rethrow so the request fails visibly
        if (!auth) throw err;
      }
    } else {
      // 3) Update user profile fields opportunistically (don’t overwrite with nulls)
      // If you want to update fields from JWT claims, populate the `data` object
      // with only non-null values. Currently no-op; leaving a log to aid debugging.
      try {
        await this.prisma.user.update({
          where: { id: auth.userId },
          data: {},
        });
      } catch (err) {
        console.error('[JwtStrategy] user.update failed (non-fatal):', err);
      }
    }

    // Final safety check
    if (!auth || !auth.user) {
      throw new Error(`Authentication or user not found for ${provider}|${providerId}`);
    }

    return {
      userId: auth.userId,
      provider,
      providerId,
      sub,
      scopes: (payload.scope ?? '').split(' ').filter(Boolean),
    } as JwtUser;
  }
}