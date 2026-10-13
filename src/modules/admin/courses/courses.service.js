import * as DBService from "../../../db/db.service.js";
import {
  baseRoleEnum,
  courseLevelEnum,
  courseStatusEnum,
  coursesType,
  enrollmentTypeEnum,
  lessonTypeEnum,
} from "../../../utils/Enums/index.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";

export const resolveInstructorUserId = async (instructorId) => {
  if (!instructorId) return null;

  const user = await DBService.findFirst({
    model: "user",
    where: {
      id: instructorId,
      OR: [
        { role: { slug: baseRoleEnum.TEACHER } },
        { teacher: { isNot: null } },
      ],
    },
    select: { id: true },
  });

  if (user) {
    return user.id;
  }

  const teacherProfile = await DBService.findFirst({
    model: "teacher",
    where: { id: instructorId },
    select: { userId: true },
  });

  if (teacherProfile?.userId) {
    return teacherProfile.userId;
  }

  const error = new Error("INSTRUCTOR_NOT_FOUND_OR_INVALID");
  error.cause = 404;
  throw error;
};

export const createCourseService = async (body, reqFiles) => {
  const {
    categoryId,
    instructorId,
    level = courseLevelEnum.BEGINNER,
    language = "english",
    durationHours,
    totalLessonsCount,
    tags = [],
    enrollmentType = enrollmentTypeEnum.PAID,
    originalPrice,
    salePrice,
    currency = "USD",
    hasCertificate = true,
    status = courseStatusEnum.DRAFT,
    scheduledAt,
    translations = [],
    sections = [],
  } = body;

  const category = await DBService.findFirst({
    model: "category",
    where: { id: categoryId },
  });
  if (!category) {
    const error = new Error("CATEGORY_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  let resolvedInstructorId = null;
  if (instructorId) {
    resolvedInstructorId = await resolveInstructorUserId(instructorId);
  }

  const calculatedLessonsCount =
    totalLessonsCount ||
    sections.reduce((acc, section) => acc + (section.lessons?.length || 0), 0);

  const thumbnail = reqFiles?.thumbnail?.[0]?.relativeDestination || null;
  const previewVideoUrl =
    reqFiles?.previewVideo?.[0]?.relativeDestination || null;

  const newCourse = await DBService.create({
    model: "course",
    data: {
      categoryId,
      instructorId: resolvedInstructorId,
      level,
      thumbnail,
      language,
      durationHours: Number(durationHours) || 0,
      totalLessonsCount: calculatedLessonsCount,
      tags,
      previewVideoUrl,
      enrollmentType,
      originalPrice: Number(originalPrice) || 0,
      salePrice: salePrice ? Number(salePrice) : null,
      currency,
      hasCertificate,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      translations: {
        create: translations.map((translation) => ({
          locale: translation.locale,
          title: translation.title,
          description: translation.description,
          whatYouWillLearn: translation.whatYouWillLearn || [],
          requirements: translation.requirements || [],
        })),
      },
      sections: {
        create: sections.map((section, sectionIndex) => ({
          order: section.order || sectionIndex + 1,
          translations: {
            create: (section.translations || []).map((translation) => ({
              locale: translation.locale,
              title: translation.title,
            })),
          },
          lessons: {
            create: (section.lessons || []).map((lesson, lessonIndex) => ({
              order: lesson.order || lessonIndex + 1,
              durationMinutes: Number(lesson.durationMinutes) || 0,
              type: lesson.type || lessonTypeEnum.VIDEO,
              contentUrl: lesson.contentUrl,
              isFreePreview: lesson.isFreePreview ?? false,
              translations: {
                create: (lesson.translations || []).map((translation) => ({
                  locale: translation.locale,
                  title: translation.title,
                  description: translation.description,
                })),
              },
            })),
          },
        })),
      },
    },
  });

  return {
    ...newCourse,
    type: coursesType.COURSE,
  };
};

const adminCourseInclude = {
  translations: true,
  category: {
    select: { id: true, slug: true, translations: true },
  },
  instructor: {
    select: {
      id: true,
      fullName: true,
      email: true,
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
  enrollments: {
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  },
  reviews: {
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          profilePhoto: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  },
  _count: {
    select: {
      sections: true,
      enrollments: true,
      reviews: true,
    },
  },
};

const teacherCourseInclude = {
  teacher: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profilePhoto: true,
        },
      },
    },
  },
  sections: {
    orderBy: { order: "asc" },
    include: {
      items: { orderBy: { order: "asc" } },
      quiz: true,
    },
  },
};

const formatAdminCourse = (course) => {
  const totalSections =
    course.sections?.length ?? course._count?.sections ?? 0;

  const totalLessons =
    course.sections?.reduce(
      (sum, s) => sum + (s.lessons?.length || 0),
      0
    ) ?? course.totalLessonsCount ?? 0;

  const totalStudents =
    course.enrollments?.length ??
    course._count?.enrollments ??
    course.totalStudentsCount ??
    0;

  const totalReviews =
    course.reviews?.length ?? course._count?.reviews ?? course.reviewsCount ?? 0;

  const calculatedAvgRating =
    course.reviews && course.reviews.length > 0
      ? Number(
          (
            course.reviews.reduce(
              (acc, r) => acc + (Number(r.rating) || 0),
              0
            ) / course.reviews.length
          ).toFixed(1)
        )
      : Number(course.avgRating) || 0;

  const calculatedTotalRevenue =
    course.enrollments && course.enrollments.length > 0
      ? Number(
          course.enrollments
            .reduce((acc, e) => acc + (Number(e.paidAmount) || 0), 0)
            .toFixed(2)
        )
      : Number(course.totalRevenue) || 0;

  const calculatedCompletionRate =
    course.enrollments && course.enrollments.length > 0
      ? Number(
          (
            course.enrollments.reduce(
              (acc, e) => acc + (Number(e.progressPercent) || 0),
              0
            ) / course.enrollments.length
          ).toFixed(1)
        )
      : Number(course.completionRate) || 0;

  const statsData = {
    totalStudents,
    totalLessons,
    totalSections,
    totalReviews,
    totalRevenue: calculatedTotalRevenue,
    avgRating: calculatedAvgRating,
    completionRate: calculatedCompletionRate,
    sections: totalSections,
    lessons: totalLessons,
    enrollments: totalStudents,
    reviews: totalReviews,
  };

  const { _count, ...cleanCourse } = course;

  return {
    ...cleanCourse,
    totalLessonsCount: totalLessons,
    totalStudentsCount: totalStudents,
    totalRevenue: calculatedTotalRevenue,
    avgRating: calculatedAvgRating,
    reviewsCount: totalReviews,
    completionRate: calculatedCompletionRate,
    stats: statsData,
    reviews: (course.reviews || []).map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      student: review.student,
    })),
  };
};

const formatTeacherCourse = (tc) => {
  const totalLessons =
    tc.sections?.reduce((sum, s) => sum + (s.items?.length || 0), 0) || 0;
  const totalSections = tc.sections?.length || 0;

  const statsData = {
    totalStudents: 0,
    totalLessons,
    totalSections,
    totalReviews: 0,
    totalRevenue: 0,
    avgRating: 0,
    completionRate: 0,
    sections: totalSections,
    lessons: totalLessons,
    enrollments: 0,
    reviews: 0,
  };

  return {
    id: tc.id,
    type: coursesType.TEACHER_COURSE,
    title: tc.name,
    name: tc.name,
    description: tc.description,
    thumbnail: tc.wallPaper,
    wallPaper: tc.wallPaper,
    previewVideoUrl: null,
    level: "ALL_LEVELS",
    status: tc.status,
    rejectionReason: tc.rejectionReason,
    enrollmentType: "PAID",
    language: "arabic",
    originalPrice: Number(tc.price) || 0,
    salePrice: null,
    currency: "EGP",
    durationHours: tc.totalHours || 0,
    totalLessonsCount: totalLessons,
    totalStudentsCount: 0,
    totalRevenue: 0,
    avgRating: 0,
    reviewsCount: 0,
    completionRate: 0,
    states: statsData,
    stats: statsData,
    tags: [],
    hasCertificate: false,
    scheduledAt: null,
    categoryId: null,
    category: null,
    instructorId: tc.teacher?.userId || tc.teacherId,
    instructor: tc.teacher?.user
      ? {
          id: tc.teacher.user.id,
          fullName: tc.teacher.user.fullName,
          email: tc.teacher.user.email,
          phone: tc.teacher.user.phone,
          profilePhoto: tc.teacher.user.profilePhoto,
        }
      : null,
    sections: (tc.sections || []).map((sec) => ({
      id: sec.id,
      order: sec.order,
      title: sec.name,
      name: sec.name,
      lessons: (sec.items || []).map((item) => ({
        id: item.id,
        order: item.order,
        title: item.title,
        description: item.description,
        type: item.materialType,
        contentUrl: item.materialLink,
      })),
      quiz: sec.quiz || null,
    })),
    createdAt: tc.createdAt,
    updatedAt: tc.updatedAt,
  };
};

const getCourseOrderBy = (sort) => {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "price_asc":
      return { originalPrice: "asc" };
    case "price_desc":
      return { originalPrice: "desc" };
    case "rating":
      return { avgRating: "desc" };
    case "students":
      return { totalStudentsCount: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
};

const getTeacherCourseOrderBy = (sort) => {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
};

const sortUnifiedCourses = (items, sort = "newest") => {
  switch (sort) {
    case "oldest":
      items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "price_asc":
      items.sort((a, b) => (a.originalPrice || 0) - (b.originalPrice || 0));
      break;
    case "price_desc":
      items.sort((a, b) => (b.originalPrice || 0) - (a.originalPrice || 0));
      break;
    case "rating":
      items.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
      break;
    case "students":
      items.sort(
        (a, b) => (b.totalStudentsCount || 0) - (a.totalStudentsCount || 0),
      );
      break;
    case "newest":
    default:
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }
};

export const getAllCoursesService = async ({
  type = "ALL",
  search = "",
  categoryId,
  instructorId,
  level,
  status,
  enrollmentType,
  language,
  page = 1,
  limit = 10,
  sort = "newest",
} = {}) => {
  const p = Math.max(1, Number(page));
  const take = Math.max(1, Number(limit));
  const skip = (p - 1) * take;

  let adminInstructorId = instructorId;
  if (instructorId) {
    const teacherProfile = await DBService.findFirst({
      model: "teacher",
      where: { id: instructorId },
      select: { userId: true },
    });
    if (teacherProfile?.userId) {
      adminInstructorId = teacherProfile.userId;
    }
  }

  const adminWhere = {
    ...(categoryId ? { categoryId } : {}),
    ...(adminInstructorId ? { instructorId: adminInstructorId } : {}),
    ...(level ? { level } : {}),
    ...(status ? { status } : {}),
    ...(enrollmentType ? { enrollmentType } : {}),
    ...(language ? { language } : {}),
    ...(search
      ? {
          OR: [
            {
              translations: {
                some: {
                  title: { contains: search, mode: "insensitive" },
                },
              },
            },
            {
              translations: {
                some: {
                  description: { contains: search, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
  };

  const teacherWhere = {
    ...(status ? { status } : {}),
    ...(instructorId
      ? {
          OR: [
            { teacherId: instructorId },
            { teacher: { userId: instructorId } },
          ],
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  if (type === coursesType.COURSE) {
    const result = await DBService.findManyWithPaginationAndCount({
      model: "course",
      where: adminWhere,
      page: p,
      limit: take,
      orderBy: getCourseOrderBy(sort),
      include: adminCourseInclude,
    });

    return {
      courses: result.items.map(formatAdminCourse),
      pagination: result.pagination,
    };
  }

  if (type === coursesType.TEACHER_COURSE) {
    const result = await DBService.findManyWithPaginationAndCount({
      model: "teacherCourse",
      where: teacherWhere,
      page: p,
      limit: take,
      orderBy: getTeacherCourseOrderBy(sort),
      include: teacherCourseInclude,
    });

    return {
      courses: result.items.map(formatTeacherCourse),
      pagination: result.pagination,
    };
  }

  const isTeacherStatus = ["PENDING", "APPROVED", "REJECTED"].includes(status);
  const isAdminStatus = Object.values(courseStatusEnum).includes(status);

  const [adminResult, teacherResult] = await Promise.all([
    isTeacherStatus
      ? { items: [], count: 0 }
      : DBService.findMany({
          model: "course",
          where: adminWhere,
          include: adminCourseInclude,
        }).then(async (items) => {
          const count = await DBService.count({
            model: "course",
            where: adminWhere,
          });
          return { items, count };
        }),
    isAdminStatus || categoryId || level || enrollmentType || language
      ? { items: [], count: 0 }
      : DBService.findMany({
          model: "teacherCourse",
          where: teacherWhere,
          include: teacherCourseInclude,
        }).then(async (items) => {
          const count = await DBService.count({
            model: "teacherCourse",
            where: teacherWhere,
          });
          return { items, count };
        }),
  ]);

  const allFormatted = [
    ...adminResult.items.map(formatAdminCourse),
    ...teacherResult.items.map(formatTeacherCourse),
  ];

  sortUnifiedCourses(allFormatted, sort);

  const totalItems = allFormatted.length;
  const paginatedItems = allFormatted.slice(skip, skip + take);
  const totalPages = Math.ceil(totalItems / take) || 1;

  return {
    courses: paginatedItems,
    pagination: {
      page: p,
      limit: take,
      totalItems,
      totalPages,
      hasNextPage: p < totalPages,
    },
  };
};

export const getCourseByIdService = async ({ courseId }) => {
  const course = await DBService.findOne({
    model: "course",
    where: {
      id: courseId,
    },
    include: adminCourseInclude,
  });

  if (course) {
    return {
      course: formatAdminCourse(course),
    };
  }

  const teacherCourse = await DBService.findOne({
    model: "teacherCourse",
    where: {
      id: courseId,
    },
    include: teacherCourseInclude,
  });

  if (teacherCourse) {
    return {
      course: formatTeacherCourse(teacherCourse),
    };
  }

  const error = new Error("COURSE_NOT_FOUND");
  error.cause = 404;
  throw error;
};

export const updateCourseService = async (body, params, reqFiles) => {
  const {
    categoryId,
    instructorId,
    level,
    language,
    durationHours,
    totalLessonsCount,
    tags,
    enrollmentType,
    originalPrice,
    salePrice,
    currency,
    hasCertificate,
    status,
    scheduledAt,
    translations = [],
    sections = [],
  } = body;

  const { courseId } = params;
  const existingCourse = await DBService.findOne({
    model: "course",
    where: { id: courseId },
  });
  if (!existingCourse) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  let resolvedInstructorId = undefined;
  if (instructorId !== undefined) {
    resolvedInstructorId = await resolveInstructorUserId(instructorId);
  }

  const calculatedLessonsCount =
    totalLessonsCount !== undefined
      ? totalLessonsCount
      : sections.length > 0
        ? sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0)
        : undefined;

  const newThumbnail = reqFiles?.thumbnail?.[0]?.relativeDestination;
  const newPreviewVideo = reqFiles?.previewVideo?.[0]?.relativeDestination;

  const course = await DBService.updateOne({
    model: "course",
    where: { id: courseId },
    data: {
      ...(categoryId !== undefined && { categoryId }),
      ...(resolvedInstructorId !== undefined && {
        instructorId: resolvedInstructorId,
      }),
      ...(level !== undefined && { level }),
      ...(newThumbnail && { thumbnail: newThumbnail }),
      ...(newPreviewVideo && { previewVideoUrl: newPreviewVideo }),
      ...(language !== undefined && { language }),
      ...(durationHours !== undefined && {
        durationHours: Number(durationHours),
      }),
      ...(calculatedLessonsCount !== undefined && {
        totalLessonsCount: calculatedLessonsCount,
      }),
      ...(tags !== undefined && { tags }),
      ...(enrollmentType !== undefined && { enrollmentType }),
      ...(originalPrice !== undefined && {
        originalPrice: Number(originalPrice),
      }),
      ...(salePrice !== undefined && {
        salePrice: salePrice ? Number(salePrice) : null,
      }),
      ...(currency !== undefined && { currency }),
      ...(hasCertificate !== undefined && { hasCertificate }),
      ...(status !== undefined && { status }),
      ...(scheduledAt !== undefined && {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      }),

      ...(translations.length > 0 && {
        translations: {
          upsert: translations.map((t) => ({
            where: { courseId_locale: { courseId, locale: t.locale } },
            create: {
              locale: t.locale,
              title: t.title,
              description: t.description,
              whatYouWillLearn: t.whatYouWillLearn || [],
              requirements: t.requirements || [],
            },
            update: {
              ...(t.title !== undefined && { title: t.title }),
              ...(t.description !== undefined && {
                description: t.description,
              }),
              ...(t.whatYouWillLearn !== undefined && {
                whatYouWillLearn: t.whatYouWillLearn,
              }),
              ...(t.requirements !== undefined && {
                requirements: t.requirements,
              }),
            },
          })),
        },
      }),

      ...(sections.length > 0 && {
        sections: {
          create: sections.map((sec, secIdx) => ({
            order: sec.order || secIdx + 1,
            translations: {
              create: (sec.translations || []).map((t) => ({
                locale: t.locale,
                title: t.title,
              })),
            },
            lessons: {
              create: (sec.lessons || []).map((les, lesIdx) => ({
                order: les.order || lesIdx + 1,
                durationMinutes: Number(les.durationMinutes) || 0,
                type: les.type || lessonTypeEnum.VIDEO,
                contentUrl: les.contentUrl,
                isFreePreview: les.isFreePreview ?? false,
                translations: {
                  create: (les.translations || []).map((t) => ({
                    locale: t.locale,
                    title: t.title,
                    description: t.description,
                  })),
                },
              })),
            },
          })),
        },
      }),
    },
    include: {
      translations: true,
      category: { select: { id: true, slug: true, translations: true } },
      instructor: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profilePhoto: true,
        },
      },
      sections: {
        orderBy: { order: "asc" },
        include: {
          translations: true,
          lessons: {
            orderBy: { order: "asc" },
            include: { translations: true },
          },
        },
      },
    },
  });

  if (newThumbnail && existingCourse.thumbnail) {
    deleteFile(existingCourse.thumbnail);
  }
  if (newPreviewVideo && existingCourse.previewVideoUrl) {
    deleteFile(existingCourse.previewVideoUrl);
  }

  return {
    course: {
      ...course,
      type: coursesType.COURSE,
    },
  };
};

export const updateCourseStatusService = async (body, params) => {
  const { status, rejectionReason } = body;
  const { courseId } = params;

  const adminCourse = await DBService.findFirst({
    model: "course",
    where: { id: courseId },
  });

  if (adminCourse) {
    const updated = await DBService.updateOne({
      model: "course",
      where: { id: courseId },
      data: { status },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      course: {
        ...updated,
        type: coursesType.COURSE,
      },
    };
  }

  const teacherCourse = await DBService.findFirst({
    model: "teacherCourse",
    where: { id: courseId },
  });

  if (teacherCourse) {
    const updated = await DBService.updateOne({
      model: "teacherCourse",
      where: { id: courseId },
      data: {
        status,
        ...(rejectionReason !== undefined
          ? { rejectionReason: status === "REJECTED" ? rejectionReason : null }
          : {}),
      },
      select: {
        id: true,
        status: true,
        rejectionReason: true,
        updatedAt: true,
      },
    });

    return {
      course: {
        ...updated,
        type: coursesType.TEACHER_COURSE,
      },
    };
  }

  const error = new Error("COURSE_NOT_FOUND");
  error.cause = 404;
  throw error;
};

export const deleteCourseService = async ({ courseId }) => {
  const existingCourse = await DBService.findFirst({
    model: "course",
    where: { id: courseId },
  });

  if (existingCourse) {
    if (existingCourse.thumbnail) {
      deleteFile(existingCourse.thumbnail);
    }
    if (existingCourse.previewVideoUrl) {
      deleteFile(existingCourse.previewVideoUrl);
    }

    await DBService.deleteOne({
      model: "course",
      where: { id: courseId },
    });

    return { success: true };
  }

  const existingTeacherCourse = await DBService.findFirst({
    model: "teacherCourse",
    where: { id: courseId },
  });

  if (existingTeacherCourse) {
    if (existingTeacherCourse.wallPaper) {
      deleteFile(existingTeacherCourse.wallPaper);
    }

    await DBService.deleteOne({
      model: "teacherCourse",
      where: { id: courseId },
    });

    return { success: true };
  }

  const error = new Error("COURSE_NOT_FOUND");
  error.cause = 404;
  throw error;
};

export const deleteSectionService = async ({ sectionId }) => {
  const existingSection = await DBService.findFirst({
    model: "courseSection",
    where: { id: sectionId },
  });

  if (!existingSection) {
    const error = new Error("SECTION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await DBService.deleteOne({
    model: "courseSection",
    where: {
      id: sectionId,
    },
  });

  return { success: true };
};

export const createSectionService = async (body, params) => {
  const { title, order, locale = "en", translations } = body;
  const { courseId } = params;

  const existingCourse = await DBService.findFirst({
    model: "course",
    where: { id: courseId },
  });

  if (!existingCourse) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const transList =
    Array.isArray(translations) && translations.length > 0
      ? translations
      : [{ locale, title: title || "Section" }];

  const section = await DBService.create({
    model: "courseSection",
    data: {
      order: Number(order) || 1,
      courseId,
      translations: {
        create: transList.map((t) => ({
          locale: t.locale || locale,
          title: t.title,
        })),
      },
    },
    include: { translations: true },
  });

  return { section };
};

export const updateSectionService = async (body, params) => {
  const { title, order, locale = "en", translations } = body;
  const { sectionId } = params;

  const existingSection = await DBService.findFirst({
    model: "courseSection",
    where: { id: sectionId },
  });

  if (!existingSection) {
    const error = new Error("SECTION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const transList =
    Array.isArray(translations) && translations.length > 0
      ? translations
      : title !== undefined
        ? [{ locale, title }]
        : [];

  const section = await DBService.updateOne({
    model: "courseSection",
    where: { id: sectionId },
    data: {
      ...(order !== undefined && { order: Number(order) }),
      ...(transList.length > 0 && {
        translations: {
          upsert: transList.map((t) => ({
            where: {
              sectionId_locale: { sectionId, locale: t.locale || locale },
            },
            create: { locale: t.locale || locale, title: t.title },
            update: { title: t.title },
          })),
        },
      }),
    },
    include: { translations: true },
  });

  return { section };
};

export const createLessonService = async (body, params) => {
  const {
    title,
    order,
    durationMinutes,
    duration,
    type,
    contentUrl,
    description,
    isFreePreview,
    locale = "en",
    translations,
  } = body;
  const { sectionId } = params;

  const existingSection = await DBService.findFirst({
    model: "courseSection",
    where: { id: sectionId },
  });

  if (!existingSection) {
    const error = new Error("SECTION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const transList =
    Array.isArray(translations) && translations.length > 0
      ? translations
      : [
          {
            locale,
            title: title || "Lesson",
            description: description || null,
          },
        ];

  const lesson = await DBService.create({
    model: "courseLesson",
    data: {
      order: Number(order) || 1,
      durationMinutes: Number(durationMinutes || duration) || 0,
      type: type || lessonTypeEnum.VIDEO,
      contentUrl,
      isFreePreview: isFreePreview ?? false,
      sectionId,
      translations: {
        create: transList.map((t) => ({
          locale: t.locale || locale,
          title: t.title,
          description: t.description || null,
        })),
      },
    },
    include: { translations: true },
  });

  return { lesson };
};

export const updateLessonService = async (body, params) => {
  const {
    title,
    order,
    durationMinutes,
    duration,
    type,
    contentUrl,
    description,
    isFreePreview,
    locale = "en",
    translations,
  } = body;
  const { lessonId } = params;

  const existingLesson = await DBService.findFirst({
    model: "courseLesson",
    where: { id: lessonId },
  });

  if (!existingLesson) {
    const error = new Error("LESSON_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const transList =
    Array.isArray(translations) && translations.length > 0
      ? translations
      : title !== undefined || description !== undefined
        ? [{ locale, title, description }]
        : [];

  const lesson = await DBService.updateOne({
    model: "courseLesson",
    where: { id: lessonId },
    data: {
      ...(order !== undefined && { order: Number(order) }),
      ...(durationMinutes !== undefined || duration !== undefined
        ? { durationMinutes: Number(durationMinutes || duration) || 0 }
        : {}),
      ...(type !== undefined && { type }),
      ...(contentUrl !== undefined && { contentUrl }),
      ...(isFreePreview !== undefined && { isFreePreview }),
      ...(transList.length > 0 && {
        translations: {
          upsert: transList.map((t) => ({
            where: {
              lessonId_locale: { lessonId, locale: t.locale || locale },
            },
            create: {
              locale: t.locale || locale,
              title: t.title || "Lesson",
              description: t.description || null,
            },
            update: {
              ...(t.title !== undefined && { title: t.title }),
              ...(t.description !== undefined && {
                description: t.description,
              }),
            },
          })),
        },
      }),
    },
    include: { translations: true },
  });

  return { lesson };
};

export const deleteLessonService = async (params) => {
  const { lessonId } = params;

  const existingLesson = await DBService.findFirst({
    model: "courseLesson",
    where: { id: lessonId },
  });

  if (!existingLesson) {
    const error = new Error("LESSON_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await DBService.deleteOne({
    model: "courseLesson",
    where: { id: lessonId },
  });

  return { success: true };
};
