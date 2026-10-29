import * as db from "../../../db/db.service.js";
import { notificationTypeEnum, priorityEnum, reciverNotificationEnum } from "../../../utils/Enums/notifications.js";
import { notify } from "../../../utils/helpers/notify.helper.js";
import {
  checkReviewEligibility,
  recalculateReview,
} from "../../../utils/helpers/reviews.helper.js";


export const addReviewService = async (userId, body) => {
  let { type, courseId, teacherId, targetId, rating, comment, bookingId } =
    body;

  if (type === "COURSE" && targetId && !courseId) {
    courseId = targetId;
  }
  if (type === "TEACHER" && targetId && !teacherId) {
    teacherId = targetId;
  }

  await checkReviewEligibility(userId, { courseId, teacherId });

  const isCourse = type
    ? type === "COURSE" || type === "TEACHER_COURSE"
    : Boolean(courseId);
  let model = "courseReview";
  let parentModel = "course";
  let parentId = courseId;
  let notifType = notificationTypeEnum.COURSE_REVIEW_CREATED;
  let include = { course: { select: { instructorId: true } } }; 

  if (isCourse) {
    const isPlatformCourse = await db.findFirst({
      model: "course",
      where: { id: courseId },
      select: { id: true },
    });
    if (!isPlatformCourse) {
      model = "teacherCourseReview";
      parentModel = "teacherCourse";
      include = {
        course: { select: { teacher: { select: { userId: true } } } },
      };
    }
  } else {
    model = "teacherReview";
    parentModel = "teacher";
    parentId = teacherId;
    notifType = notificationTypeEnum.TEACHER_REVIEW_CREATED; 
    include = { teacher: { select: { userId: true } } }; 
  }

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
    include, 
  });

  const { avgRating, reviewsCount } = await recalculateReview({
    model,
    where: isCourse
      ? { courseId, isHidden: false }
      : { teacherId, isHidden: false },
    parentModel,
    parentId,
  });

  const receiverUserId = !isCourse
    ? review.teacher?.userId
    : model === "courseReview"
      ? review.course?.instructorId
      : review.course?.teacher?.userId;

  if (receiverUserId && receiverUserId !== userId) {
    await notify({
      receiverId: receiverUserId,
      receiverType: reciverNotificationEnum.USER,
      type: notifType,
      priority: priorityEnum.HIGH,
    });
  }

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
