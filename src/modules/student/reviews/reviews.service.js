import * as db from "../../../db/db.service.js";
import { checkReviewEligibility, recalculateReview } from "../../../utils/helpers/reviews.helper.js";

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


export const getReviewsService = async (userId, query = {}) => {
  const { courseId, teacherId, page = 1, limit = 10 } = query;
  const isCourse = Boolean(courseId);
  const model = isCourse ? "courseReview" : "teacherReview";
  const where = isCourse ? { courseId } : { teacherId };

  const result = await db.findManyWithPaginationAndCount({
    model,
    where: { ...where, isHidden: false },
    page: Number(page),
    limit: Number(limit),
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, fullName: true, profilePhoto: true } },
    },
  });

  return {
    reviews: result.items.map((r) => ({
      ...r,
      isMine: r.studentId === userId,
    })),
    pagination: result.pagination,
  };
};



