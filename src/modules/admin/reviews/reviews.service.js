import * as db from "../../../db/db.service.js";

const courseReviewInclude = {
  student: {
    select: { id: true, fullName: true, email: true, profilePhoto: true },
  },
  course: {
    select: {
      id: true,
      thumbnail: true,
      translations: { select: { locale: true, title: true } },
      instructor: {
        select: { id: true, fullName: true, email: true, profilePhoto: true },
      },
    },
  },
};

const teacherReviewInclude = {
  student: {
    select: { id: true, fullName: true, email: true, profilePhoto: true },
  },
  teacher: {
    include: {
      user: {
        select: { id: true, fullName: true, email: true, profilePhoto: true },
      },
    },
  },
};

export const getReviewsService = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    rating,
    isHidden,
    type,
    subType,
    courseId,
    teacherId,
  } = query;

  const normalizedType = type?.toUpperCase();
  const normalizedSubType = subType?.toUpperCase();

  const where = {
    ...(isHidden !== undefined && { isHidden: isHidden === true || isHidden === "true" }),
    ...(rating && { rating: Number(rating) }),
    ...(search && { comment: { contains: search, mode: "insensitive" } }),
  };

  if (normalizedType === "COURSE") {
    return await db.findManyWithPaginationAndCount({
      model: "courseReview",
      where: {
        ...where,
        ...(courseId && { courseId }),
        course: { instructor: { teacher: null } },
      },
      page,
      limit,
      include: courseReviewInclude,
    });
  }

  if (normalizedType === "TEACHER") {
    const teacherCourseWhere = {
      ...where,
      ...(courseId && { courseId }),
      course: {
        instructor: {
          teacher: { isNot: null },
          ...(teacherId && { OR: [{ id: teacherId }, { teacher: { id: teacherId } }] }),
        },
      },
    };

    const teacherSessionWhere = {
      ...where,
      ...(teacherId && { OR: [{ teacherId }, { teacher: { userId: teacherId } }] }),
    };

    if (normalizedSubType === "COURSE") {
      return await db.findManyWithPaginationAndCount({
        model: "courseReview",
        where: teacherCourseWhere,
        page,
        limit,
        include: courseReviewInclude,
      });
    }

    if (normalizedSubType === "SESSION") {
      return await db.findManyWithPaginationAndCount({
        model: "teacherReview",
        where: teacherSessionWhere,
        page,
        limit,
        include: teacherReviewInclude,
      });
    }

    const [courses, sessions] = await Promise.all([
      db.findManyWithPaginationAndCount({
        model: "courseReview",
        where: teacherCourseWhere,
        page,
        limit,
        include: courseReviewInclude,
      }),
      db.findManyWithPaginationAndCount({
        model: "teacherReview",
        where: teacherSessionWhere,
        page,
        limit,
        include: teacherReviewInclude,
      }),
    ]);

    return { courses, sessions };
  }

  const [courses, sessions] = await Promise.all([
    db.findManyWithPaginationAndCount({
      model: "courseReview",
      where: { ...where, ...(courseId && { courseId }) },
      page,
      limit,
      include: courseReviewInclude,
    }),
    db.findManyWithPaginationAndCount({
      model: "teacherReview",
      where: { ...where, ...(teacherId && { teacherId }) },
      page,
      limit,
      include: teacherReviewInclude,
    }),
  ]);

  return { courses, sessions };
};

export const getReviewByIdService = async ({ reviewId }) => {
  let review = await db.findOne({
    model: "courseReview",
    where: { id: reviewId },
    include: courseReviewInclude,
  });

  if (review) {
    const isTeacher = Boolean(review.course?.instructor?.teacher);
    return {
      review,
      type: isTeacher ? "TEACHER" : "COURSE",
      subType: isTeacher ? "COURSE" : "ADMIN_COURSE",
    };
  }

  review = await db.findOne({
    model: "teacherReview",
    where: { id: reviewId },
    include: teacherReviewInclude,
  });

  if (!review) {
    const error = new Error("REVIEW_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return { review, type: "TEACHER", subType: "SESSION" };
};

export const toggleReviewVisibilityService = async ({ reviewId }, { isHidden } = {}) => {
  let model = "courseReview";
  let review = await db.findOne({ model, where: { id: reviewId } });

  if (!review) {
    model = "teacherReview";
    review = await db.findOne({ model, where: { id: reviewId } });
  }

  if (!review) {
    const error = new Error("REVIEW_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const nextHidden =
    isHidden !== undefined
      ? Boolean(isHidden === true || isHidden === "true")
      : !review.isHidden;

  const updated = await db.updateOne({
    model,
    where: { id: reviewId },
    data: { isHidden: nextHidden },
  });

  return { id: updated.id, isHidden: updated.isHidden };
};

export const deleteReviewService = async ({ reviewId }) => {
  let model = "courseReview";
  let review = await db.findOne({ model, where: { id: reviewId } });

  if (!review) {
    model = "teacherReview";
    review = await db.findOne({ model, where: { id: reviewId } });
  }

  if (!review) {
    const error = new Error("REVIEW_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await db.deleteOne({ model, where: { id: reviewId } });
  return { success: true };
};

export const getReviewStatsService = async () => {
  const [adminCourses, teacherCourses, sessions, hiddenAdmin, hiddenTeacherCourses, hiddenSessions] =
    await Promise.all([
      db.count({ model: "courseReview", where: { course: { instructor: { teacher: null } } } }),
      db.count({ model: "courseReview", where: { course: { instructor: { teacher: { isNot: null } } } } }),
      db.count({ model: "teacherReview" }),
      db.count({ model: "courseReview", where: { course: { instructor: { teacher: null } }, isHidden: true } }),
      db.count({ model: "courseReview", where: { course: { instructor: { teacher: { isNot: null } } }, isHidden: true } }),
      db.count({ model: "teacherReview", where: { isHidden: true } }),
    ]);

  const totalReviews = adminCourses + teacherCourses + sessions;
  const hiddenReviews = hiddenAdmin + hiddenTeacherCourses + hiddenSessions;

  return {
    totalReviews,
    visibleReviews: totalReviews - hiddenReviews,
    hiddenReviews,
    adminCoursesCount: adminCourses,
    teacherCoursesCount: teacherCourses,
    teacherSessionsCount: sessions,
  };
};
