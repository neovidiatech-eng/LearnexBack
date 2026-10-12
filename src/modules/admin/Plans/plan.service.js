import * as db from "../../../db/db.service.js";
import { deleteFile, deleteFiles } from "../../../utils/multer/file.utils.js";
import { throwError } from "../../../utils/response.js";
import {
  decryptEncription,
  generateEncryption,
} from "../../../utils/security/encryption.security.js";



export const getAllPlansService = async (query) => {
  const { page = 1, limit = 10, search, sortOrder, teacherId, lang } = query;
  const targetLang = lang ;

  const where = {};

  if (teacherId) {
    where.teacherId = teacherId;
  }
  if (search) {
    where.sessionPlansTranslations = {
      some: {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
    };
  }

  const plans = await db.findManyWithPaginationAndCount({
    model: "sessionPlan",
    page,
    limit,
    where,
    orderBy: { createdAt: sortOrder || "desc" },
    select: {
      id: true,
      teacherId: true,
      color: true,
      sessionsCount: true,
      price: true,
      discountType: true,
      discountValue: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      teacher: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      sessionPlansTranslations: {
        where: targetLang ? { lang: targetLang } : undefined,
      },
    },
  });

  return plans;
};

export const getPlanByIdService = async (planId, query = {}) => {
  const targetLang = query.lang || query.locale;

  const plan = await db.findOne({
    model: "sessionPlan",
    where: { id: planId },
    select: {
      id: true,
      teacherId: true,
      color: true,
      sessionsCount: true,
      price: true,
      discountType: true,
      discountValue: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      teacher: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      sessionPlansTranslations: {
        where: targetLang ? { lang: targetLang } : undefined,
      },
    },
  });
  if (!plan) {
    throwError({
      message: "PLAN_NOT_FOUND",
      status: 404,
    });
  }
  return plan;
};

