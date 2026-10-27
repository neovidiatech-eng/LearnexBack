import * as db from "../../../db/db.service.js";
import { courseStatusEnum } from "../../../utils/Enums/courseStatus.enum.js";
import { enrollmentTypeEnum } from "../../../utils/Enums/enrollmentType.enum.js";
import { coursesType } from "../../../utils/Enums/teacherCourse.enum.js";
import redis from "../../../config/redis.config.js";
import { createSystemRequest } from "../../../utils/helpers/requests.helper.js";
import {
  requestPriorityEnum,
  requestReferenceModelEnum,
  requestTabEnum,
  requestTypeEnum,
} from "../../../utils/Enums/request.enum.js";

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
  let course = await db.findOne({
    model: "course",
    where: { id: courseId },
    select: {
      id: true,
      status: true,
      enrollmentType: true,
      totalStudentsCount: true,
    },
  });

  let isTeacherCourse = false;
  if (!course) {
    const teacherCourse = await db.findOne({
      model: "teacherCourse",
      where: { id: courseId },
      select: {
        id: true,
        status: true,
        price: true,
        totalStudentsCount: true,
      },
    });
    if (teacherCourse) {
      isTeacherCourse = true;
      course = teacherCourse;
    }
  }

  if (!course) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (isTeacherCourse) {
    if (course.status !== "APPROVED") {
      const error = new Error("COURSE_NOT_PUBLISHED");
      error.cause = 400;
      throw error;
    }

    if (Number(course.price || 0) > 0) {
      const error = new Error("COURSE_IS_NOT_FREE");
      error.cause = 400;
      throw error;
    }

    const existing = await db.findFirst({
      model: "teacherCourseEnrollment",
      where: { studentId: userId, courseId },
    });

    if (existing) {
      const error = new Error("ALREADY_ENROLLED");
      error.cause = 409;
      throw error;
    }

    const enrollment = await db.create({
      model: "teacherCourseEnrollment",
      data: {
        studentId: userId,
        courseId,
        status: "ACTIVE",
        paidAmount: 0,
        progressPercent: 0,
      },
    });

    await db.updateOne({
      model: "teacherCourse",
      where: { id: courseId },
      data: {
        totalStudentsCount: { increment: 1 },
      },
    });

    await createSystemRequest({
      tab: requestTabEnum.STUDENT,
      type: requestTypeEnum.COURSE_ENROLLMENT,
      priority: requestPriorityEnum.HIGH,
      requesterId: userId,
      requesterRole: requestTabEnum.STUDENT,
      referenceId: enrollment.id,
      referenceModel: requestReferenceModelEnum.COURSE_ENROLLMENT,
      details: {
        courseId: course.id,
        amount: enrollment.paidAmount,
        status: enrollment.status,
        provider: "TEACHER",
      },
    });

    return enrollment;
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
      totalStudentsCount: { increment: 1 },
    },
  });

  await createSystemRequest({
    tab: requestTabEnum.STUDENT,
    type: requestTypeEnum.COURSE_ENROLLMENT,
    priority: requestPriorityEnum.HIGH,
    requesterId: userId,
    requesterRole: requestTabEnum.STUDENT,
    referenceId: enrollment.id,
    referenceModel: requestReferenceModelEnum.COURSE_ENROLLMENT,
    details: {
      courseId: course.id,
      amount: enrollment.paidAmount,
      status: enrollment.status,
    },
  });

  return enrollment;
};

/**
 * GET /student/courses/enrolled (or /my-learning)
 * Returns all courses the student is currently enrolled in with their progress.
 */
const mapPlatformEnrollment = (enrollment, locale = "ar") => {
  const c = enrollment.course;
  if (!c) return enrollment;
  const trans =
    c.translations?.find((t) => t.locale === locale) ||
    c.translations?.[0];
  const categoryTrans =
    c.category?.translations?.find((t) => t.locale === locale) ||
    c.category?.translations?.[0];

  return {
    ...enrollment,
    provider: "PLATFORM",
    type: coursesType.COURSE,
    course: {
      ...c,
      title: trans?.title || c.title || "",
      description: trans?.description || c.description || "",
      categoryName: categoryTrans?.name || "",
      instructorName: c.instructor?.fullName || "",
      instructorPhoto: c.instructor?.profilePhoto || null,
      provider: "PLATFORM",
      type: coursesType.COURSE,
    },
  };
};

const mapTeacherEnrollment = (enrollment, locale = "ar") => {
  const c = enrollment.course;
  if (!c) return enrollment;
  const categoryTrans =
    c.category?.translations?.find((t) => t.locale === locale) ||
    c.category?.translations?.[0];

  return {
    ...enrollment,
    provider: "TEACHER",
    type: coursesType.TEACHER_COURSE,
    course: {
      ...c,
      title: c.name || "",
      name: c.name || "",
      description: c.description || "",
      thumbnail: c.wallPaper || null,
      wallPaper: c.wallPaper || null,
      categoryName: categoryTrans?.name || "",
      instructorName: c.teacher?.user?.fullName || "",
      instructorPhoto: c.teacher?.user?.profilePhoto || null,
      durationHours: c.totalHours || 0,
      totalHours: c.totalHours || 0,
      provider: "TEACHER",
      type: coursesType.TEACHER_COURSE,
    },
  };
};

/**
 * GET /student/courses/enrolled (or /my-learning)
 * Returns all courses the student is currently enrolled in with their progress.
 * Supports both platform courses and teacher courses.
 */
export const getEnrolledCoursesService = async (userId, query = {}) => {
  const {
    search,
    status,
    provider = "ALL",
    page = 1,
    limit = 10,
    locale = "ar",
  } = query;

  const normalizedProvider = (provider || "ALL").toUpperCase();
  const shouldIncludePlatform =
    normalizedProvider === "ALL" || normalizedProvider === "PLATFORM";
  const shouldIncludeTeacher =
    normalizedProvider === "ALL" || normalizedProvider === "TEACHER";

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));

  let platformItems = [];
  let teacherItems = [];
  let totalPlatformCount = 0;
  let totalTeacherCount = 0;

  if (shouldIncludePlatform) {
    const platformWhere = {
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

    if (normalizedProvider === "PLATFORM") {
      const result = await db.findManyWithPaginationAndCount({
        model: "courseEnrollment",
        where: platformWhere,
        page: pageNumber,
        limit: limitNumber,
        orderBy: { enrolledAt: "desc" },
        include: {
          course: {
            include: {
              translations: true,
              category: {
                select: {
                  id: true,
                  slug: true,
                  translations: true,
                },
              },
              instructor: {
                select: { id: true, fullName: true, profilePhoto: true },
              },
            },
          },
        },
      });

      const mapped = (result.items || []).map((enrollment) =>
        mapPlatformEnrollment(enrollment, locale)
      );

      return {
        enrolledCourses: mapped,
        pagination: result.pagination,
      };
    }

    const [items, count] = await Promise.all([
      db.findMany({
        model: "courseEnrollment",
        where: platformWhere,
        orderBy: { enrolledAt: "desc" },
        include: {
          course: {
            include: {
              translations: true,
              category: {
                select: {
                  id: true,
                  slug: true,
                  translations: true,
                },
              },
              instructor: {
                select: { id: true, fullName: true, profilePhoto: true },
              },
            },
          },
        },
      }),
      db.count({
        model: "courseEnrollment",
        where: platformWhere,
      }),
    ]);

    platformItems = items.map((e) => mapPlatformEnrollment(e, locale));
    totalPlatformCount = count;
  }

  if (shouldIncludeTeacher) {
    const teacherWhere = {
      studentId: userId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            course: {
              name: { contains: search, mode: "insensitive" },
            },
          }
        : {}),
    };

    if (normalizedProvider === "TEACHER") {
      const result = await db.findManyWithPaginationAndCount({
        model: "teacherCourseEnrollment",
        where: teacherWhere,
        page: pageNumber,
        limit: limitNumber,
        orderBy: { enrolledAt: "desc" },
        include: {
          course: {
            include: {
              category: {
                select: {
                  id: true,
                  slug: true,
                  translations: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  bio: true,
                  user: {
                    select: { id: true, fullName: true, profilePhoto: true },
                  },
                },
              },
            },
          },
        },
      });

      const mapped = (result.items || []).map((enrollment) =>
        mapTeacherEnrollment(enrollment, locale)
      );

      return {
        enrolledCourses: mapped,
        pagination: result.pagination,
      };
    }

    const [items, count] = await Promise.all([
      db.findMany({
        model: "teacherCourseEnrollment",
        where: teacherWhere,
        orderBy: { enrolledAt: "desc" },
        include: {
          course: {
            include: {
              category: {
                select: {
                  id: true,
                  slug: true,
                  translations: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  bio: true,
                  user: {
                    select: { id: true, fullName: true, profilePhoto: true },
                  },
                },
              },
            },
          },
        },
      }),
      db.count({
        model: "teacherCourseEnrollment",
        where: teacherWhere,
      }),
    ]);

    teacherItems = items.map((e) => mapTeacherEnrollment(e, locale));
    totalTeacherCount = count;
  }

  const allMerged = [...platformItems, ...teacherItems].sort(
    (a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)
  );

  const totalItems = totalPlatformCount + totalTeacherCount;
  const totalPages = Math.ceil(totalItems / limitNumber) || 1;
  const startIndex = (pageNumber - 1) * limitNumber;
  const paginatedCourses = allMerged.slice(startIndex, startIndex + limitNumber);

  return {
    enrolledCourses: paginatedCourses,
    pagination: {
      total: totalItems,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      hasNext: pageNumber < totalPages,
      hasPrev: pageNumber > 1,
    },
  };
};

/**
 * GET /student/courses
 * Browse published courses catalog with filters, search, and sorting.
 */
const mapPlatformCourseItem = (course, enrollment, locale = "ar") => {
  const trans =
    course.translations?.find((t) => t.locale === locale) ||
    course.translations?.[0];
  const categoryTrans =
    course.category?.translations?.find((t) => t.locale === locale) ||
    course.category?.translations?.[0];

  const title = trans?.title || course.title || "";
  const effectivePrice = Number(course.salePrice ?? course.originalPrice ?? 0);

  return {
    id: course.id,
    title,
    name: title,
    description: trans?.description || course.description || "",
    thumbnail: course.thumbnail || null,
    wallPaper: course.thumbnail || null,
    previewVideoUrl: course.previewVideoUrl || null,
    price: effectivePrice,
    originalPrice: Number(course.originalPrice || 0),
    salePrice: course.salePrice != null ? Number(course.salePrice) : null,
    currency: course.currency || "USD",
    enrollmentType: course.enrollmentType || "PAID",
    durationHours: Number(course.durationHours || 0),
    totalHours: Number(course.durationHours || 0),
    totalLessonsCount: course.totalLessonsCount || 0,
    level: course.level || "BEGINNER",
    language: course.language || "english",
    avgRating: Number(course.avgRating || 0),
    reviewsCount: course.reviewsCount || 0,
    totalStudentsCount: course.totalStudentsCount || 0,
    hasCertificate: Boolean(course.hasCertificate),
    tags: course.tags || [],
    categoryId: course.categoryId,
    categoryName: categoryTrans?.name || "",
    category: course.category,
    instructorId: course.instructorId,
    instructorName: course.instructor?.fullName || "",
    instructorPhoto: course.instructor?.profilePhoto || null,
    provider: "PLATFORM",
    type: coursesType.COURSE,
    isEnrolled: !!enrollment,
    progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
    enrollmentStatus: enrollment ? enrollment.status : null,
    createdAt: course.createdAt,
  };
};

const mapTeacherCourseItem = (course, enrollment, locale = "ar") => {
  const categoryTrans =
    course.category?.translations?.find((t) => t.locale === locale) ||
    course.category?.translations?.[0];

  const priceNum = Number(course.price || 0);

  return {
    id: course.id,
    title: course.name || "",
    name: course.name || "",
    description: course.description || "",
    thumbnail: course.wallPaper || null,
    wallPaper: course.wallPaper || null,
    previewVideoUrl: course.previewVideoUrl || null,
    price: priceNum,
    originalPrice: priceNum,
    salePrice: null,
    currency: "USD",
    enrollmentType: priceNum === 0 ? "FREE" : "PAID",
    durationHours: Number(course.totalHours || 0),
    totalHours: Number(course.totalHours || 0),
    totalLessonsCount: 0,
    level: course.level || "BEGINNER",
    language: course.language || "english",
    avgRating: Number(course.avgRating || 0),
    reviewsCount: course.reviewsCount || 0,
    totalStudentsCount: course.totalStudentsCount || 0,
    hasCertificate: false,
    tags: [],
    categoryId: course.categoryId,
    categoryName: categoryTrans?.name || "",
    category: course.category,
    instructorId: course.teacher?.user?.id || course.teacherId,
    instructorName: course.teacher?.user?.fullName || "",
    instructorPhoto: course.teacher?.user?.profilePhoto || null,
    instructorBio: course.teacher?.bio || "",
    provider: "TEACHER",
    type: coursesType.TEACHER_COURSE,
    isEnrolled: !!enrollment,
    progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
    enrollmentStatus: enrollment ? enrollment.status : null,
    createdAt: course.createdAt,
  };
};

const sortCourses = (courses, sortBy) => {
  const norm = (sortBy || "newest").toLowerCase();
  return courses.sort((a, b) => {
    if (norm === "rating" || norm === "rating_desc") {
      return (b.avgRating || 0) - (a.avgRating || 0);
    }
    if (norm === "popular") {
      return (b.totalStudentsCount || 0) - (a.totalStudentsCount || 0);
    }
    if (norm === "price_asc") {
      return (a.price || 0) - (b.price || 0);
    }
    if (norm === "price_desc") {
      return (b.price || 0) - (a.price || 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

/**
 * GET /student/courses
 * Unified Udemy-style course catalog supporting platform and teacher courses,
 * faceted search, rating, duration, level, language, price, and category filters.
 */
export const getCourseCatalogService = async (userId, query = {}) => {
  const {
    search,
    provider = "ALL",
    categoryId,
    level,
    language,
    minRating,
    durationRange,
    minDuration,
    maxDuration,
    enrollmentType,
    minPrice,
    maxPrice,
    hasCertificate,
    sortBy = "newest",
    page = 1,
    limit = 10,
    locale = "ar",
  } = query;

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.max(1, parseInt(limit, 10) || 10);

  let effectiveMinDuration = minDuration !== undefined ? Number(minDuration) : undefined;
  let effectiveMaxDuration = maxDuration !== undefined ? Number(maxDuration) : undefined;

  if (durationRange) {
    if (durationRange === "0-1" || durationRange === "extraShort") {
      effectiveMinDuration = 0;
      effectiveMaxDuration = 1;
    } else if (durationRange === "1-3" || durationRange === "short") {
      effectiveMinDuration = 1;
      effectiveMaxDuration = 3;
    } else if (durationRange === "3-6" || durationRange === "medium") {
      effectiveMinDuration = 3;
      effectiveMaxDuration = 6;
    } else if (durationRange === "6+" || durationRange === "long") {
      effectiveMinDuration = 6;
    }
  }

  const courseWhere = {
    status: courseStatusEnum.PUBLISHED,
    ...(categoryId ? { categoryId } : {}),
    ...(level ? { level } : {}),
    ...(language ? { language: { equals: language, mode: "insensitive" } } : {}),
    ...(minRating !== undefined ? { avgRating: { gte: Number(minRating) } } : {}),
    ...(hasCertificate !== undefined ? { hasCertificate: Boolean(hasCertificate) } : {}),
    ...(enrollmentType ? { enrollmentType } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          originalPrice: {
            ...(minPrice !== undefined ? { gte: Number(minPrice) } : {}),
            ...(maxPrice !== undefined ? { lte: Number(maxPrice) } : {}),
          },
        }
      : {}),
    ...(effectiveMinDuration !== undefined || effectiveMaxDuration !== undefined
      ? {
          durationHours: {
            ...(effectiveMinDuration !== undefined ? { gte: Number(effectiveMinDuration) } : {}),
            ...(effectiveMaxDuration !== undefined ? { lte: Number(effectiveMaxDuration) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              translations: {
                some: {
                  OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            },
            {
              instructor: {
                fullName: { contains: search, mode: "insensitive" },
              },
            },
            {
              tags: { has: search },
            },
          ],
        }
      : {}),
  };

  const teacherWhere = {
    status: "APPROVED",
    ...(categoryId ? { categoryId } : {}),
    ...(level ? { level } : {}),
    ...(language ? { language: { equals: language, mode: "insensitive" } } : {}),
    ...(minRating !== undefined ? { avgRating: { gte: Number(minRating) } } : {}),
    ...(enrollmentType === "FREE" ? { price: 0 } : {}),
    ...(enrollmentType === "PAID" ? { price: { gt: 0 } } : {}),
    ...(hasCertificate === true ? { id: "impossible-id" } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: Number(minPrice) } : {}),
            ...(maxPrice !== undefined ? { lte: Number(maxPrice) } : {}),
          },
        }
      : {}),
    ...(effectiveMinDuration !== undefined || effectiveMaxDuration !== undefined
      ? {
          totalHours: {
            ...(effectiveMinDuration !== undefined ? { gte: Number(effectiveMinDuration) } : {}),
            ...(effectiveMaxDuration !== undefined ? { lte: Number(effectiveMaxDuration) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              teacher: {
                user: {
                  fullName: { contains: search, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
  };

  const platformInclude = {
    translations: true,
    category: {
      select: {
        id: true,
        slug: true,
        translations: true,
      },
    },
    instructor: {
      select: {
        id: true,
        fullName: true,
        profilePhoto: true,
      },
    },
  };

  const teacherInclude = {
    category: {
      select: {
        id: true,
        slug: true,
        translations: true,
      },
    },
    teacher: {
      select: {
        id: true,
        bio: true,
        user: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
          },
        },
      },
    },
  };

  let orderByPrisma = { createdAt: "desc" };
  const normalizedSortBy = (sortBy || "newest").toLowerCase();
  if (normalizedSortBy === "rating" || normalizedSortBy === "rating_desc") {
    orderByPrisma = { avgRating: "desc" };
  } else if (normalizedSortBy === "popular") {
    orderByPrisma = { totalStudentsCount: "desc" };
  } else if (normalizedSortBy === "price_asc") {
    orderByPrisma = { originalPrice: "asc" };
  } else if (normalizedSortBy === "price_desc") {
    orderByPrisma = { originalPrice: "desc" };
  }

  let platformItems = [];
  let teacherItems = [];
  let totalPlatform = 0;
  let totalTeacher = 0;

  if (provider === "PLATFORM") {
    const result = await db.findManyWithPaginationAndCount({
      model: "course",
      where: courseWhere,
      page: pageNumber,
      limit: limitNumber,
      orderBy: orderByPrisma,
      include: platformInclude,
    });
    platformItems = result.items;
    totalPlatform = result.pagination.total;
  } else if (provider === "TEACHER") {
    let teacherOrderBy = { createdAt: "desc" };
    if (normalizedSortBy === "rating" || normalizedSortBy === "rating_desc") {
      teacherOrderBy = { avgRating: "desc" };
    } else if (normalizedSortBy === "popular") {
      teacherOrderBy = { totalStudentsCount: "desc" };
    } else if (normalizedSortBy === "price_asc") {
      teacherOrderBy = { price: "asc" };
    } else if (normalizedSortBy === "price_desc") {
      teacherOrderBy = { price: "desc" };
    }

    const result = await db.findManyWithPaginationAndCount({
      model: "teacherCourse",
      where: teacherWhere,
      page: pageNumber,
      limit: limitNumber,
      orderBy: teacherOrderBy,
      include: teacherInclude,
    });
    teacherItems = result.items;
    totalTeacher = result.pagination.total;
  } else {
    // provider === "ALL"
    let teacherOrderBy = { createdAt: "desc" };
    if (normalizedSortBy === "rating" || normalizedSortBy === "rating_desc") {
      teacherOrderBy = { avgRating: "desc" };
    } else if (normalizedSortBy === "popular") {
      teacherOrderBy = { totalStudentsCount: "desc" };
    } else if (normalizedSortBy === "price_asc") {
      teacherOrderBy = { price: "asc" };
    } else if (normalizedSortBy === "price_desc") {
      teacherOrderBy = { price: "desc" };
    }

    const [pItems, pCount, tItems, tCount] = await Promise.all([
      db.findMany({
        model: "course",
        where: courseWhere,
        orderBy: orderByPrisma,
        include: platformInclude,
      }),
      db.count({
        model: "course",
        where: courseWhere,
      }),
      db.findMany({
        model: "teacherCourse",
        where: teacherWhere,
        orderBy: teacherOrderBy,
        include: teacherInclude,
      }),
      db.count({
        model: "teacherCourse",
        where: teacherWhere,
      }),
    ]);

    platformItems = pItems;
    totalPlatform = pCount;
    teacherItems = tItems;
    totalTeacher = tCount;
  }

  const platformIds = platformItems.map((c) => c.id);
  const teacherIds = teacherItems.map((c) => c.id);

  const [platformEnrollments, teacherEnrollments] = await Promise.all([
    platformIds.length > 0 && userId
      ? db.findMany({
          model: "courseEnrollment",
          where: { studentId: userId, courseId: { in: platformIds } },
          select: { courseId: true, progressPercent: true, status: true },
        })
      : [],
    teacherIds.length > 0 && userId
      ? db.findMany({
          model: "teacherCourseEnrollment",
          where: { studentId: userId, courseId: { in: teacherIds } },
          select: { courseId: true, progressPercent: true, status: true },
        })
      : [],
  ]);

  const platformEnrollmentMap = new Map(
    platformEnrollments.map((e) => [e.courseId, e])
  );
  const teacherEnrollmentMap = new Map(
    teacherEnrollments.map((e) => [e.courseId, e])
  );

  const mappedPlatform = platformItems.map((c) =>
    mapPlatformCourseItem(c, platformEnrollmentMap.get(c.id), locale)
  );
  const mappedTeacher = teacherItems.map((c) =>
    mapTeacherCourseItem(c, teacherEnrollmentMap.get(c.id), locale)
  );

  if (provider === "PLATFORM") {
    const totalPages = Math.ceil(totalPlatform / limitNumber) || 1;
    return {
      courses: mappedPlatform,
      pagination: {
        total: totalPlatform,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
      },
    };
  }

  if (provider === "TEACHER") {
    const totalPages = Math.ceil(totalTeacher / limitNumber) || 1;
    return {
      courses: mappedTeacher,
      pagination: {
        total: totalTeacher,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
      },
    };
  }

  // ALL: merge & sort
  const allMerged = sortCourses([...mappedPlatform, ...mappedTeacher], sortBy);
  const totalItems = totalPlatform + totalTeacher;
  const totalPages = Math.ceil(totalItems / limitNumber) || 1;
  const startIndex = (pageNumber - 1) * limitNumber;
  const paginatedCourses = allMerged.slice(startIndex, startIndex + limitNumber);

  return {
    courses: paginatedCourses,
    pagination: {
      total: totalItems,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      hasNext: pageNumber < totalPages,
      hasPrev: pageNumber > 1,
    },
  };
};

/**
 * GET /student/courses/filters
 * Faceted search metadata endpoint returning filter counts (categories, levels, languages, ratings, durations, prices).
 */
export const getCourseFiltersService = async (userId, query = {}) => {
  const { locale = "ar" } = query;

  const [categories, platformCourses, teacherCourses] = await Promise.all([
    db.findMany({
      model: "category",
      include: {
        translations: {
          where: { locale },
          select: { name: true, locale: true },
        },
      },
    }),
    db.findMany({
      model: "course",
      where: { status: courseStatusEnum.PUBLISHED },
      select: {
        id: true,
        level: true,
        language: true,
        durationHours: true,
        originalPrice: true,
        salePrice: true,
        avgRating: true,
        categoryId: true,
        enrollmentType: true,
      },
    }),
    db.findMany({
      model: "teacherCourse",
      where: { status: "APPROVED" },
      select: {
        id: true,
        level: true,
        language: true,
        totalHours: true,
        price: true,
        avgRating: true,
        categoryId: true,
      },
    }),
  ]);

  const categoryCounts = {};
  const levelCounts = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, ALL_LEVELS: 0 };
  const languageCounts = {};
  const ratingCounts = { "4.5": 0, "4.0": 0, "3.5": 0, "3.0": 0 };
  const durationCounts = { "0-1": 0, "1-3": 0, "3-6": 0, "6+": 0 };
  let freeCount = 0;
  let paidCount = 0;

  const processCourseStats = (c, isTeacher = false) => {
    if (c.categoryId) {
      categoryCounts[c.categoryId] = (categoryCounts[c.categoryId] || 0) + 1;
    }
    if (c.level) {
      levelCounts[c.level] = (levelCounts[c.level] || 0) + 1;
    }
    if (c.language) {
      languageCounts[c.language] = (languageCounts[c.language] || 0) + 1;
    }

    const rating = Number(c.avgRating || 0);
    if (rating >= 4.5) ratingCounts["4.5"]++;
    if (rating >= 4.0) ratingCounts["4.0"]++;
    if (rating >= 3.5) ratingCounts["3.5"]++;
    if (rating >= 3.0) ratingCounts["3.0"]++;

    const hours = Number(isTeacher ? c.totalHours : c.durationHours) || 0;
    if (hours <= 1) durationCounts["0-1"]++;
    else if (hours <= 3) durationCounts["1-3"]++;
    else if (hours <= 6) durationCounts["3-6"]++;
    else durationCounts["6+"]++;

    const price = Number(isTeacher ? c.price : (c.salePrice || c.originalPrice)) || 0;
    if (price === 0 || (!isTeacher && c.enrollmentType === "FREE")) {
      freeCount++;
    } else {
      paidCount++;
    }
  };

  platformCourses.forEach((c) => processCourseStats(c, false));
  teacherCourses.forEach((c) => processCourseStats(c, true));

  const formattedCategories = categories.map((cat) => {
    const trans = cat.translations?.[0];
    return {
      id: cat.id,
      slug: cat.slug,
      name: trans?.name || cat.slug,
      count: categoryCounts[cat.id] || 0,
    };
  });

  return {
    providers: [
      { key: "ALL", label: "All Courses", count: platformCourses.length + teacherCourses.length },
      { key: "PLATFORM", label: "Platform Official", count: platformCourses.length },
      { key: "TEACHER", label: "Teacher Instructors", count: teacherCourses.length },
    ],
    categories: formattedCategories,
    levels: Object.entries(levelCounts).map(([key, count]) => ({ key, count })),
    languages: Object.entries(languageCounts).map(([key, count]) => ({ key, count })),
    ratings: [
      { key: "4.5", label: "4.5 & up", minRating: 4.5, count: ratingCounts["4.5"] },
      { key: "4.0", label: "4.0 & up", minRating: 4.0, count: ratingCounts["4.0"] },
      { key: "3.5", label: "3.5 & up", minRating: 3.5, count: ratingCounts["3.5"] },
      { key: "3.0", label: "3.0 & up", minRating: 3.0, count: ratingCounts["3.0"] },
    ],
    durations: [
      { key: "0-1", label: "0-1 Hours", count: durationCounts["0-1"] },
      { key: "1-3", label: "1-3 Hours", count: durationCounts["1-3"] },
      { key: "3-6", label: "3-6 Hours", count: durationCounts["3-6"] },
      { key: "6+", label: "6+ Hours", count: durationCounts["6+"] },
    ],
    price: {
      freeCount,
      paidCount,
      totalCount: platformCourses.length + teacherCourses.length,
    },
  };
};

/**
 * GET /student/courses/categories
 * Browse available course categories with translations and course count.
 */
export const getCategoriesService = async (userId, query = {}) => {
  const { locale = "ar" } = query;

  const categoriesRaw = await db.findMany({
    model: "category",
    select: {
      id: true,
      slug: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          courses: { where: { status: "PUBLISHED" } },
          teacherCourses: { where: { status: "APPROVED" } },
        },
      },
      translations: {
        where: { locale },
        select: { id: true, locale: true, name: true, description: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = (categoriesRaw || [])
    .map(({ _count, ...category }) => ({
      ...category,
      coursesCount: _count ? (_count.courses || 0) + (_count.teacherCourses || 0) : 0,
    }))
    .sort((a, b) => (b.coursesCount || 0) - (a.coursesCount || 0));

  return { categories };
};

/**
 * GET /student/courses/:courseId
 * Course details with sections, lessons, previews gating, and student enrollment status.
 */
export const getCourseDetailsService = async (userId, courseId, query = {}) => {
  const { locale = "ar", itemType } = query;

  if (itemType === coursesType.TEACHER_COURSE) {
    return getTeacherCourseDetailsService(userId, courseId, query);
  }

  const course = await db.findOne({
    model: "course",
    where: { id: courseId },
    include: {
      translations: true,
      category: {
        select: {
          id: true,
          slug: true,
          translations: true,
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
          translations: true,
          lessons: {
            orderBy: { order: "asc" },
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return getTeacherCourseDetailsService(userId, courseId, query);
  }

  const enrollment = await db.findFirst({
    model: "courseEnrollment",
    where: { studentId: userId, courseId },
  });
  const isEnrolled = !!enrollment;

  const savedItem = await db.findFirst({
    model: "saved",
    where: { studentId: userId, itemId: courseId },
  });
  const isSaved = !!savedItem;

  const courseTrans =
    (course.translations || []).find((t) => t.locale === locale) ||
    course.translations?.[0];
  const categoryTrans =
    (course.category?.translations || []).find((t) => t.locale === locale) ||
    course.category?.translations?.[0];

  let completedLessonIds = [];
  if (isEnrolled) {
    try {
      const redisKey = `student_lessons:${userId}:${courseId}`;
      completedLessonIds = (await redis.smembers(redisKey)) || [];
    } catch {
      completedLessonIds = [];
    }
  }
  const completedSet = new Set(completedLessonIds);

  // Gate contentUrl for lessons if not enrolled and not free preview
  const processedSections = (course.sections || []).map((section) => {
    const secTrans =
      (section.translations || []).find((t) => t.locale === locale) ||
      section.translations?.[0];

    return {
      ...section,
      title: secTrans?.title || section.title || "",
      lessons: (section.lessons || []).map((lesson) => {
        const lesTrans =
          (lesson.translations || []).find((t) => t.locale === locale) ||
          lesson.translations?.[0];

        return {
          ...lesson,
          title: lesTrans?.title || lesson.title || "",
          description: lesTrans?.description || lesson.description || "",
          contentUrl: isEnrolled || lesson.isFreePreview ? lesson.contentUrl : null,
          isLocked: !isEnrolled && !lesson.isFreePreview,
          isCompleted: completedSet.has(lesson.id),
        };
      }),
    };
  });

  const userReview = await db.findFirst({
    model: "courseReview",
    where: { studentId: userId, courseId },
  });

  return {
    course: {
      ...course,
      title: courseTrans?.title || course.title || "",
      description: courseTrans?.description || course.description || "",
      categoryName: categoryTrans?.name || "",
      instructorName: course.instructor?.fullName || "",
      instructorPhoto: course.instructor?.profilePhoto || null,
      provider: course.provider || "PLATFORM",
      type: coursesType.COURSE,
      sections: processedSections,
      isEnrolled,
      isSaved,
      progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
      enrollmentStatus: enrollment ? enrollment.status : null,
      completedLessonIds,
    },
    isEnrolled,
    isSaved,
    enrollment: enrollment || null,
    progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
    userReview: userReview || null,
    completedLessonIds,
  };
};

export const getTeacherCourseDetailsService = async (userId, courseId, query = {}) => {
  const { locale = "ar" } = query;

  const course = await db.findOne({
    model: "teacherCourse",
    where: { id: courseId },
    include: {
      category: {
        select: {
          id: true,
          slug: true,
          translations: true,
        },
      },
      teacher: {
        select: {
          id: true,
          bio: true,
          avgRating: true,
          reviewsCount: true,
          experienceYears: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      },
      sections: {
        orderBy: { order: "asc" },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
          quiz: {
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              passingScore: true,
              questions: {
                select: { id: true },
              },
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

  if (course.status !== "APPROVED") {
    const error = new Error("COURSE_NOT_AVAILABLE");
    error.cause = 400;
    throw error;
  }

  const enrollment = await db.findFirst({
    model: "teacherCourseEnrollment",
    where: { studentId: userId, courseId },
  });
  const isEnrolled = !!enrollment;

  const savedItem = await db.findFirst({
    model: "saved",
    where: { studentId: userId, itemId: courseId },
  });
  const isSaved = !!savedItem;

  const categoryTrans =
    (course.category?.translations || []).find((t) => t.locale === locale) ||
    course.category?.translations?.[0];

  let completedItemIds = [];
  if (isEnrolled) {
    try {
      const redisKey = `student_teacher_lessons:${userId}:${courseId}`;
      completedItemIds = (await redis.smembers(redisKey)) || [];
    } catch {
      completedItemIds = [];
    }
  }
  const completedSet = new Set(completedItemIds);

  const quizIds = (course.sections || [])
    .map((s) => s.quiz?.id)
    .filter(Boolean);

  let quizSubmissionMap = new Map();
  if (quizIds.length > 0) {
    const submissions = await db.findMany({
      model: "teacherCourseQuizSubmission",
      where: {
        studentId: userId,
        quizId: { in: quizIds },
      },
      select: {
        id: true,
        quizId: true,
        status: true,
        passed: true,
        percentage: true,
      },
    });
    quizSubmissionMap = new Map(submissions.map((s) => [s.quizId, s]));
  }

  const processedSections = (course.sections || []).map((section) => {
    return {
      id: section.id,
      title: section.name,
      order: section.order,
      items: (section.items || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        materialType: item.materialType,
        materialLink: isEnrolled ? item.materialLink : null,
        isLocked: !isEnrolled,
        isCompleted: completedSet.has(item.id),
        order: item.order,
      })),
      quiz: section.quiz
        ? {
            id: section.quiz.id,
            title: section.quiz.title,
            description: section.quiz.description,
            duration: section.quiz.duration,
            passingScore: section.quiz.passingScore,
            totalQuestions: section.quiz.questions?.length || 0,
            isLocked: !isEnrolled,
            hasSubmitted: Boolean(quizSubmissionMap.get(section.quiz.id)),
            submission: quizSubmissionMap.get(section.quiz.id) || null,
          }
        : null,
    };
  });

  const userReview = await db.findFirst({
    model: "teacherCourseReview",
    where: { studentId: userId, courseId },
  });

  return {
    course: {
      id: course.id,
      name: course.name,
      title: course.name,
      description: course.description,
      price: course.price,
      originalPrice: course.price,
      salePrice: null,
      totalHours: course.totalHours,
      durationHours: course.totalHours,
      wallPaper: course.wallPaper,
      thumbnail: course.wallPaper,
      previewVideoUrl: course.previewVideoUrl,
      provider: course.provider || "TEACHER",
      level: course.level,
      language: course.language,
      status: course.status,
      avgRating: course.avgRating,
      reviewsCount: course.reviewsCount,
      totalStudentsCount: course.totalStudentsCount,
      categoryName: categoryTrans?.name || "",
      category: course.category,
      instructorName: course.teacher?.user?.fullName || "",
      instructorPhoto: course.teacher?.user?.profilePhoto || null,
      instructorBio: course.teacher?.bio || "",
      type: coursesType.TEACHER_COURSE,
      sections: processedSections,
      isEnrolled,
      isSaved,
      progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
      enrollmentStatus: enrollment ? enrollment.status : null,
      completedLessonIds: completedItemIds,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    },
    isEnrolled,
    isSaved,
    enrollment: enrollment || null,
    progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
    userReview: userReview || null,
    completedLessonIds: completedItemIds,
  };
};

/**
 * POST /student/courses/:courseId/lessons/:lessonId/complete
 * Mark a lesson as completed, calculate progress percent and update enrollment.
 */
export const completeLessonService = async (userId, courseId, lessonId) => {
  let enrollment = await db.findFirst({
    model: "courseEnrollment",
    where: { studentId: userId, courseId },
  });
  let isTeacherCourse = false;

  if (!enrollment) {
    enrollment = await db.findFirst({
      model: "teacherCourseEnrollment",
      where: { studentId: userId, courseId },
    });
    if (enrollment) {
      isTeacherCourse = true;
    }
  }

  if (!enrollment) {
    const error = new Error("NOT_ENROLLED_IN_COURSE");
    error.cause = 403;
    throw error;
  }

  if (isTeacherCourse) {
    const item = await db.findFirst({
      model: "teacherCourseSectionItem",
      where: { id: lessonId },
      include: { section: true },
    });

    if (!item || item.section?.courseId !== courseId) {
      const error = new Error("LESSON_NOT_FOUND_IN_COURSE");
      error.cause = 404;
      throw error;
    }

    const totalLessons = await db.count({
      model: "teacherCourseSectionItem",
      where: {
        section: { courseId },
      },
    });
    const total = totalLessons || 1;

    let completedCount = 1;
    let completedLessonIds = [];
    try {
      const redisKey = `student_teacher_lessons:${userId}:${courseId}`;
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
      model: "teacherCourseEnrollment",
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
  }

  // Platform Course
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

export const getCourseReviewsService = async (courseId, { page = 1, limit = 10, itemType } = {}) => {
  let reviewModel = "courseReview";
  if (itemType === coursesType.TEACHER_COURSE) {
    reviewModel = "teacherCourseReview";
  } else if (!itemType) {
    const isPlatformCourse = await db.findFirst({
      model: "course",
      where: { id: courseId },
      select: { id: true },
    });
    if (!isPlatformCourse) {
      reviewModel = "teacherCourseReview";
    }
  }

  const [reviews, count, allRatings] = await Promise.all([
    db.findMany({
      model: reviewModel,
      where: { courseId, isHidden: false },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
          },
        },
      },
    }),
    db.count({
      model: reviewModel,
      where: { courseId, isHidden: false },
    }),
    db.findMany({
      model: reviewModel,
      where: { courseId, isHidden: false },
      select: { rating: true },
    }),
  ]);

  const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allRatings.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 0))));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const total = allRatings.length;
  const distribution = {};
  for (let s = 1; s <= 5; s++) {
    distribution[s] = total > 0 ? Number((starCounts[s] / total).toFixed(2)) : 0.0;
  }

  const avgRating = total > 0
    ? Number((allRatings.reduce((acc, r) => acc + Number(r.rating || 0), 0) / total).toFixed(1))
    : 0.0;

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: Number(r.rating || 0),
      comment: r.comment || "",
      studentName: r.student?.fullName || "طالب",
      studentPhoto: r.student?.profilePhoto || null,
      createdAt: r.createdAt,
    })),
    totalReviews: count,
    avgRating,
    distribution,
    starCounts,
  };
};
