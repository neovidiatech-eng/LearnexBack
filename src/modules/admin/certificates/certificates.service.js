
import * as db from "../../../db/db.service.js";
import { throwError } from "../../../utils/response.js";

export const getAllCertificatesService = async (query) => {
  const { page = 1, limit = 10, search = "", isActive } = query;

  const where = {};

  if (isActive !== undefined) {
    where.isActive = isActive === true || isActive === "true";
  }

  if (search) {
    where.title = {
      contains: search.trim(),
      mode: "insensitive",
    };
  }

  const result = await db.findManyWithPaginationAndCount({
    model: "certificates",
    where,
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    orderBy: { createdAt: "desc" },
    include: {
      teacher: true,
    },
  });

  return result;
};

export const getCertificatesByIdService = async (id) => {
  const certificate = await db.findOne({
    model: "certificates",
    where: { id },
    include: {
      teacher: true,
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
    model: "certificates",
    where: { id },
  });

  if (!certificate) {
    throwError({
      message: "CERTIFICATE_NOT_FOUND",
      status: 404,
    });
  }

  await db.delete({
    model: "certificates",
    where: { id },
  });

  return certificate;
};
