import slugify from "slugify";
import * as db from "../../../db/db.service.js";
import { throwError } from "../../../utils/response.js";

export const getMyPlansService = async ({ userId, query }) => {
  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
  });

  if (!teacher) {
    throwError({
      message: "TEACHER_NOT_FOUND",
      status: 404,
    });
  }

  const targetLang = query.lang 

  const where = {
    teacherId: teacher.id,
  };

  if (query.search) {
    where.sessionPlansTranslations = {
      some: {
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ],
      },
    };
  }

  const plans = await db.findManyWithPaginationAndCount({
    model: "sessionPlan",
    where,
    page: query.page,
    limit: query.limit,
    sortOrder: query.sortOrder,
    include: {
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
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
  const targetLang = query.lang

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

export const createPlanService = async ({ body, userId }) => {
  const {
    sessionsCount,
    price,
    discountType,
    discountValue,
    color,
    isActive,
    translations,
    title,
    description,
    lang = "en",
    slug,
  } = body;

  const teacher = await db.findOne({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });

  if (!teacher) {
    throwError({
      message: "TEACHER_NOT_FOUND",
      status: 404,
    });
  }

  // Format translations array
  let formattedTranslations = [];
  if (translations && translations.length > 0) {
    formattedTranslations = translations.map((t) => ({
      lang: t.lang || "en",
      title: t.title.trim(),
      description: t.description.trim(),
      slug: t.slug || slugify(t.title, { lower: true }) || undefined,
    }));
  } 
  if (formattedTranslations.length === 0) {
    throwError({
      message: "TRANSLATIONS_REQUIRED",
      status: 400,
    });
  }

  // Check unique title per teacher
  const titles = formattedTranslations.map((t) => t.title);
  const existingPlan = await db.findFirst({
    model: "sessionPlan",
    where: {
      teacherId: teacher.id,
      sessionPlansTranslations: {
        some: {
          title: { in: titles },
        },
      },
    },
    select: { id: true },
  });

  if (existingPlan) {
    throwError({
      message: "PLAN_EXISTS",
      status: 409,
    });
  }

  const newPlan = await db.create({
    model: "sessionPlan",
    data: {
      teacherId: teacher.id,
      sessionsCount,
      price,
      discountType,
      discountValue,
      color: color || "#b36c14ff",
      isActive: isActive !== undefined ? isActive : true,
      sessionPlansTranslations: {
        create: formattedTranslations,
      },
    },
    include: {
      sessionPlansTranslations: true,
    },
  });

  return newPlan;
};

export const deletePlanService = async ({ planId, userId }) => {
  const teacher = await db.findOne({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });

  if (!teacher) {
    throwError({
      message: "TEACHER_NOT_FOUND",
      status: 404,
    });
  }

  const plan = await db.findOne({
    model: "sessionPlan",
    where: { id: planId },
    select: { id: true, teacherId: true },
  });

  if (!plan) {
    throwError({
      message: "PLAN_NOT_FOUND",
      status: 404,
    });
  }

  if (plan.teacherId !== teacher.id) {
    throwError({
      message: "NOT_AUTHORIZED",
      status: 403,
    });
  }

  await db.deleteOne({
    model: "sessionPlan",
    where: { id: planId },
  });

  return true;
};

export const updatePlanService = async ({ planId, userId, body }) => {
  const teacher = await db.findOne({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });

  if (!teacher) {
    throwError({
      message: "TEACHER_NOT_FOUND",
      status: 404,
    });
  }

  const existingPlan = await db.findOne({
    model: "sessionPlan",
    where: { id: planId },
    include: {
      sessionPlansTranslations: true,
    },
  });

  if (!existingPlan) {
    throwError({
      message: "PLAN_NOT_FOUND",
      status: 404,
    });
  }

  if (existingPlan.teacherId !== teacher.id) {
    throwError({
      message: "NOT_AUTHORIZED",
      status: 403,
    });
  }

  // Handle translations updates
  const newTranslations = [];
  if (body.translations && body.translations.length > 0) {
    newTranslations.push(...body.translations);
  } else if (body.title || body.description) {
    const targetLang = body.lang || "en";
    const existingTrans = existingPlan.sessionPlansTranslations.find(
      (t) => t.lang === targetLang,
    );
    newTranslations.push({
      lang: targetLang,
      title: body.title !== undefined ? body.title : existingTrans?.title || "",
      description:
        body.description !== undefined
          ? body.description
          : existingTrans?.description || "",
      slug:
        body.slug ||
        (body.title
          ? slugify(body.title, { lower: true })
          : existingTrans?.slug),
    });
  }

  // Check title conflicts on other plans for this teacher
  if (newTranslations.length > 0) {
    const titlesToCheck = newTranslations.map((t) => t.title).filter(Boolean);
    if (titlesToCheck.length > 0) {
      const titleConflict = await db.findFirst({
        model: "sessionPlan",
        where: {
          teacherId: teacher.id,
          id: { not: planId },
          sessionPlansTranslations: {
            some: {
              title: { in: titlesToCheck },
            },
          },
        },
        select: { id: true },
      });

      if (titleConflict) {
        throwError({
          message: "PLAN_EXISTS",
          status: 409,
        });
      }
    }
  }

  // Update sessionPlan fields
  const updateData = {};
  if (body.color !== undefined) updateData.color = body.color;
  if (body.sessionsCount !== undefined)
    updateData.sessionsCount = body.sessionsCount;
  if (body.price !== undefined) updateData.price = body.price;
  if (body.discountType !== undefined)
    updateData.discountType = body.discountType;
  if (body.discountValue !== undefined)
    updateData.discountValue = body.discountValue;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  // Execute translations upserts
  for (const trans of newTranslations) {
    if (!trans.title && !trans.description) continue;
    const existingTrans = existingPlan.sessionPlansTranslations.find(
      (t) => t.lang === trans.lang,
    );
    if (existingTrans) {
      await db.updateOne({
        model: "sessionPlanTranslation",
        where: { id: existingTrans.id },
        data: {
          ...(trans.title && { title: trans.title.trim() }),
          ...(trans.description && { description: trans.description.trim() }),
          ...(trans.slug && { slug: trans.slug.trim() }),
        },
      });
    } else {
      await db.create({
        model: "sessionPlanTranslation",
        data: {
          sessionId: planId,
          lang: trans.lang || "en",
          title: trans.title.trim(),
          description: trans.description.trim(),
          slug:
            trans.slug || slugify(trans.title, { lower: true }) || undefined,
        },
      });
    }
  }

  const updatedPlan = await db.updateOne({
    model: "sessionPlan",
    where: { id: planId },
    data: updateData,
    include: {
      sessionPlansTranslations: true,
    },
  });

  return updatedPlan;
};
