import { Router } from "express";
import * as quizController from "./quizzes.controller.js";
import * as quizValidation from "./quizzes.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";

const router = Router();

router.use(authentication());

router.get(
  "/:quizId",
  validation(quizValidation.getQuiz),
  quizController.getStudentQuiz
);

router.post(
  "/:quizId/submit",
  validation(quizValidation.submitQuiz),
  quizController.submitStudentQuiz
);

router.get(
  "/:quizId/my-submission",
  validation(quizValidation.getMySubmission),
  quizController.getMySubmission
);

export default router;
