import dbService from "../../../../db/db.service.js";
import { quizTypeEnum } from "../../../../utils/Enums/teacherCourse.enum.js";


const getTeacherByUserId = async (userId) => {

    const teacher = await dbService.findOne({
        model: "teacher",
        where: {
            userId,
        },
    });

    if (!teacher) {
        const error = new Error("TEACHER_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    return teacher;
};

const getOwnedSection = async (sectionId, teacherId) => {
    const section = await dbService.findOne({
        model: "teacherCourseSection",
        where: {
            id: sectionId,
            course: {
                teacherId,
            },
        },
        include: {
            quiz: true,
        },
    });

    if (!section) {
        const error = new Error("SECTION_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    return section;
};

const validateQuestions = (questions) => {
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("QUESTIONS_REQUIRED");
    }

    questions.forEach((question) => {
        if (!Object.values(quizTypeEnum).includes(question.type)) {
           const error = new Error("INVALID_QUESTION_TYPE");
           error.cause = 400;
           throw error;
        }

        if (!question.text?.trim()) {
            const error = new Error("QUESTION_TEXT_REQUIRED");
            error.cause = 400;
            throw error;
        }

        if (question.type === quizTypeEnum.WRITTEN) {
            if (question.options?.length) {
                const error = new Error("WRITTEN_MUST_NOT_HAVE_OPTIONS");
                error.cause = 400;
                throw error;
            }
            return; // يكمل على السؤال اللي بعده
        }

        if (!Array.isArray(question.options) || question.options.length === 0) {
            const error = new Error("QUESTION_OPTIONS_REQUIRED");
            error.cause = 400;
            throw error;
        }

        if (question.options.some((option) => !option.text?.trim())) {
            const error = new Error("OPTION_TEXT_REQUIRED");
            error.cause = 400;
            throw error;
        }

        const correctOptions = question.options.filter(
            (option) => option.isCorrect === true
        );

        if (question.type === quizTypeEnum.MCQ) {
            if (question.options.length < 2) {
                const error = new Error("MCQ_REQUIRES_AT_LEAST_TWO_OPTIONS");
                error.cause = 400;
                throw error;
            }
            if (correctOptions.length !== 1) {
                const error = new Error("MCQ_MUST_HAVE_ONE_CORRECT_OPTION");
                error.cause = 400;
                throw error;
            }
        }

        if (question.type === quizTypeEnum.TRUE_FALSE) {
            if (question.options.length !== 2) {
                const error = new Error("TRUE_FALSE_REQUIRES_TWO_OPTIONS");
                error.cause = 400;
                throw error;
            }
            if (correctOptions.length !== 1) {
                const error = new Error("TRUE_FALSE_MUST_HAVE_ONE_CORRECT_OPTION");
                error.cause = 400;
                throw error;
            }
        }
    });
};

export const createQuiz = async ({
    userId, sectionId, title, description, duration, passingScore, questions,
}) => {
    validateQuestions(questions);

    const teacher = await getTeacherByUserId(userId);
    const section = await getOwnedSection(sectionId, teacher.id);

    if (section.quiz) {
        const error = new Error("QUIZ_ALREADY_EXISTS");
        error.cause = 409;
        throw error;
    }

    try {
        return await dbService.create({
            model: "teacherCourseQuiz",
            data: {
                sectionId,
                title,
                description,
                duration,
                passingScore,
                questions: {
                    create: questions.map((question, questionIndex) => ({
                        type: question.type,
                        text: question.text,
                        order: questionIndex + 1,
                        ...(question.type !== quizTypeEnum.WRITTEN && {
                            options: {
                                create: question.options.map((option, optionIndex) => ({
                                    text: option.text,
                                    isCorrect: option.isCorrect,
                                    order: optionIndex + 1,
                                })),
                            },
                        }),
                    })),
                },
            },
            include: {
                questions: {
                    orderBy: { order: "asc" },
                    include: { options: { orderBy: { order: "asc" } } },
                },
            },
        });
    } catch (error) {
        if (error.code === "P2002") {
            const error = new Error("QUIZ_ALREADY_EXISTS");
            error.cause = 409;
            throw error;
        }
        throw error;
    }
};

export const getQuiz = async ({
    userId,
    sectionId,
}) => {

    const teacher = await getTeacherByUserId(userId);
    
    await getOwnedSection(
        sectionId,
        teacher.id
    );

    const quiz = await dbService.findOne({
        model: "teacherCourseQuiz",
        where: {
            sectionId,
        },
        include: {
            questions: {
                orderBy: {
                    order: "asc",
                },
                include: {
                    options: {
                        orderBy: {
                            order: "asc",
                        },
                    },
                },
            },
        },
    });

    if (!quiz) {
        const error = new Error("QUIZ_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    return quiz;
};

export const updateQuiz = async ({
    userId,
    sectionId,
    title,
    description,
    duration,
    passingScore,
}) => {

    const teacher = await getTeacherByUserId(userId);

    const section = await getOwnedSection(sectionId,teacher.id)

    if (!section.quiz) {
        const error = new Error("QUIZ_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    const updatedQuiz = await dbService.updateOne({
        model: "teacherCourseQuiz",
        where: {
            id: section.quiz.id,
        },
        data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(duration !== undefined && { duration }),
            ...(passingScore !== undefined && { passingScore }),
        },
    });

    return updatedQuiz;
};

export const updateQuestion = async ({
    userId,
    sectionId,
    questionId,
    text,
    correctOptionId,
}) => {
    const teacher = await getTeacherByUserId(userId);
    const section = await getOwnedSection(sectionId, teacher.id);

    if (!section.quiz) {
        const error = new Error("QUIZ_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    const question = await dbService.findOne({
        model: "teacherCourseQuizQuestion",
        where: { id: questionId, quizId: section.quiz.id },
        include: { options: true },
    });

    if (!question) {
       const error = new Error("QUESTION_NOT_FOUND");
       error.cause = 404;
       throw error;
    }

    const data = {};

    if (text !== undefined) {
        data.text = text;
    }

    if (correctOptionId !== undefined) {
        if (question.type === quizTypeEnum.WRITTEN) {
           const error = new Error("WRITTEN_QUESTION_HAS_NO_OPTIONS");
           error.cause = 400;
           throw error;
        }

        const optionExists = question.options.some(
            (option) => option.id === correctOptionId
        );

        if (!optionExists) {
            const error = new Error("OPTION_NOT_FOUND");
            error.cause = 404;
            throw error;
        }

        data.options = {
            updateMany: {
                where: { id: { not: correctOptionId } },
                data: { isCorrect: false },
            },
            update: {
                where: { id: correctOptionId },
                data: { isCorrect: true },
            },
        };
    }

    return dbService.updateOne({
        model: "teacherCourseQuizQuestion",
        where: { id: question.id },
        data,
        include: {
            options: { orderBy: { order: "asc" } },
        },
    });
};

export const deleteQuiz = async ({
    userId,
    sectionId,
}) => {

    const teacher = await getTeacherByUserId(userId);
    const section = await getOwnedSection(sectionId,teacher.id);

    if(!section.quiz){
        const error = new Error("QUIZ_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    await dbService.deleteOne({
        model: "teacherCourseQuiz",
        where: {
            id: section.quiz.id,
        },
    });
};

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * يتأكد إن الـ quiz ملكه الـ teacher المطلوب
 * بيرجع الـ quiz object
 */
const getOwnedQuiz = async (quizId, teacherId) => {
    const quiz = await dbService.findFirst({
        model: "teacherCourseQuiz",
        where: {
            id: quizId,
            section: {
                course: { teacherId },
            },
        },
    });

    if (!quiz) {
        const error = new Error("QUIZ_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    return quiz;
};

// ─── GET /quizzes/:quizId/submissions ────────────────────────────────────────

export const getQuizSubmissions = async ({ userId, quizId }) => {
    const teacher = await getTeacherByUserId(userId);
    await getOwnedQuiz(quizId, teacher.id);

    const submissions = await dbService.findMany({
        model: "teacherCourseQuizSubmission",
        where: { quizId },
        orderBy: { submittedAt: "desc" },
    });

    return submissions;
};

// ─── GET /quizzes/:quizId/submissions/:submissionId ──────────────────────────

export const getSubmissionDetails = async ({ userId, quizId, submissionId }) => {
    const teacher = await getTeacherByUserId(userId);
    await getOwnedQuiz(quizId, teacher.id);

    const submission = await dbService.findFirst({
        model: "teacherCourseQuizSubmission",
        where: { id: submissionId, quizId },
        include: {
            answers: {
                include: {
                    question: {
                        include: {
                            options: { orderBy: { order: "asc" } },
                        },
                    },
                    selectedOption: true,
                },
                orderBy: {
                    question: { order: "asc" },
                },
            },
        },
    });

    if (!submission) {
        const error = new Error("SUBMISSION_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    return submission;
};

// ─── PATCH /quizzes/:quizId/submissions/:submissionId/grade ──────────────────

export const gradeSubmission = async ({ userId, quizId, submissionId, grades }) => {
    const teacher = await getTeacherByUserId(userId);
    const quiz = await getOwnedQuiz(quizId, teacher.id);

    // جيب الـ submission مع الـ answers كلها
    const submission = await dbService.findFirst({
        model: "teacherCourseQuizSubmission",
        where: { id: submissionId, quizId },
        include: {
            answers: {
                include: { question: true },
            },
        },
    });

    if (!submission) {
        const error = new Error("SUBMISSION_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    if (submission.status === "GRADED") {
        const error = new Error("SUBMISSION_ALREADY_GRADED");
        error.cause = 409;
        throw error;
    }

    // grades = [{ answerId, isCorrect, feedback? }]
    // تحقق إن كل answerId ينتمي للـ submission دي
    const answerIds = submission.answers.map((a) => a.id);
    for (const grade of grades) {
        if (!answerIds.includes(grade.answerId)) {
            const error = new Error("ANSWER_NOT_IN_SUBMISSION");
            error.cause = 400;
            throw error;
        }

        const answer = submission.answers.find((a) => a.id === grade.answerId);
        if (answer.question.type !== quizTypeEnum.WRITTEN) {
            const error = new Error("ONLY_WRITTEN_ANSWERS_CAN_BE_GRADED");
            error.cause = 400;
            throw error;
        }
    }

    // اعمل update لكل written answer
    await Promise.all(
        grades.map((grade) =>
            dbService.updateOne({
                model: "teacherCourseQuizAnswer",
                where: { id: grade.answerId },
                data: {
                    isCorrect: grade.isCorrect,
                    ...(grade.feedback !== undefined && { feedback: grade.feedback }),
                },
            })
        )
    );

    // احسب الـ correctCount بعد التصحيح
    // كل الـ answers (MCQ/TRUE_FALSE اتصححوا automatically لما الطالب حل)
    // والـ WRITTEN اتصححوا دلوقتي
    const allAnswers = await dbService.findMany({
        model: "teacherCourseQuizAnswer",
        where: { submissionId },
    });

    const correctCount = allAnswers.filter((a) => a.isCorrect === true).length;
    const totalQuestions = submission.totalQuestions;
    const percentage = totalQuestions > 0
        ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(2))
        : 0;
    const passed = percentage >= quiz.passingScore;

    const updatedSubmission = await dbService.updateOne({
        model: "teacherCourseQuizSubmission",
        where: { id: submissionId },
        data: {
            correctCount,
            percentage,
            passed,
            gradedAt: new Date(),
            status: "GRADED",
        },
    });

    return updatedSubmission;
};
