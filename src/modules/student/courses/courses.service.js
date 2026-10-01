import * as db from "../../../db/db.service.js";
import { courseStatusEnum } from "../../../utils/Enums/courseStatus.enum.js";

export const toggleFavouriteService = async (userId, courseId, isFavourite) => {
  const student = await db.findFirst({ model: "student", where: { userId } });
  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  const course = await db.findFirst({
    model: "course",
    where: { id: courseId },
  });
  if (!course) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  const favorite = await db.upsertOne({
    model: "courseFavorite",
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId,
      },
    },
    create: {
      studentId: student.id,
      courseId,
      isFavourite,
    },
    update: { isFavourite },
  });
  return {
    isFavourite: favorite.isFavourite,
    message: favorite.isFavourite
      ? "COURSE_ADDED_TO_FAVORITES"
      : "COURSE_REMOVED_FROM_FAVORITES",
  };
};

export const getAllFavoritesService = async (userId, query = {}) => {
      const { search, page = 1, limit = 10, locale = "ar" } = query;
  const student = await db.findFirst({
    model: "student",
    where: { userId },
    select: { id: true },
  });
  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  const where = {
    studentId: student.id,
    isFavourite: true,
    course: {
      status: courseStatusEnum.PUBLISHED,
      ...(search
        ? {
            translations: {
              some: {
                title: { contains: search, mode: "insensitive" },
              },
            },
          }
        : {}),
    },
  };
  const course = await db.findManyWithPaginationAndCount({
    model: "courseFavorite",
    where,
    page: Number(page),
    limit: Number(limit),
    orderBy: { updatedAt: "desc" },
    include: {
      course: {
        include: {
          translations: {
            where: { locale },
          },
          instructor: {
            select: {
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      },
    },
  });
  return course;
};

