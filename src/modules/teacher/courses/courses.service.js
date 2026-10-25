import dbService from "../../../db/db.service.js";
import { requestPriorityEnum, requestReferenceModelEnum, requestTabEnum, requestTypeEnum } from "../../../utils/Enums/request.enum.js";
import { coursesType, teacherCourseStatusEnum } from "../../../utils/Enums/teacherCourse.enum.js";
import fs from "fs/promises";
import path from "path";
import { createSystemRequest } from "../../../utils/helpers/requests.helper.js";

export const createTeacherCourse = async ({
  teacherId,
  userId,
  name,
  description,
  price,
  totalHours,
  wallPaper,
  categoryId,
  previewVideoUrl,
  level,
  language,
}) => {
  if (categoryId) {
    const category = await dbService.findFirst({
      model: "category",
      where: { id: categoryId },
    });
    if (!category) {
      const error = new Error("CATEGORY_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
  }

  const course = await dbService.create({
    model: "teacherCourse",
    data: {
      teacherId,
      name,
      description,
      price,
      totalHours,
      wallPaper,
      ...(categoryId ? { categoryId } : {}),
      ...(previewVideoUrl ? { previewVideoUrl } : {}),
      ...(level ? { level } : {}),
      ...(language ? { language } : {}),
    },
  });

  let requesterId = userId;
  if (!requesterId && teacherId) {
    const teacher = await dbService.findFirst({
      model: "teacher",
      where: { id: teacherId },
      select: { userId: true },
    });
    requesterId = teacher?.userId;
  }

  if (requesterId) {
    await createSystemRequest({
      tab: requestTabEnum.TEACHER,
      type: requestTypeEnum.COURSE_APPROVAL,
      priority: requestPriorityEnum.HIGH,
      requesterId,
      requesterRole: requestTabEnum.TEACHER,
      referenceId: course.id,
      referenceModel: requestReferenceModelEnum.TEACHER_COURSE,
      details: {
        courseName: course.name,
        price: course.price,
        totalHours: course.totalHours,
      },
    });
  }

  return {
    ...course,
    type: coursesType.TEACHER_COURSE,
  };
};

export const getCourses = async ({
  teacherId,
  role,
  search,
  categoryId,
  level,
  language,
  page,
  limit,
}) => {
  const where = {
    ...(role === "teacher"
      ? { teacherId }
      : { status: teacherCourseStatusEnum.APPROVED }),
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive",
      },
    }),
    ...(categoryId && { categoryId }),
    ...(level && { level }),
    ...(language && { language }),
  };

  const allCourses = await dbService.findMany({
    model: "teacherCourse",
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      wallPaper: true,
      previewVideoUrl: true,
      provider: true,
      level: true,
      language: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          slug: true,
          translations: true,
        },
      },
      name: true,
      description: true,
      price: true,
      totalHours: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const allCoursesWithType = allCourses.map((course) => {
    return {
      ...course,
      type: coursesType.TEACHER_COURSE,
    };
  });

  return allCoursesWithType;
};

export const getCourseById = async ({ courseId, teacherId }) => {
  const course = await dbService.findFirst({
    model: "teacherCourse",
    where: {
      id: courseId,
      // المدرس صاحب الكورس يشوفه بأي status
      // أي حد تاني يشوف APPROVED بس
      ...(teacherId ? { teacherId } : { status: "APPROVED" }),
    },
    include: {
      category: {
        select: {
          id: true,
          slug: true,
          translations: true,
        },
      },
      sections: {
        orderBy: {
          order: "asc",
        },
        include: {
          items: {
            orderBy: {
              order: "asc",
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

  return {
    ...course,
    type: coursesType.TEACHER_COURSE,
  };
};

export const updateTeacherCourse = async ({
  courseId,
  teacherId,
  userId,
  name,
  description,
  price,
  totalHours,
  wallPaper,
  categoryId,
  previewVideoUrl,
  level,
  language,
}) => {
  const course = await dbService.findFirst({
    model: "teacherCourse",
    where: {
      id: courseId,
      teacherId,
    },
    select: {
      id: true,
      wallPaper: true,
    },
  });

  if (!course) {
    const error = new Error("TEACHER_COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (categoryId) {
    const category = await dbService.findFirst({
      model: "category",
      where: { id: categoryId },
    });
    if (!category) {
      const error = new Error("CATEGORY_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
  }

  const updateCourse = await dbService.updateOne({
    model: "teacherCourse",
    where: {
      id: courseId,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(totalHours !== undefined && { totalHours }),
      ...(wallPaper !== undefined && { wallPaper }),
      ...(categoryId !== undefined && { categoryId }),
      ...(previewVideoUrl !== undefined && { previewVideoUrl }),
      ...(level !== undefined && { level }),
      ...(language !== undefined && { language }),
    },
  });

  if (
    wallPaper !== undefined &&
    course.wallPaper &&
    course.wallPaper !== wallPaper
  ) {
    const filePath = path.resolve(course.wallPaper);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.log("error in deleting file: ", error);
      }
    }
  }

  return {
    ...updateCourse,
    type: coursesType.TEACHER_COURSE,
  };
};;

export const deleteCourse = async ({ courseId, teacherId }) => {
  const course = await dbService.findFirst({
    model: "teacherCourse",
    where: {
      id: courseId,
      teacherId,
    },
    select: {
      id: true,
      wallPaper: true,
    },
  });

  if (!course) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await dbService.deleteOne({
    model: "teacherCourse",
    where: {
      id: courseId,
    },
  });

  if (course.wallPaper) {
    const filePath = path.resolve(course.wallPaper);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.log("error in deleting file: ", error);
      }
    }
  }

  return {
    ...course,
    type: coursesType.TEACHER_COURSE,
  };
};
