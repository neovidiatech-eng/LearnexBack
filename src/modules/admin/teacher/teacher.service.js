import ExcelJS from "exceljs";
import * as dbService from "../../../db/db.service.js";
import { authProviderEnum } from "../../../utils/Enums/authProvider.enum.js";
import { userStatusEnum } from "../../../utils/Enums/userStatus.enum.js";
import { generateEncryption } from "../../../utils/security/encryption.security.js";
import { generateHash } from "../../../utils/security/hash.security.js";
import { ROLES } from "../../../utils/Permissions/permissions.js";
import { emailEvent } from "../../../utils/events/email.event.js";

export const createTeacherService = async (body) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    subject,
    experienceYears,
    status,
    bio,
    linkedinUrl,
    country,
    courseIds = [],
  } = body;

  const defaultPassword = password || "Teacher@LearnX2026!";
  const hashPassword = await generateHash({ plainText: defaultPassword });
  const encPhone = phone
    ? await generateEncryption({ plainText: phone })
    : null;

  const emailExist = await dbService.findFirst({
    model: "user",
    where: { email: email.toLowerCase() },
  });
  if (emailExist) {
    const error = new Error("EMAIL_ALREADY_EXISTS");
    error.cause = 409;
    throw error;
  }

  if (courseIds.length) {
    const courses = await dbService.findMany({
      model: "course",
      where: {
        id: { in: courseIds },
      },
      select: {
        id: true,
      },
    });
    if (courses.length !== courseIds.length) {
      const error = new Error("COURSES_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
  }

  const teacherRole = await dbService.findFirst({
    model: "role",
    where: {
      roleTranslations: {
        some: { name: ROLES.TEACHER },
      },
    },
    select: { id: true },
  });

  const teacher = await dbService.create({
    model: "teacher",
    data: {
      subject,
      experienceYears: Number(experienceYears) || 0,
      bio,
      linkedinUrl,
      user: {
        create: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          password: hashPassword,
          phone: encPhone,
          country,
          roleId: teacherRole?.id || null,
          status: status || userStatusEnum.ACTIVE,
          provider: authProviderEnum.SYSTEM,
          confirmEmail: new Date(),
        },
      },
    },
    select: {
      id: true,
      subject: true,
      experienceYears: true,
      bio: true,
      linkedinUrl: true,
      cvUrl: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          status: true,
          profilePhoto: true,
          role: {
            select: {
              id: true,
              roleTranslations: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  if (courseIds.length) {
    await dbService.updateMany({
      model: "course",
      where: { id: { in: courseIds } },
      data: { instructorId: teacher.user.id },
    });
  }

  return teacher;
};

export const getAllTeachersService = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  subject,
} = {}) => {
  const where = {
    ...(status ? { user: { status } } : {}),
    ...(subject ? { subject: { contains: subject, mode: "insensitive" } } : {}),
    ...(search
      ? {
          OR: [
            { subject: { contains: search, mode: "insensitive" } },
            {
              user: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const select = {
    id: true,
    subject: true,
    experienceYears: true,
    bio: true,
    linkedinUrl: true,
    cvUrl: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        country: true,
        status: true,
        profilePhoto: true,
        courses: {
          select: {
            id: true,
            totalStudentsCount: true,
            avgRating: true,
            translations: true,
          },
        },
      },
    },
  };

  const result = await dbService.findManyWithPaginationAndCount({
    model: "teacher",
    where,
    page,
    limit,
    orderBy: { createdAt: "desc" },
    select,
  });

  return {
    teachers: result.items,
    pagination: result.pagination,
  };
};

export const getTeacherByIdService = async (teacherId) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: {
      OR: [{ id: teacherId }, { userId: teacherId }],
    },
    select: {
      id: true,
      subject: true,
      experienceYears: true,
      bio: true,
      linkedinUrl: true,
      cvUrl: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          status: true,
          profilePhoto: true,
          courses: {
            select: {
              id: true,
              level: true,
              status: true,
              originalPrice: true,
              totalStudentsCount: true,
              avgRating: true,
              reviewsCount: true,
              translations: true,
              category: {
                select: { id: true, slug: true, translations: true },
              },
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return teacher;
};

export const updateTeacherService = async (body, teacherId) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    subject,
    experienceYears,
    status,
    bio,
    linkedinUrl,
    country,
  } = body;

  const existingTeacher = await dbService.findFirst({
    model: "teacher",
    where: {
      OR: [{ id: teacherId }, { userId: teacherId }],
    },
    include: { user: true },
  });

  if (!existingTeacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (email && email.toLowerCase() !== existingTeacher.user.email) {
    const emailExist = await dbService.findFirst({
      model: "user",
      where: {
        email: email.toLowerCase(),
        id: { not: existingTeacher.userId },
      },
    });
    if (emailExist) {
      const error = new Error("EMAIL_ALREADY_EXISTS");
      error.cause = 409;
      throw error;
    }
  }

  const hashPassword = password
    ? await generateHash({ plainText: password })
    : undefined;
  const encPhone = phone
    ? await generateEncryption({ plainText: phone })
    : undefined;

  const teacher = await dbService.updateOne({
    model: "teacher",
    where: { id: existingTeacher.id },
    data: {
      ...(subject && { subject }),
      ...(experienceYears !== undefined && {
        experienceYears: Number(experienceYears),
      }),
      ...(bio !== undefined && { bio }),
      ...(linkedinUrl !== undefined && { linkedinUrl }),
      user: {
        update: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email: email.toLowerCase() }),
          ...(hashPassword && { password: hashPassword }),
          ...(encPhone && { phone: encPhone }),
          ...(country && { country }),
          ...(status && { status }),
        },
      },
    },
    select: {
      id: true,
      subject: true,
      experienceYears: true,
      bio: true,
      linkedinUrl: true,
      cvUrl: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          status: true,
        },
      },
    },
  });

  return teacher;
};

export const changeTeacherStatusService = async (teacherId, status) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: {
      OR: [{ id: teacherId }, { userId: teacherId }],
    },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const updatedUser = await dbService.updateOne({
    model: "user",
    where: { id: teacher.userId },
    data: { status },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const assignCoursesToTeacherService = async (
  teacherId,
  courseIds = [],
) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: {
      OR: [{ id: teacherId }, { userId: teacherId }],
    },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (courseIds.length) {
    const courses = await dbService.findMany({
      model: "course",
      where: { id: { in: courseIds } },
      select: { id: true },
    });

    if (courses.length !== courseIds.length) {
      const error = new Error("COURSES_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
  }

  await dbService.updateMany({
    model: "course",
    where: { id: { in: courseIds } },
    data: { instructorId: teacher.userId },
  });

  return {
    message: "COURSES_ASSIGNED_SUCCESSFULLY",
    assignedCoursesCount: courseIds.length,
  };
};

export const updateTeacherCvService = async (teacherId, file) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: {
      OR: [{ id: teacherId }, { userId: teacherId }],
    },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const updatedTeacher = await dbService.updateOne({
    model: "teacher",
    where: { id: teacher.id },
    data: {
      ...(file && {
        cvUrl: file.relativeDestination,
      }),
    },
    select: {
      id: true,
      cvUrl: true,
      updatedAt: true,
    },
  });

  return updatedTeacher;
};

export const deleteTeacherService = async (teacherId) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: {
      OR: [{ id: teacherId }, { userId: teacherId }],
    },
    select: { userId: true },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await dbService.deleteOne({
    model: "user",
    where: { id: teacher.userId },
  });

  return { success: true };
};

export const exportTeachersToExcelService = async ({
  search = "",
  status,
} = {}) => {
  const where = {
    ...(status ? { user: { status } } : {}),
    ...(search
      ? {
          OR: [
            { subject: { contains: search, mode: "insensitive" } },
            {
              user: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const teachers = await dbService.findMany({
    model: "teacher",
    where,
    orderBy: { createdAt: "desc" },
    select: {
      subject: true,
      experienceYears: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          status: true,
          courses: {
            select: {
              totalStudentsCount: true,
              avgRating: true,
            },
          },
        },
      },
    },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LearnX LMS";
  const worksheet = workbook.addWorksheet("Teachers");

  worksheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Subject", key: "subject", width: 22 },
    { header: "Experience", key: "experience", width: 16 },
    { header: "Status", key: "status", width: 14 },
    { header: "Courses", key: "coursesCount", width: 14 },
    { header: "Students", key: "totalStudents", width: 14 },
    { header: "Rating", key: "avgRating", width: 14 },
    { header: "Joined Date", key: "joined", width: 18 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "0A3565" },
  };

  teachers.forEach((item) => {
    const user = item.user;
    const totalCourses = user.courses.length;
    const totalStudents = user.courses.reduce(
      (sum, c) => sum + (c.totalStudentsCount || 0),
      0,
    );
    const avgRating =
      totalCourses > 0
        ? (
            user.courses.reduce((sum, c) => sum + Number(c.avgRating || 0), 0) /
            totalCourses
          ).toFixed(1)
        : "0.0";

    worksheet.addRow({
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone || "N/A",
      subject: item.subject || "General",
      experience: `${item.experienceYears || 0} yrs`,
      status: user.status,
      coursesCount: totalCourses,
      totalStudents: totalStudents,
      avgRating: avgRating,
      joined: new Date(item.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    });
  });

  return workbook;
};

export const approveTeacherService = async (teacherId) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: {
      OR: [{ id: teacherId }, { userId: teacherId }],
    },
    select: {
      id: true,
      user: { select: { email: true, firstName: true } },
    },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await dbService.updateOne({
    model: "teacher",
    where: { id: teacher.id },
    data: {
      rejectionReason: null,
      user: {
        update: {
          status: userStatusEnum.ACTIVE,
          confirmEmail: new Date(),
        },
      },
    },
  });

  emailEvent.emit("teacherApproved", {
    to: teacher.user.email,
    name: teacher.user.firstName,
  });
  return { success: true };
};

export const rejectTeacherService = async (teacherId, body) => {
  const { rejectionReason } = body;
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: {
      OR: [{ id: teacherId }, { userId: teacherId }],
    },
    select: { id: true, user: { select: { email: true, firstName: true } } },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await dbService.updateOne({
    model: "teacher",
    where: { id: teacher.id },
    data: {
      rejectionReason,
      user: {
        update: {
          status: userStatusEnum.SUSPENDED,
        },
      },
    },
  });
emailEvent.emit("teacherRejected", {
  to: teacher.user.email,
  name: teacher.user.firstName,
  reason: rejectionReason, 
});

  return { success: true };
};

