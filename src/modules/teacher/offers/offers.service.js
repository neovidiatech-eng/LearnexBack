import * as dbService from "../../../db/db.service.js";
import {
  offerStatusEnum,
  offerTypeEnum,
} from "../../../utils/Enums/offer.enum.js";

const getTeacherProfile = async (userId) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return teacher;
};

export const createOfferService = async (userId, body) => {
  const teacher = await getTeacherProfile(userId);

  const {
    courseId,
    target,
    offerType = offerTypeEnum.PERCENTAGE,
    discount,
    startDate,
    endDate,
    status,
    translations = [],
  } = body;

  if (!courseId) {
    const error = new Error("COURSE_ID_REQUIRED");
    error.cause = 400;
    throw error;
  }

  const teacherCourse = await dbService.findFirst({
    model: "teacherCourse",
    where: { id: courseId, teacherId: teacher.id },
  });

  if (!teacherCourse) {
    const error = new Error("TEACHER_COURSE_NOT_FOUND_OR_UNAUTHORIZED");
    error.cause = 404;
    throw error;
  }

  for (const t of translations) {
    const existingTranslation = await dbService.findFirst({
      model: "offerTranslation",
      where: { name: t.name.trim(), locale: t.locale },
    });
    if (existingTranslation) {
      const error = new Error(
        `OFFER_NAME_ALREADY_EXISTS_FOR_LOCALE_${t.locale.toUpperCase()}`,
      );
      error.cause = 409;
      throw error;
    }
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    const error = new Error("END_DATE_MUST_BE_AFTER_START_DATE");
    error.cause = 400;
    throw error;
  }

  if (end < new Date()) {
    const error = new Error("END_DATE_CANNOT_BE_IN_PAST");
    error.cause = 400;
    throw error;
  }

  if (
    offerType === offerTypeEnum.PERCENTAGE &&
    discount !== undefined &&
    discount !== null &&
    (discount <= 0 || discount > 100)
  ) {
    const error = new Error("PERCENTAGE_DISCOUNT_MUST_BE_BETWEEN_1_AND_100");
    error.cause = 400;
    throw error;
  }

  const finalStatus =
    status ||
    (start > new Date() ? offerStatusEnum.SCHEDULED : offerStatusEnum.ACTIVE);

  const offer = await dbService.create({
    model: "offer",
    data: {
      teacherCourseId: courseId,
      courseId: null, 
      target: target?.trim() || "All Users",
      offerType,
      discount,
      startDate: start,
      endDate: end,
      status: finalStatus,
      translations: {
        create: translations.map((t) => ({
          locale: t.locale,
          name: t.name.trim(),
          offerDesc: t.offerDesc.trim(),
        })),
      },
    },
    include: {
      translations: true,
      teacherCourse: {
        select: {
          id: true,
          name: true,
          price: true,
          wallPaper: true,
          status: true,
        },
      },
    },
  });

  return { offer };
};

export const getAllOffersService = async (userId, query = {}) => {
  const teacher = await getTeacherProfile(userId);

  const {
    courseId,
    page = 1,
    limit = 10,
    search = "",
    locale,
    status,
    offerType,
    sort = "createdAt",
    sortType = "desc",
  } = query;

  const where = {
    teacherCourse: { teacherId: teacher.id },
    ...(courseId ? { teacherCourseId: courseId } : {}),
    ...(status ? { status } : {}),
    ...(offerType ? { offerType } : {}),
    ...(search
      ? {
          OR: [
            {
              translations: {
                some: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            },
            {
              translations: {
                some: {
                  offerDesc: { contains: search, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
  };

  const orderBy = {
    [sort]: sortType,
  };

  const result = await dbService.findManyWithPaginationAndCount({
    model: "offer",
    where,
    page,
    limit,
    orderBy,
    include: {
      teacherCourse: {
        select: {
          id: true,
          name: true,
          price: true,
          wallPaper: true,
          status: true,
        },
      },
      translations: {
        where: locale ? { locale } : undefined,
      },
    },
  });

  return {
    offers: result.items,
    pagination: result.pagination,
  };
};

export const getOfferByIdService = async (userId, offerId, locale) => {
  const teacher = await getTeacherProfile(userId);

  const offer = await dbService.findFirst({
    model: "offer",
    where: {
      id: offerId,
      teacherCourse: { teacherId: teacher.id },
    },
    include: {
      teacherCourse: {
        select: {
          id: true,
          name: true,
          price: true,
          wallPaper: true,
          status: true,
        },
      },
      translations: {
        where: locale ? { locale } : undefined,
      },
    },
  });

  if (!offer) {
    const error = new Error("OFFER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return { offer };
};

export const updateOfferService = async (userId, offerId, body) => {
  const teacher = await getTeacherProfile(userId);

  const {
    courseId,
    target,
    offerType,
    discount,
    startDate,
    endDate,
    status,
    translations,
  } = body;

  const offer = await dbService.findFirst({
    model: "offer",
    where: {
      id: offerId,
      teacherCourse: { teacherId: teacher.id },
    },
    include: {
      translations: true,
    },
  });

  if (!offer) {
    const error = new Error("OFFER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (courseId && courseId !== offer.teacherCourseId) {
    const teacherCourse = await dbService.findFirst({
      model: "teacherCourse",
      where: { id: courseId, teacherId: teacher.id },
    });
    if (!teacherCourse) {
      const error = new Error("TEACHER_COURSE_NOT_FOUND_OR_UNAUTHORIZED");
      error.cause = 404;
      throw error;
    }
  }

  const finalStart = startDate ? new Date(startDate) : offer.startDate;
  const finalEnd = endDate ? new Date(endDate) : offer.endDate;

  if (finalEnd < finalStart) {
    const error = new Error("END_DATE_MUST_BE_AFTER_START_DATE");
    error.cause = 400;
    throw error;
  }

  const finalType = offerType || offer.offerType;
  const finalDiscount = discount !== undefined ? discount : offer.discount;

  if (
    finalType === offerTypeEnum.PERCENTAGE &&
    finalDiscount !== null &&
    (finalDiscount <= 0 || finalDiscount > 100)
  ) {
    const error = new Error("PERCENTAGE_DISCOUNT_MUST_BE_BETWEEN_1_AND_100");
    error.cause = 400;
    throw error;
  }

  if (translations && Array.isArray(translations) && translations.length > 0) {
    for (const t of translations) {
      const duplicateName = await dbService.findFirst({
        model: "offerTranslation",
        where: {
          name: t.name.trim(),
          locale: t.locale,
          offerId: { not: offerId },
        },
      });

      if (duplicateName) {
        const error = new Error(
          `OFFER_NAME_ALREADY_EXISTS_FOR_LOCALE_${t.locale.toUpperCase()}`,
        );
        error.cause = 409;
        throw error;
      }
    }
  }

  const updatedOffer = await dbService.updateOne({
    model: "offer",
    where: { id: offerId },
    data: {
      ...(courseId !== undefined && { teacherCourseId: courseId }),
      ...(target !== undefined && { target: target.trim() }),
      ...(offerType !== undefined && { offerType }),
      ...(discount !== undefined && { discount }),
      ...(startDate !== undefined && { startDate: finalStart }),
      ...(endDate !== undefined && { endDate: finalEnd }),
      ...(status !== undefined && { status }),

      ...(translations &&
        translations.length > 0 && {
          translations: {
            upsert: translations.map((t) => ({
              where: {
                offerId_locale: {
                  offerId,
                  locale: t.locale,
                },
              },
              create: {
                locale: t.locale,
                name: t.name.trim(),
                offerDesc: t.offerDesc.trim(),
              },
              update: {
                name: t.name.trim(),
                offerDesc: t.offerDesc.trim(),
              },
            })),
          },
        }),
    },
    include: {
      translations: true,
      teacherCourse: {
        select: {
          id: true,
          name: true,
          price: true,
          wallPaper: true,
          status: true,
        },
      },
    },
  });

  return { offer: updatedOffer };
};

export const changeOfferStatusService = async (userId, offerId, body) => {
  const teacher = await getTeacherProfile(userId);
  const { status } = body;

  const offer = await dbService.findFirst({
    model: "offer",
    where: {
      id: offerId,
      teacherCourse: { teacherId: teacher.id },
    },
  });

  if (!offer) {
    const error = new Error("OFFER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const updateStatus = await dbService.updateOne({
    model: "offer",
    where: { id: offerId },
    data: { status },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  return { offer: updateStatus };
};

export const deleteOfferService = async (userId, offerId) => {
  const teacher = await getTeacherProfile(userId);

  const offer = await dbService.findFirst({
    model: "offer",
    where: {
      id: offerId,
      teacherCourse: { teacherId: teacher.id },
    },
  });

  if (!offer) {
    const error = new Error("OFFER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await dbService.deleteOne({ model: "offer", where: { id: offerId } });
  return { success: true };
};
