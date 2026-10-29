import test from "node:test";
import assert from "node:assert/strict";
import * as quizzesService from "../../src/modules/student/quizzes/quizzes.service.js";
import * as reviewsService from "../../src/modules/student/reviews/reviews.service.js";

test("Quizzes Service Export & Contract Tests", async (t) => {
  await t.test("exports getStudentQuizService, submitStudentQuizService, getMySubmissionService", () => {
    assert.equal(typeof quizzesService.getStudentQuizService, "function");
    assert.equal(typeof quizzesService.submitStudentQuizService, "function");
    assert.equal(typeof quizzesService.getMySubmissionService, "function");
  });
});

test("Reviews Service Export & Contract Tests", async (t) => {
  await t.test("exports addReviewService, getReviewsService", () => {
    assert.equal(typeof reviewsService.addReviewService, "function");
    assert.equal(typeof reviewsService.getReviewsService, "function");
  });
});
