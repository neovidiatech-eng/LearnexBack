import test from "node:test";
import assert from "node:assert/strict";
import { loginRateLimiter, otpRateLimiter, authRateLimiter } from "../../src/middleware/rateLimiter.middleware.js";

test("Rate Limiters Configuration Tests", async (t) => {
  await t.test("rate limiters are defined as express middleware functions", () => {
    assert.equal(typeof loginRateLimiter, "function");
    assert.equal(typeof otpRateLimiter, "function");
    assert.equal(typeof authRateLimiter, "function");
  });
});
