import * as DBService from "../../../db/db.service.js";
import {
  roleEnum,
  courseLevelEnum,
  courseStatusEnum,
  enrollmentTypeEnum,
  lessonTypeEnum,
} from "../../../utils/Enums/index.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";

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

  if (instructorId) {
    const instructor = await DBService.findFirst({
      model: "user",
      where: {
        id: instructorId,
        role: {
          name: { equals: roleEnum.TEACHER, mode: "insensitive" },
        },
      },
    });
    if (!instructor) {
      const error = new Error("INSTRUCTOR_NOT_FOUND_OR_INVALID");
      error.cause = 404;
      throw error;
    }
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
      instructorId,
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

  return newCourse;
};

export const getAllCoursesService = async ({
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
  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(instructorId ? { instructorId } : {}),
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

  let orderBy = { createdAt: "desc" };
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "price_asc":
      orderBy = { originalPrice: "asc" };
      break;
    case "price_desc":
      orderBy = { originalPrice: "desc" };
      break;
    case "rating":
      orderBy = { avgRating: "desc" };
      break;
    case "students":
      orderBy = { totalStudentsCount: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const result = await DBService.findManyWithPaginationAndCount({
    model: "course",
    where,
    page,
    limit,
    orderBy,
    include: {
      translations: true,
      category: {
        select: { id: true, slug: true, translations: true },
      },
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
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
      _count: {
        select: {
          sections: true,
          enrollments: true,
          reviews: true,
        },
      },
    },
  });

  return {
    courses: result.items,
    pagination: result.pagination,
  };
};

export const getCourseByIdService = async ({ courseId }) => {
  const course = await DBService.findOne({
    model: "course",
    where: {
      id: courseId,
    },
    include: {
      translations: true,
      category: {
        select: { id: true, slug: true, translations: true },
      },
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
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
            include: {
              translations: true,
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

  return { course };
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

  if (instructorId) {
    const instructor = await DBService.findFirst({
      model: "user",
      where: {
        id: instructorId,
        role: { name: { equals: roleEnum.TEACHER, mode: "insensitive" } },
      },
    });
    if (!instructor) {
      const error = new Error("INSTRUCTOR_NOT_FOUND_OR_INVALID");
      error.cause = 404;
      throw error;
    }
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
      ...(instructorId !== undefined && { instructorId }),
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
          firstName: true,
          lastName: true,
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

  return { course };
};
export const updateCourseStatusService = async (body, params) => {
  const { status } = body;
  const { courseId } = params;

  if (!Object.values(courseStatusEnum).includes(status)) {
    const error = new Error("INVALID_COURSE_STATUS");
    error.cause = 400;
    throw error;
  }

  const existingCourse = await DBService.findFirst({
    model: "course",
    where: { id: courseId },
  });

  if (!existingCourse) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const course = await DBService.updateOne({
    model: "course",
    where: {
      id: courseId,
    },
    data: {
      status,
    },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  return { course };
};

export const deleteCourseService = async ({ courseId }) => {
  const existingCourse = await DBService.findFirst({
    model: "course",
    where: { id: courseId },
  });

  if (!existingCourse) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  if (existingCourse.thumbnail) {
    deleteFile(existingCourse.thumbnail);
  }
  if (existingCourse.previewVideoUrl) {
    deleteFile(existingCourse.previewVideoUrl);
  }

  await DBService.deleteOne({
    model: "course",
    where: {
      id: courseId,
    },
  });

  return { success: true };
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
  const { title, order } = body;
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

  const section = await DBService.create({
    model: "courseSection",
    data: {
      title,
      order: Number(order) || 1,
      courseId,
    },
  });
  return { section };
};

export const updateSectionService = async (body, params) => {
  const { title, order } = body;
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

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (order !== undefined) updateData.order = Number(order);

  const section = await DBService.updateOne({
    model: "courseSection",
    where: { id: sectionId },
    data: updateData,
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

  const lesson = await DBService.create({
    model: "courseLesson",
    data: {
      title,
      order: Number(order) || 1,
      durationMinutes: Number(durationMinutes || duration) || 0,
      type: type || lessonTypeEnum.VIDEO,
      contentUrl,
      description,
      isFreePreview: isFreePreview ?? false,
      sectionId,
    },
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

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (order !== undefined) updateData.order = Number(order);
  if (durationMinutes !== undefined || duration !== undefined) {
    updateData.durationMinutes = Number(durationMinutes || duration) || 0;
  }
  if (type !== undefined) updateData.type = type;
  if (contentUrl !== undefined) updateData.contentUrl = contentUrl;
  if (description !== undefined) updateData.description = description;
  if (isFreePreview !== undefined) updateData.isFreePreview = isFreePreview;

  const lesson = await DBService.updateOne({
    model: "courseLesson",
    where: { id: lessonId },
    data: updateData,
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
