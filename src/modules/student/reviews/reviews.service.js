import * as db from "../../../db/db.service.js";
import {
  checkReviewEligibility,
  recalculateReview,
} from "../../../utils/helpers/reviews.helper.js";

export const addReviewService = async (userId, body) => {
  const { courseId, teacherId, rating, comment, bookingId } = body;

  await checkReviewEligibility(userId, { courseId, teacherId });

  const isCourse = Boolean(courseId);
  const model = isCourse ? "courseReview" : "teacherReview";
  const parentModel = isCourse ? "course" : "teacher";
  const parentId = courseId || teacherId;

  const review = await db.upsertOne({
    model,
    where: isCourse
      ? { studentId_courseId: { studentId: userId, courseId } }
      : { studentId_teacherId: { studentId: userId, teacherId } },
    update: {
      rating: Number(rating),
      comment,
      ...(!isCourse && bookingId && { bookingId }),
    },
    create: {
      studentId: userId,
      rating: Number(rating),
      comment,
      ...(isCourse
        ? { courseId }
        : { teacherId, bookingId: bookingId || null }),
      isHidden: false,
    },
  });

  const { avgRating, reviewsCount } = await recalculateReview({
    model,
    where: isCourse
      ? { courseId, isHidden: false }
      : { teacherId, isHidden: false },
    parentModel,
    parentId,
  });

  return { review, avgRating, reviewsCount };
};

export const getReviewsService = async (userId) => {
  const [courseReviews, teacherReviews] = await Promise.all([
    db.findMany({
      model: "courseReview",
      where: { studentId: userId, isHidden: false },
      include: {
        course: {
          select: {
            id: true,
            thumbnail: true,
            translations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.findMany({
      model: "teacherReview",
      where: { studentId: userId, isHidden: false },
      include: {
        teacher: {
          select: {
            id: true,
            subject: true,
            user: {
              select: { id: true, fullName: true, profilePhoto: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    courseReviews,
    teacherReviews,
  };
};
