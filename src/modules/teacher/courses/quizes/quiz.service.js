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
        throw new Error("TEACHER_NOT_FOUND");
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
        throw new Error("SECTION_NOT_FOUND");
    }

    return section;
};

const validateQuestions = (questions) => {
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("QUESTIONS_REQUIRED");
    }

    questions.forEach((question) => {
        if (!Object.values(quizTypeEnum).includes(question.type)) {
            throw new Error("INVALID_QUESTION_TYPE");
        }

        if (!question.text?.trim()) {
            throw new Error("QUESTION_TEXT_REQUIRED");
        }

        if (question.type === quizTypeEnum.WRITTEN) {
            if (question.options?.length) {
                throw new Error("WRITTEN_MUST_NOT_HAVE_OPTIONS");
            }
            return; // يكمل على السؤال اللي بعده
        }

        if (!Array.isArray(question.options) || question.options.length === 0) {
            throw new Error("QUESTION_OPTIONS_REQUIRED");
        }

        if (question.options.some((option) => !option.text?.trim())) {
            throw new Error("OPTION_TEXT_REQUIRED");
        }

        const correctOptions = question.options.filter(
            (option) => option.isCorrect === true
        );

        if (question.type === quizTypeEnum.MCQ) {
            if (question.options.length < 2) {
                throw new Error("MCQ_REQUIRES_AT_LEAST_TWO_OPTIONS");
            }
            if (correctOptions.length !== 1) {
                throw new Error("MCQ_MUST_HAVE_ONE_CORRECT_OPTION");
            }
        }

        if (question.type === quizTypeEnum.TRUE_FALSE) {
            if (question.options.length !== 2) {
                throw new Error("TRUE_FALSE_REQUIRES_TWO_OPTIONS");
            }
            if (correctOptions.length !== 1) {
                throw new Error("TRUE_FALSE_MUST_HAVE_ONE_CORRECT_OPTION");
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
        throw new Error("QUIZ_ALREADY_EXISTS");
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
            throw new Error("QUIZ_ALREADY_EXISTS");
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
        throw new Error("QUIZ_NOT_FOUND");
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
        throw new Error("QUIZ_NOT_FOUND");
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
        throw new Error("QUIZ_NOT_FOUND");
    }

    const question = await dbService.findOne({
        model: "teacherCourseQuizQuestion",
        where: { id: questionId, quizId: section.quiz.id },
        include: { options: true },
    });

    if (!question) {
        throw new Error("QUESTION_NOT_FOUND");
    }

    const data = {};

    if (text !== undefined) {
        data.text = text;
    }

    if (correctOptionId !== undefined) {
        if (question.type === quizTypeEnum.WRITTEN) {
            throw new Error("WRITTEN_QUESTION_HAS_NO_OPTIONS");
        }

        const optionExists = question.options.some(
            (option) => option.id === correctOptionId
        );

        if (!optionExists) {
            throw new Error("OPTION_NOT_FOUND");
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

    await getOwnedSection(
        sectionId,
        teacher.id
    );

    const quiz = await dbService.findOne({
        model: "teacherCourseQuiz",
        where: {
            sectionId,
        },
    });

    if (!quiz) {
        throw new Error("QUIZ_NOT_FOUND");
    }

    await dbService.delete({
        model: "teacherCourseQuiz",
        where: {
            id: quiz.id,
        },
    });

    return {
        message: "QUIZ_DELETED_SUCCESS",
    };
};