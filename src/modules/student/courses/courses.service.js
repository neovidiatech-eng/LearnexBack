import * as db from "../../../db/db.service.js";
import { courseStatusEnum } from "../../../utils/Enums/courseStatus.enum.js";
import { enrollmentTypeEnum } from "../../../utils/Enums/enrollmentType.enum.js";
import { coursesType } from "../../../utils/Enums/teacherCourse.enum.js";
import redis from "../../../config/redis.config.js";

export const toggleFavouriteService = async (
  userId,
  courseId,
  itemType = coursesType.COURSE,
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
            t.title?.toLowerCase().includes(search.toLowerCase()),
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
          const matchName = course.name
            ?.toLowerCase()
            .includes(search.toLowerCase());
          if (!matchName) return null;
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
    }),
  );

  const filtered = enrichedItems.filter(Boolean);
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const total = filtered.length;
  const paginated = filtered.slice(
    (pageNum - 1) * limitNum,
    pageNum * limitNum,
  );

  return {
    items: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

/**
 * POST /student/courses/:courseId/enroll
 * Direct enrollment for FREE courses.
 */
export const enrollFreeCourseService = async (userId, courseId) => {
  const course = await db.findOne({
    model: "course",
    where: { id: courseId },
    select: {
      id: true,
      status: true,
      enrollmentType: true,
      totalStudentsCount: true,
    },
  });

  if (!course) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (course.status !== courseStatusEnum.PUBLISHED) {
    const error = new Error("COURSE_NOT_PUBLISHED");
    error.cause = 400;
    throw error;
  }

  if (course.enrollmentType !== enrollmentTypeEnum.FREE) {
    const error = new Error("COURSE_IS_NOT_FREE");
    error.cause = 400;
    throw error;
  }

  const existing = await db.findFirst({
    model: "courseEnrollment",
    where: { studentId: userId, courseId },
  });

  if (existing) {
    const error = new Error("ALREADY_ENROLLED");
    error.cause = 409;
    throw error;
  }

  const enrollment = await db.create({
    model: "courseEnrollment",
    data: {
      studentId: userId,
      courseId,
      status: "ACTIVE",
      paidAmount: 0,
      progressPercent: 0,
    },
  });

  await db.updateOne({
    model: "course",
    where: { id: courseId },
    data: {
      totalStudentsCount: (course.totalStudentsCount || 0) + 1,
    },
  });

  return enrollment;
};

/**
 * GET /student/courses/enrolled (or /my-learning)
 * Returns all courses the student is currently enrolled in with their progress.
 */
export const getEnrolledCoursesService = async (userId, query = {}) => {
  const { search, status, page = 1, limit = 10, locale = "ar" } = query;

  const where = {
    studentId: userId,
    ...(status ? { status } : {}),
    ...(search
      ? {
          course: {
            translations: {
              some: {
                title: { contains: search, mode: "insensitive" },
              },
            },
          },
        }
      : {}),
  };

  const result = await db.findManyWithPaginationAndCount({
    model: "courseEnrollment",
    where,
    page: Number(page),
    limit: Number(limit),
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          translations: { where: { locale } },
          category: {
            select: {
              id: true,
              slug: true,
              translations: { where: { locale } },
            },
          },
          instructor: {
            select: { id: true, fullName: true, profilePhoto: true },
          },
        },
      },
    },
  });

  return {
    enrolledCourses: result.items,
    pagination: result.pagination,
  };
};

/**
 * GET /student/courses
 * Browse published courses catalog with filters, search, and sorting.
 */
export const getCourseCatalogService = async (userId, query = {}) => {
  const {
    search,
    categoryId,
    level,
    enrollmentType,
    minPrice,
    maxPrice,
    sortBy = "newest",
    page = 1,
    limit = 10,
    locale = "ar",
  } = query;

  const where = {
    status: courseStatusEnum.PUBLISHED,
    ...(categoryId ? { categoryId } : {}),
    ...(level ? { level } : {}),
    ...(enrollmentType ? { enrollmentType } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          originalPrice: {
            ...(minPrice !== undefined ? { gte: Number(minPrice) } : {}),
            ...(maxPrice !== undefined ? { lte: Number(maxPrice) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          translations: {
            some: {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        }
      : {}),
  };

  let orderBy = { createdAt: "desc" };
  if (sortBy === "rating") {
    orderBy = { avgRating: "desc" };
  } else if (sortBy === "popular") {
    orderBy = { totalStudentsCount: "desc" };
  } else if (sortBy === "price_asc") {
    orderBy = { originalPrice: "asc" };
  } else if (sortBy === "price_desc") {
    orderBy = { originalPrice: "desc" };
  }

  const result = await db.findManyWithPaginationAndCount({
    model: "course",
    where,
    page: Number(page),
    limit: Number(limit),
    orderBy,
    include: {
      translations: { where: { locale } },
      category: {
        select: {
          id: true,
          slug: true,
          translations: { where: { locale } },
        },
      },
      instructor: {
        select: {
          id: true,
          fullName: true,
          profilePhoto: true,
        },
      },
    },
  });

  const courseIds = result.items.map((c) => c.id);
  let enrollmentMap = new Map();
  if (courseIds.length > 0) {
    const userEnrollments = await db.findMany({
      model: "courseEnrollment",
      where: {
        studentId: userId,
        courseId: { in: courseIds },
      },
      select: { courseId: true, progressPercent: true, status: true },
    });
    enrollmentMap = new Map(userEnrollments.map((e) => [e.courseId, e]));
  }

  const enrichedCourses = result.items.map((course) => {
    const enrollment = enrollmentMap.get(course.id);
    return {
      ...course,
      type: coursesType.COURSE,
      isEnrolled: !!enrollment,
      progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
      enrollmentStatus: enrollment ? enrollment.status : null,
    };
  });

  return {
    courses: enrichedCourses,
    pagination: result.pagination,
  };
};

/**
 * GET /student/courses/categories
 * Browse available course categories with translations and course count.
 */
export const getCategoriesService = async (userId, query = {}) => {
  const { locale = "ar" } = query;

  const categories = await db.findMany({
    model: "category",
    include: {
      translations: {
        where: { locale },
        select: { id: true, locale: true, name: true, description: true },
      },
    },
    orderBy: { coursesCount: "desc" },
  });

  return { categories };
};

/**
 * GET /student/courses/:courseId
 * Course details with sections, lessons, previews gating, and student enrollment status.
 */
export const getCourseDetailsService = async (userId, courseId, query = {}) => {
  const { locale = "ar" } = query;

  const course = await db.findOne({
    model: "course",
    where: { id: courseId },
    include: {
      translations: { where: { locale } },
      category: {
        select: {
          id: true,
          slug: true,
          translations: { where: { locale } },
        },
      },
      instructor: {
        select: {
          id: true,
          fullName: true,
          profilePhoto: true,
        },
      },
      sections: {
        orderBy: { order: "asc" },
        include: {
          translations: { where: { locale } },
          lessons: {
            orderBy: { order: "asc" },
            include: {
              translations: { where: { locale } },
            },
          },
        },
      },
    },
  });

  if (!course) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const enrollment = await db.findFirst({
    model: "courseEnrollment",
    where: { studentId: userId, courseId },
  });
  const isEnrolled = !!enrollment;

  // Gate contentUrl for lessons if not enrolled and not free preview
  const processedSections = (course.sections || []).map((section) => ({
    ...section,
    lessons: (section.lessons || []).map((lesson) => ({
      ...lesson,
      contentUrl: isEnrolled || lesson.isFreePreview ? lesson.contentUrl : null,
      isLocked: !isEnrolled && !lesson.isFreePreview,
    })),
  }));

  const userReview = await db.findFirst({
    model: "courseReview",
    where: { studentId: userId, courseId },
  });

  return {
    course: {
      ...course,
      type: coursesType.COURSE,
      sections: processedSections,
    },
    isEnrolled,
    enrollment: enrollment || null,
    progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
    userReview: userReview || null,
  };
};

/**
 * POST /student/courses/:courseId/lessons/:lessonId/complete
 * Mark a lesson as completed, calculate progress percent and update enrollment.
 */
export const completeLessonService = async (userId, courseId, lessonId) => {
  const enrollment = await db.findFirst({
    model: "courseEnrollment",
    where: { studentId: userId, courseId },
  });

  if (!enrollment) {
    const error = new Error("NOT_ENROLLED_IN_COURSE");
    error.cause = 403;
    throw error;
  }

  const lesson = await db.findFirst({
    model: "courseLesson",
    where: { id: lessonId },
    include: { section: true },
  });

  if (!lesson || lesson.section?.courseId !== courseId) {
    const error = new Error("LESSON_NOT_FOUND_IN_COURSE");
    error.cause = 404;
    throw error;
  }

  const totalLessons = await db.count({
    model: "courseLesson",
    where: {
      section: { courseId },
    },
  });
  const total = totalLessons || 1;

  let completedCount = 1;
  let completedLessonIds = [];
  try {
    const redisKey = `student_lessons:${userId}:${courseId}`;
    await redis.sadd(redisKey, lessonId);
    completedLessonIds = await redis.smembers(redisKey);
    completedCount = completedLessonIds.length;
  } catch {
    const currentProgress = Number(enrollment.progressPercent || 0);
    const step = 100 / total;
    const newProgress = Math.min(100, Math.round(currentProgress + step));
    completedCount = Math.max(1, Math.round((newProgress / 100) * total));
    completedLessonIds = [lessonId];
  }

  const progressPercent = Math.min(
    100,
    Math.round((completedCount / total) * 100),
  );
  const isCompleted = progressPercent >= 100;

  const updatedEnrollment = await db.updateOne({
    model: "courseEnrollment",
    where: { id: enrollment.id },
    data: {
      progressPercent,
      ...(isCompleted ? { status: "COMPLETED", completedAt: new Date() } : {}),
    },
  });

  return {
    enrollment: updatedEnrollment,
    progressPercent,
    isCompleted,
    completedLessonIds,
  };
};

// /**
//  * POST /student/courses/:courseId/reviews
//  * Add or update student review and recalculate course average rating.
//  */
// export const addCourseReviewService = async (userId, courseId, body) => {
//   const { rating, comment } = body;

//   const enrollment = await db.findFirst({
//     model: "courseEnrollment",
//     where: { studentId: userId, courseId },
//   });

//   if (!enrollment) {
//     const error = new Error("ENROLLMENT_REQUIRED_TO_REVIEW");
//     error.cause = 403;
//     throw error;
//   }

//   const review = await db.upsertOne({
//     model: "courseReview",
//     where: {
//       studentId_courseId: {
//         studentId: userId,
//         courseId,
//       },
//     },
//     update: { rating: Number(rating), comment },
//     create: { studentId: userId, courseId, rating: Number(rating), comment },
//   });

//   const { avgRating, reviewsCount } = await recalculateReview({
//     model: "courseReview",
//     where: { courseId, isHidden: false },
//     parentModel: "course",
//     parentId: courseId,
//   });
//   return {
//     review,
//     avgRating,
//     reviewsCount,
//   };
// };

// /**
//  * GET /student/courses/:courseId/reviews
//  * Get paginated course reviews with rating breakdown.
//  */
// export const getCourseReviewsService = async (userId, courseId, query = {}) => {
//   const { page = 1, limit = 10 } = query;

//   const result = await db.findManyWithPaginationAndCount({
//     model: "courseReview",
//     where: { courseId },
//     page: Number(page),
//     limit: Number(limit),
//     orderBy: { createdAt: "desc" },
//     include: {
//       student: {
//         select: {
//           id: true,
//           fullName: true,
//           profilePhoto: true,
//         },
//       },
//     },
//   });

//   const allRatings = await db.findMany({
//     model: "courseReview",
//     where: { courseId },
//     select: { rating: true },
//   });

//   const total = allRatings.length;
//   const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
//   allRatings.forEach((r) => {
//     if (starCounts[r.rating] !== undefined) starCounts[r.rating]++;
//   });

//   const distribution = {
//     5: total ? Number((starCounts[5] / total).toFixed(2)) : 0,
//     4: total ? Number((starCounts[4] / total).toFixed(2)) : 0,
//     3: total ? Number((starCounts[3] / total).toFixed(2)) : 0,
//     2: total ? Number((starCounts[2] / total).toFixed(2)) : 0,
//     1: total ? Number((starCounts[1] / total).toFixed(2)) : 0,
//   };

//   const enrichedReviews = result.items.map((r) => ({
//     ...r,
//     isMine: r.studentId === userId,
//   }));

//   return {
//     reviews: enrichedReviews,
//     pagination: result.pagination,
//     totalReviews: total,
//     distribution,
//     starCounts,
//   };
// };

// /**
//  * DELETE /student/courses/:courseId/reviews
//  * Delete student's review and recalculate course average rating.
//  */
// export const deleteCourseReviewService = async (userId, courseId) => {
//   const review = await db.findFirst({
//     model: "courseReview",
//     where: { studentId: userId, courseId },
//   });

//   if (!review) {
//     const error = new Error("REVIEW_NOT_FOUND");
//     error.cause = 404;
//     throw error;
//   }

//   await db.deleteOne({
//     model: "courseReview",
//     where: { id: review.id },
//   });

//   const allReviews = await db.findMany({
//     model: "courseReview",
//     where: { courseId },
//     select: { rating: true },
//   });

//   const reviewsCount = allReviews.length;
//   const avgRating =
//     reviewsCount > 0
//       ? Number(
//           (
//             allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
//           ).toFixed(2),
//         )
//       : 0.0;

//   await db.updateOne({
//     model: "course",
//     where: { id: courseId },
//     data: { avgRating, reviewsCount },
//   });

//   return {
//     message: "REVIEW_DELETED_SUCCESSFULLY",
//     avgRating,
//     reviewsCount,
//   };
// };
