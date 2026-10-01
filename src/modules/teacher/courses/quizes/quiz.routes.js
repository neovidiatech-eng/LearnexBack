import { Router } from "express";
import { authentication } from "../../../../middleware/authentication.middleware.js";
import { validation } from "../../../../middleware/validation.middleware.js";
import * as quizValidation from "./quiz.validation.js";
import * as quizController from "./quiz.controller.js";

const router = Router();

router.post(
    "/:sectionId/quiz",
    authentication(),
    validation(quizValidation.createQuizSchema),
    quizController.createQuizController
)

router.patch(
    "/:sectionId/quiz",
    authentication(),
    validation(quizValidation.updateQuizSchema),
    quizController.updateQuiz
)

router.patch("/:sectionId/quize/:questionId",authentication(),
    validation(quizValidation.updateQuestionSchema),
    quizController.updateQuestion
)





export default router;