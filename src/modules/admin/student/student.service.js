import * as DBService from "../../../db/db.service.js";
import { authProviderEnum } from "../../../utils/Enums/authProvider.enum.js";
import { userStatusEnum } from "../../../utils/Enums/userStatus.enum.js";
import { enrollmentStatusEnum } from "../../../utils/Enums/enrollmentStatus.enum.js";
import { generateHash } from "../../../utils/security/hash.security.js";
import { generateEncryption } from "../../../utils/security/encryption.security.js";
import { baseRoleEnum } from "../../../utils/Enums/role.enum.js";
import ExcelJS from "exceljs";

export const getAllStudentsService = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
} = {}) => {
  const where = {
    ...(status ? { user: { status } } : {}),
    ...(search
      ? {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };

  const select = {
    id: true,
    dateOfBirth: true,
    notes: true,
    createdAt: true,
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
        profilePhoto: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        courseEnrollments: {
          select: {
            id: true,
            status: true,
            progressPercent: true,
            paidAmount: true,
            course: {
              select: { id: true, translations: true },
            },
          },
        },
      },
    },
  };

  const result = await DBService.findManyWithPaginationAndCount({
    model: "student",
    where,
    page,
    limit,
    orderBy: { createdAt: "desc" },
    select,
  });

  return {
    students: result.items,
    pagination: result.pagination,
  };
};

export const getStudentByIdService = async (studentId) => {
  const student = await DBService.findFirst({
    model: "student",
    where: {
      OR: [{ id: studentId }, { userId: studentId }],
    },
    select: {
      id: true,
      dateOfBirth: true,
      notes: true,
      createdAt: true,
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
          confirmEmail: true,
          provider: true,
          profilePhoto: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          courseEnrollments: {
            select: {
              id: true,
              status: true,
              progressPercent: true,
              paidAmount: true,
              course: {
                select: { id: true, translations: true },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return student;
};

export const updateStudentService = async (body, studentId) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    country,
    dateOfBirth,
    status,
    notes,
    courseIds,
  } = body;

  const existingStudent = await DBService.findFirst({
    model: "student",
    where: {
      OR: [{ id: studentId }, { userId: studentId }],
    },
    include: { user: true },
  });

  if (!existingStudent) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (email && email.toLowerCase() !== existingStudent.user.email) {
    const emailExist = await DBService.findFirst({
      model: "user",
      where: {
        email: email.toLowerCase(),
        id: { not: existingStudent.userId },
      },
    });
    if (emailExist) {
      const error = new Error("EMAIL_ALREADY_EXISTS");
      error.cause = 409;
      throw error;
    }
  }

  if (courseIds && courseIds.length) {
    const existingCourse = await DBService.findMany({
      model: "course",
      where: {
        id: { in: courseIds },
      },
      select: { id: true },
    });
    if (existingCourse.length !== courseIds.length) {
      const error = new Error("COURSES_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
  }

  const hashPassword = password ? await generateHash({ plainText: password }) : undefined;
  const encPhone = phone ? await generateEncryption({ plainText: phone }) : undefined;

  const student = await DBService.updateOne({
    model: "student",
    where: { id: existingStudent.id },
    data: {
      ...(dateOfBirth !== undefined && {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      }),
      ...(notes !== undefined && { notes }),
      user: {
        update: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email: email.toLowerCase() }),
          ...(hashPassword && { password: hashPassword }),
          ...(encPhone && { phone: encPhone }),
          ...(country && { country }),
          ...(status && { status }),
          ...(courseIds && {
            courseEnrollments: {
              deleteMany: {},
              create: courseIds.map((courseId) => ({
                courseId,
                status: enrollmentStatusEnum.ACTIVE,
                progressPercent: 0,
                paidAmount: 0,
              })),
            },
          }),
        },
      },
    },
    select: {
      id: true,
      dateOfBirth: true,
      notes: true,
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
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          courseEnrollments: {
            include: {
              course: {
                select: { id: true, translations: true },
              },
            },
          },
        },
      },
    },
  });

  return student;
};

export const changeStudentStatusService = async (studentId, status) => {
  const student = await DBService.findFirst({
    model: "student",
    where: {
      OR: [{ id: studentId }, { userId: studentId }],
    },
  });

  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const updatedUser = await DBService.updateOne({
    model: "user",
    where: { id: student.userId },
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

export const deleteStudentService = async (studentId) => {
  const student = await DBService.findFirst({
    model: "student",
    where: {
      OR: [{ id: studentId }, { userId: studentId }],
    },
  });

  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await DBService.deleteOne({
    model: "user",
    where: { id: student.userId },
  });

  return { success: true };
};

export const createStudentsService = async (body) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    country,
    dateOfBirth,
    status,
    notes,
    courseIds = [],
  } = body;

  const hashPassword = await generateHash({ plainText: password });
  const encPhone = phone ? await generateEncryption({ plainText: phone }) : null;

  const emailExist = await DBService.findFirst({
    model: "user",
    where: { email: email.toLowerCase() },
  });
  if (emailExist) {
    const error = new Error("EMAIL_ALREADY_EXISTS");
    error.cause = 409;
    throw error;
  }

  if (courseIds.length) {
    const existingCourse = await DBService.findMany({
      model: "course",
      where: {
        id: { in: courseIds },
      },
      select: { id: true },
    });
    if (existingCourse.length !== courseIds.length) {
      const error = new Error("COURSES_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
  }

  const studentRole = await DBService.findFirst({
    model: "role",
    where: { name: baseRoleEnum.STUDENT },
    select: { id: true },
  });

  const student = await DBService.create({
    model: "student",
    data: {
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      notes,
      user: {
        create: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          password: hashPassword,
          phone: encPhone,
          country,
          roleId: studentRole?.id || null,
          status: status || userStatusEnum.ACTIVE,
          provider: authProviderEnum.SYSTEM,
          confirmEmail: new Date(),
          ...(courseIds.length && {
            courseEnrollments: {
              create: courseIds.map((courseId) => ({
                courseId,
                status: enrollmentStatusEnum.ACTIVE,
                progressPercent: 0,
                paidAmount: 0,
              })),
            },
          }),
        },
      },
    },
    select: {
      id: true,
      dateOfBirth: true,
      notes: true,
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
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          courseEnrollments: {
            include: {
              course: {
                select: { id: true, translations: true },
              },
            },
          },
        },
      },
    },
  });

  return student;
};

export const exportStudentsToExcelService = async ({
  search = "",
  status,
} = {}) => {
  const where = {
    ...(status ? { user: { status } } : {}),
    ...(search
      ? {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { country: { contains: search, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };

  const students = await DBService.findMany({
    model: "student",
    where,
    orderBy: { createdAt: "desc" },
    select: {
      dateOfBirth: true,
      notes: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          country: true,
          status: true,
          courseEnrollments: {
            select: {
              progressPercent: true,
            },
          },
        },
      },
    },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LearnX LMS";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Students");

  worksheet.columns = [
    { header: "Email", key: "email", width: 30 },
    { header: "Name", key: "name", width: 25 },
    { header: "Country", key: "country", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Joined Date", key: "joined", width: 20 },
    { header: "Courses", key: "courses", width: 15 },
    { header: "Avg Progress", key: "progress", width: 15 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "2F4F4F" },
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  students.forEach((item) => {
    const user = item.user;
    const enrollmentsCount = user.courseEnrollments.length;
    const totalProgress = user.courseEnrollments.reduce(
      (sum, e) => sum + Number(e.progressPercent || 0),
      0
    );
    const avgProgress =
      enrollmentsCount > 0
        ? `${Math.round(totalProgress / enrollmentsCount)}%`
        : "0%";

    worksheet.addRow({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      country: user.country || "N/A",
      status: user.status,
      joined: new Date(item.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      courses: enrollmentsCount,
      progress: avgProgress,
    });
  });

  return workbook;
};
