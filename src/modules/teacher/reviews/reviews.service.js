import * as db from "../../../db/db.service.js";

export const getReviewsService = async (userId, query = {}) => {
  const { page = 1, limit = 10, search = "" } = query;
  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const searchFilter = search
    ? { comment: { contains: search, mode: "insensitive" } }
    : {};

  const [sessionReviews, courseReviews] = await Promise.all([
    db.findManyWithPaginationAndCount({
      model: "teacherReview",
      where: {
        teacherId: teacher.id,
        isHidden: false,
        ...searchFilter,
      },
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: { id: true, fullName: true, profilePhoto: true },
        },
      },
    }),

    db.findManyWithPaginationAndCount({
      model: "courseReview",
      where: {
        course: { instructorId: userId },
        isHidden: false,
        ...searchFilter,
      },
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: { id: true, fullName: true, profilePhoto: true },
        },
        course: {
          select: {
            id: true,
            translations: { select: { locale: true, title: true } },
          },
        },
      },
    }),
  ]);

  return {
    sessions: sessionReviews, 
    courses: courseReviews, 
  };
};
