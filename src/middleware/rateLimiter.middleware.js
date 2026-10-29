import rateLimit from "express-rate-limit";

const isTestEnv = () =>
  process.env.NODE_ENV === "test" || process.env.MOOD === "TEST";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  message: {
    status: 429,
    success: false,
    message: "TOO_MANY_REQUESTS",
    code: "TOO_MANY_REQUESTS",
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  message: {
    status: 429,
    success: false,
    message: "TOO_MANY_LOGIN_ATTEMPTS",
    code: "TOO_MANY_LOGIN_ATTEMPTS",
  },
});

export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  message: {
    status: 429,
    success: false,
    message: "TOO_MANY_OTP_ATTEMPTS",
    code: "TOO_MANY_OTP_ATTEMPTS",
  },
});
