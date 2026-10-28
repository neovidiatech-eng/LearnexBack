import * as db from "../../../db/db.service.js";
import { throwError } from "../../../utils/response.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import PG from "pg";

export const getAllCertificatesService = async (query) => {
  const { page = 1, limit = 10, search = ""} = query;

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

  const result = await db.findManyWithPaginationAndCount({
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
  });

  return result;
};

export const getCertificatesByIdService = async (id) => {



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

  if (!certificate) {
    throwError({
      message: "CERTIFICATE_NOT_FOUND",
      status: 404,
    });
  }

  return certificate;
};

