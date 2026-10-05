import * as db from "../../../db/db.service.js";
import { courseStatusEnum } from "../../../utils/Enums/courseStatus.enum.js";
import { coursesType } from "../../../utils/Enums/teacherCourse.enum.js";

export const toggleFavouriteService = async (
  userId,
  courseId,
  itemType = coursesType.COURSE
) => {
  const student = await db.findFirst({ model: "student", where: { userId } });
  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (itemType === coursesType.COURSE) {
    const course = await db.findFirst({
      model: "course",
      where: { id: courseId },
    });
    if (!course) {
      const error = new Error("COURSE_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
  } else if (itemType === coursesType.TEACHER_COURSE) {
    const course = await db.findFirst({
      model: "teacherCourse",
      where: { id: courseId },
    });
    if (!course) {
      const error = new Error("COURSE_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
  }

  const existing = await db.findFirst({
    model: "courseFavorite",
    where: {
      studentId: student.id,
      itemId: courseId,
      itemType,
    },
  });

  if (!existing) {
    await db.create({
      model: "courseFavorite",
      data: {
        studentId: student.id,
        itemId: courseId,
        itemType,
      },
    });

    return {
      message: "COURSE_ADDED_TO_FAVORITES",
    };
  } else {
    await db.deleteOne({
      model: "courseFavorite",
      where: {
        id: existing.id,
      },
    });

    return {
      message: "COURSE_REMOVED_FROM_FAVORITES",
    };
  }
};

export const getAllFavoritesService = async (userId, query = {}) => {
  const { search, page = 1, limit = 10, locale = "ar", itemType } = query;
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
    ...(itemType ? { itemType } : {}),
  };

  const favorites = await db.findMany({
    model: "courseFavorite",
    where,
    orderBy: { updatedAt: "desc" },
  });

  const enrichedItems = await Promise.all(
    favorites.map(async (fav) => {
      if (fav.itemType === coursesType.COURSE) {
        const course = await db.findOne({
          model: "course",
          where: { id: fav.itemId, status: courseStatusEnum.PUBLISHED },
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
        });

        if (!course) return null;

        if (search) {
          const matchTitle = course.translations?.some((t) =>
            t.title?.toLowerCase().includes(search.toLowerCase())
          );
          if (!matchTitle) return null;
        }

        return {
          ...fav,
          course,
        };
      } else if (fav.itemType === coursesType.TEACHER_COURSE) {
        const course = await db.findOne({
          model: "teacherCourse",
          where: { id: fav.itemId, status: "APPROVED" },
          include: {
            translations: {
              where: { locale },
            },
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    profilePhoto: true,
                  },
                },
              },
            },
          },
        });

        if (!course) return null;

        if (search) {
          const matchTitle = course.translations?.some((t) =>
            t.title?.toLowerCase().includes(search.toLowerCase())
          );
          if (!matchTitle) return null;
        }

        return {
          ...fav,
          course: {
            ...course,
            instructor: course.teacher?.user ?? null,
          },
        };
      }
      return fav;
    })
  );

  const filtered = enrichedItems.filter(Boolean);
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const total = filtered.length;
  const paginated = filtered.slice(
    (pageNum - 1) * limitNum,
    pageNum * limitNum
  );

  return {
    items: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};
