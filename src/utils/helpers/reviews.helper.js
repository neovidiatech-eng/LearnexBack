import * as db from "../../db/db.service.js";

export const checkReviewEligibility = async (
  userId,
  { courseId, teacherId },
) => {
  if (courseId) {
    const enrollment = await db.findFirst({
      model: "courseEnrollment",
      where: { studentId: userId, courseId },
    });
    if (!enrollment) {
      const error = new Error("ENROLLMENT_REQUIRED_TO_REVIEW");
      error.cause = 403;
      throw error;
    }
    return;
  }

  if (teacherId) {
    const teacher = await db.findFirst({
      model: "teacher",
      where: { id: teacherId },
    });
    if (!teacher) {
      const error = new Error("TEACHER_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
    if (teacher.userId === userId) {
      const error = new Error("CANNOT_REVIEW_YOURSELF");
      error.cause = 400;
      throw error;
    }
    return;
  }

  const error = new Error("COURSE_OR_TEACHER_REQUIRED");
  error.cause = 400;
  throw error;
};

export const recalculateReview = async ({
  model,
  where,
  parentModel,
  parentId,
}) => {
  const reviews = await db.findMany({ model, where, select: { rating: true } });

  const reviewsCount = reviews.length;
  const avgRating = reviewsCount
    ? Number(
        (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(
          2,
        ),
      )
    : 0;

  await db.updateOne({
    model: parentModel,
    where: { id: parentId },
    data: { avgRating, reviewsCount },
  });

  return { avgRating, reviewsCount };
};
