import { randomUUID } from "node:crypto";

/**
 * Request ID Correlation Middleware.
 * Extracts or generates an X-Request-Id for end-to-end distributed tracing.
 */
export const requestIdMiddleware = (req, res, next) => {
  const incoming = req.headers["x-request-id"];
  let requestId;

  // Validate incoming client request ID (alphanumeric, hyphens, max 64 chars)
  if (
    typeof incoming === "string" &&
    incoming.trim().length > 0 &&
    incoming.trim().length <= 64 &&
    /^[a-zA-Z0-9_-]+$/.test(incoming.trim())
  ) {
    requestId = incoming.trim();
  } else {
    requestId = `req-${randomUUID()}`;
  }

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
};
