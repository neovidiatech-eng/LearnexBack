import * as db from "../../../db/db.service.js";
import { throwError } from "../../../utils/response.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";

export const getAllCertificatesService = async (query) => {
  const { page = 1, limit = 10, search = "", type, status } = query;

  const where = {};

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { issuer: { contains: term, mode: "insensitive" } },
      {
        teacher: {
          user: {
            fullName: { contains: term, mode: "insensitive" },
          },
        },
      },
    ];
  }

  const result = await db.findManyWithPaginationAndCount({
    model: "teacherCertificate",
    where,
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    orderBy: { createdAt: "desc" },
    include: {
      teacher: {
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
    model: "teacherCertificate",
    where: { id },
    include: {
      teacher: {
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

export const deleteCertificatesService = async (id) => {
  const certificate = await db.findOne({
    model: "teacherCertificate",
    where: { id },
  });

  if (!certificate) {
    throwError({
      message: "CERTIFICATE_NOT_FOUND",
      status: 404,
    });
  }

  if (certificate.fileUrl) {
    deleteFile(certificate.fileUrl);
  }

  await db.deleteOne({
    model: "teacherCertificate",
    where: { id },
  });

  return certificate;
};
