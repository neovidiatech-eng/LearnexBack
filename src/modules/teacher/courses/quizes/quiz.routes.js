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

router.patch("/:sectionId/quiz/questions/:questionId",authentication(),
    validation(quizValidation.updateQuestionSchema),
    quizController.updateQuestion
)

router.get(
    "/:sectionId/quiz",
    authentication(),
    validation(quizValidation.quizParamsSchema),
    quizController.getQuiz
);


router.delete(
    "/:sectionId/quiz",
    authentication(),
    validation(quizValidation.quizParamsSchema),
    quizController.deleteQuiz
)

// ─── Submission Routes ────────────────────────────────────────────────────────

router.get(
    "/quiz/:quizId/submissions",
    authentication(),
    validation(quizValidation.quizSubmissionsParamsSchema),
    quizController.getQuizSubmissionsController
);

router.get(
    "/quiz/:quizId/submissions/:submissionId",
    authentication(),
    validation(quizValidation.submissionDetailsParamsSchema),
    quizController.getSubmissionDetailsController
);

router.patch(
    "/quiz/:quizId/submissions/:submissionId/grade",
    authentication(),
    validation(quizValidation.gradeSubmissionSchema),
    quizController.gradeSubmissionController
);

export default router;