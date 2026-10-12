import * as db from "../../../db/db.service.js";

const studentSelect = {
  select: { id: true, fullName: true, email: true, profilePhoto: true },
};

export const getReviewsService = async (query = {}) => {
  const { page = 1, limit = 10, search = "", rating, isHidden, type } = query;

  const where = {
    ...(isHidden !== undefined && { isHidden: isHidden === true || isHidden === "true" }),
    ...(rating && { rating: Number(rating) }),
    ...(search && { comment: { contains: search, mode: "insensitive" } }),
  };

  if (type === "TEACHER") {
    return await db.findManyWithPaginationAndCount({
      model: "teacherReview",
      where,
      page,
      limit,
      include: {
        student: studentSelect,
        teacher: { include: { user: { select: { fullName: true } } } },
      },
    });
  }

  if (type === "COURSE") {
    return await db.findManyWithPaginationAndCount({
      model: "courseReview",
      where,
      page,
      limit,
      include: {
        student: studentSelect,
        course: { select: { id: true, translations: true } },
      },
    });
  }

  const [courses, sessions] = await Promise.all([
    db.findManyWithPaginationAndCount({
      model: "courseReview",
      where,
      page,
      limit,
      include: {
        student: studentSelect,
        course: { select: { id: true, translations: true } },
      },
    }),
    db.findManyWithPaginationAndCount({
      model: "teacherReview",
      where,
      page,
      limit,
      include: {
        student: studentSelect,
        teacher: { include: { user: { select: { fullName: true } } } },
      },
    }),
  ]);

  return { courses, sessions };
};

export const getReviewByIdService = async ({ reviewId }, { type } = {}) => {
  let model = type === "TEACHER" ? "teacherReview" : "courseReview";
  let review = await db.findOne({
    model,
    where: { id: reviewId },
    include: {
      student: studentSelect,
      ...(model === "courseReview"
        ? { course: { select: { id: true, translations: true, thumbnail: true } } }
        : { teacher: { include: { user: studentSelect } } }),
    },
  });

  if (!review && !type) {
    model = "teacherReview";
    review = await db.findOne({
      model,
      where: { id: reviewId },
      include: {
        student: studentSelect,
        teacher: { include: { user: studentSelect } },
      },
    });
  }

  if (!review) {
    const error = new Error("REVIEW_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return { review, type: model === "teacherReview" ? "TEACHER" : "COURSE" };
};

export const toggleReviewVisibilityService = async ({ reviewId }, { isHidden } = {}, { type } = {}) => {
  let model = type === "TEACHER" ? "teacherReview" : "courseReview";
  let review = await db.findOne({ model, where: { id: reviewId } });

  if (!review && !type) {
    model = "teacherReview";
    review = await db.findOne({ model, where: { id: reviewId } });
  }

  if (!review) {
    const error = new Error("REVIEW_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const nextHidden = isHidden !== undefined ? Boolean(isHidden === true || isHidden === "true") : !review.isHidden;

  const updated = await db.updateOne({
    model,
    where: { id: reviewId },
    data: { isHidden: nextHidden },
  });

  return { id: updated.id, isHidden: updated.isHidden };
};

export const deleteReviewService = async ({ reviewId }, { type } = {}) => {
  let model = type === "TEACHER" ? "teacherReview" : "courseReview";
  let review = await db.findOne({ model, where: { id: reviewId } });

  if (!review && !type) {
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
  const [totalCourses, totalTeachers, hiddenCourses, hiddenTeachers] = await Promise.all([
    db.count({ model: "courseReview" }),
    db.count({ model: "teacherReview" }),
    db.count({ model: "courseReview", where: { isHidden: true } }),
    db.count({ model: "teacherReview", where: { isHidden: true } }),
  ]);

  const totalReviews = totalCourses + totalTeachers;
  const hiddenReviews = hiddenCourses + hiddenTeachers;

  return {
    totalReviews,
    visibleReviews: totalReviews - hiddenReviews,
    hiddenReviews,
    courseReviewsCount: totalCourses,
    teacherReviewsCount: totalTeachers,
  };
};
