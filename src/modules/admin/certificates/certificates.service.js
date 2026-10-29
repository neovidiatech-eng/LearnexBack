import * as db from "../../../db/db.service.js";
import { throwError } from "../../../utils/response.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import PG from "pg";
import dayjs from "dayjs";

export const getAllCertificatesService = async (query) => {
  const { page = 1, limit = 10, search = "" } = query;

  const where = {};

  if (search) {
    const term = search.trim();
    where.OR = [
      {
        student: {
          user: {
            fullName: { contains: term, mode: "insensitive" },
          },
        },
      },
    ];
  }
  const startOfMonth = dayjs().startOf("month").toISOString();
  const endOfMonth = dayjs().endOf("month").toISOString();

  const [
    totalStudentsCertificates,
    totalCourses,
    totalCertificatesThisMonth,
    result,
  ] = await Promise.all([
    await db.findMany({
      model: "certificates",
      distinct: "studentId",
      select: { studentId: true },
      where,
    }),
    await db.findMany({
      model: "certificates",
      distinct: "courseId",
      where,
    }),
    await db.findMany({
      model: "certificates",
      where: {
        achivedAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    }),
    await db.findManyWithPaginationAndCount({
      model: "certificates",
      where,
      page: Math.max(1, Number(page)),
      limit: Math.max(1, Number(limit)),
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profilePhoto: true,
                phone: true,
              },
            },
          },
        },
      },
    }),
  ]);


    const resultWithCourses = await Promise.all(
    result?.items?.map(async (certificate) => {
      let course;
      if (certificate?.courseType === "COURSE") {
        course = await db.findOne({
          model: "course",
          where: { id: certificate?.courseId },
        });
      } else {
        course = await db.findOne({
          model: "TeacherCourse",
          where: { id: certificate.courseId },
          include: {
            teacher: {
              select: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profilePhoto: true,
                    phone: true,
                  },
                },
              },
            },
          },
        });
      }
      return {
        ...certificate,
        course,
        courseType: certificate.courseType.toLowerCase(),
      };
    }),
  );



  return {
    totalStudentsCertificates: totalStudentsCertificates.length,
    totalCourses: totalCourses.length,
    totalCertificatesThisMonth: totalCertificatesThisMonth.length,
    resultWithCourses,
  };
};

export const getCertificatesByIdService = async (id) => {
  let course;
  const certificate = await db.findOne({
    model: "certificates",
    where: { id },
    include: {
      student: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              phone: true,
            },
          },
        },
      },
    },
  });
  if (certificate.courseType === "COURSE") {
    course = await db.findOne({
      model: "courses",
      where: { id: certificate.courseId },
    });
  } else {
    course = await db.findOne({
      model: "TeacherCourse",
      where: { id: certificate.courseId },
      include: {
        teacher: {
          select: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profilePhoto: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  if (!certificate) {
    throwError({
      message: "CERTIFICATE_NOT_FOUND",
      status: 404,
    });
  }

  return {
    ...certificate,
    course,
    courseType: certificate.courseType.toLowerCase(),
  };
};
