/**
 * Small set of typed errors. The global Fastify error handler (see
 * server.ts) maps these to status codes and a safe JSON body. Never let a
 * raw upstream error, stack trace, prompt, or model output reach the client.
 */

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request") {
    super("VALIDATION_ERROR", message, 400);
  }
}

export class UpstreamError extends AppError {
  constructor(message = "An upstream service failed") {
    super("UPSTREAM_ERROR", message, 502);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super("RATE_LIMIT_ERROR", message, 429);
  }
}

export class AuthError extends AppError {
  constructor(message = "Not authenticated") {
    super("AUTH_ERROR", message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super("NOT_FOUND", message, 404);
  }
}
