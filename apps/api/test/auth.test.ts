import { describe, expect, it, vi } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";

const jwtVerify = vi.fn();

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => "mock-key-set"),
  jwtVerify: (...args: unknown[]) => jwtVerify(...args),
}));

const { requireAuth, getAuthenticatedUser } = await import("../src/security/auth.js");

function makeRequest(authorizationHeader?: string): FastifyRequest {
  return { headers: { authorization: authorizationHeader } } as unknown as FastifyRequest;
}

describe("requireAuth", () => {
  it("rejects a request with no Authorization header", async () => {
    await expect(requireAuth(makeRequest(), {} as FastifyReply)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("rejects a header that isn't a bearer token", async () => {
    await expect(requireAuth(makeRequest("Basic abc123"), {} as FastifyReply)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("rejects a token that fails verification", async () => {
    jwtVerify.mockRejectedValueOnce(new Error("bad signature"));
    await expect(requireAuth(makeRequest("Bearer bad-token"), {} as FastifyReply)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("rejects a token with no subject claim", async () => {
    jwtVerify.mockResolvedValueOnce({ payload: {} });
    await expect(requireAuth(makeRequest("Bearer no-sub"), {} as FastifyReply)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("attaches the user id and raw token to the request on success", async () => {
    jwtVerify.mockResolvedValueOnce({ payload: { sub: "user-123" } });
    const request = makeRequest("Bearer good-token");

    await requireAuth(request, {} as FastifyReply);

    expect(request.user).toEqual({ id: "user-123", accessToken: "good-token" });
    expect(getAuthenticatedUser(request)).toEqual({ id: "user-123", accessToken: "good-token" });
  });
});

describe("getAuthenticatedUser", () => {
  it("throws if called without requireAuth having run first", () => {
    expect(() => getAuthenticatedUser(makeRequest())).toThrow();
  });
});
