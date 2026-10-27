import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { throwError, globalErrorHandling } from "../src/utils/response.js";
import { validation } from "../src/middleware/validation.middleware.js";
import Joi from "joi";

describe("Backend Error Handling & Response Tests", () => {
  test("throwError supports positional arguments (message, status)", () => {
    try {
      throwError("COURSE_NOT_FOUND", 404);
      assert.fail("Should have thrown error");
    } catch (err) {
      assert.equal(err.message, "COURSE_NOT_FOUND");
      assert.equal(err.cause, 404);
    }
  });

  test("throwError supports object argument ({ message, status })", () => {
    try {
      throwError({ message: "SLOT_NOT_AVAILABLE", status: 409 });
      assert.fail("Should have thrown error");
    } catch (err) {
      assert.equal(err.message, "SLOT_NOT_AVAILABLE");
      assert.equal(err.cause, 409);
    }
  });

  test("throwError defaults status to 400 when omitted", () => {
    try {
      throwError("VALIDATION_FAILED");
      assert.fail("Should have thrown error");
    } catch (err) {
      assert.equal(err.message, "VALIDATION_FAILED");
      assert.equal(err.cause, 400);
    }
  });

  test("globalErrorHandling formats structured error response with status and code", () => {
    let capturedStatus;
    let capturedJson;

    const mockRes = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(payload) {
        capturedJson = payload;
        return this;
      },
    };

    const mockReq = {
      t: (key) => key,
    };

    const err = new Error("ITEM_ALREADY_IN_CART");
    err.cause = 409;

    globalErrorHandling(err, mockReq, mockRes, () => {});

    assert.equal(capturedStatus, 409);
    assert.equal(capturedJson.status, 409);
    assert.equal(capturedJson.success, false);
    assert.equal(capturedJson.code, "ITEM_ALREADY_IN_CART");
    assert.equal(capturedJson.message, "ITEM_ALREADY_IN_CART");
  });

  test("globalErrorHandling sanitizes 500 errors in non-DEV environments", () => {
    let capturedStatus;
    let capturedJson;

    const mockRes = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(payload) {
        capturedJson = payload;
        return this;
      },
    };

    const mockReq = {
      t: (key) => key,
    };

    const originalMood = process.env.MOOD;
    process.env.MOOD = "PROD";

    try {
      const err = new Error("PrismaClientKnownRequestError: relation does not exist");
      err.cause = 500;

      globalErrorHandling(err, mockReq, mockRes, () => {});

      assert.equal(capturedStatus, 500);
      assert.equal(capturedJson.status, 500);
      assert.equal(capturedJson.success, false);
      assert.equal(capturedJson.message, "INTERNAL_SERVER_ERROR");
      assert.equal(capturedJson.stack, undefined);
    } finally {
      process.env.MOOD = originalMood;
    }
  });

  test("validation middleware returns consistent 400 error with validationError list", async () => {
    const schema = {
      body: Joi.object({
        email: Joi.string().email().required(),
      }),
    };

    const middleware = validation(schema);

    let capturedStatus;
    let capturedJson;

    const req = {
      body: { email: "not-an-email" },
    };

    const res = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(payload) {
        capturedJson = payload;
        return this;
      },
    };

    await middleware(req, res, () => {});

    assert.equal(capturedStatus, 400);
    assert.equal(capturedJson.success, false);
    assert.equal(capturedJson.status, 400);
    assert.equal(capturedJson.message, "VALIDATION_ERROR");
    assert.equal(capturedJson.error_message, "VALIDATION_ERROR");
    assert.ok(Array.isArray(capturedJson.validationError));
    assert.equal(capturedJson.validationError[0].key, "body");
    assert.ok(capturedJson.validationError[0].details[0].message.includes("email"));
  });
});
