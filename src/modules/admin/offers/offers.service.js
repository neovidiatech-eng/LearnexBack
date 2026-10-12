import * as dbService from "../../../db/db.service.js";
import {
  offerStatusEnum,
  offerTypeEnum,
  offerTargetEnum,
} from "../../../utils/Enums/offer.enum.js";
import dayjs from "dayjs";

export const formatAdminOfferResponse = (offer) => {
  if (!offer) return null;
  const { teacherCourseId, targetIds, ...rest } = offer;

  const formatted = { ...rest };

  if (!formatted.course && formatted.teacherCourse) {
    formatted.course = {
      id: formatted.teacherCourse.id,
      thumbnail: formatted.teacherCourse.wallPaper,
      originalPrice: formatted.teacherCourse.price,
      title: formatted.teacherCourse.name,
    };
  }
  delete formatted.teacherCourse;

  if (offer.target === offerTargetEnum.SPECIFIC_STUDENTS) {
    formatted.studentIds = targetIds || [];
  } else if (offer.target === offerTargetEnum.SPECIFIC_TEACHERS) {
    formatted.teacherIds = targetIds || [];
  }

  return formatted;
};


export const createOfferService = async (body) => {
  const {
    courseId,
    target = offerTargetEnum.ALL_USERS,
    studentIds = [],
    teacherIds = [],
    targetIds = [],
    offerType,
    discount,
    startDate,
    endDate,
    status,
    translations = [],
  } = body;

  let resolvedCourseId = null;
  let resolvedTeacherCourseId = null;

  if (courseId) {
    const course = await dbService.findOne({
      model: "course",
      where: { id: courseId },
    });
    if (course) {
      resolvedCourseId = course.id;
    } else {
      const teacherCourse = await dbService.findOne({
        model: "teacherCourse",
        where: { id: courseId },
      });
      if (teacherCourse) {
        resolvedTeacherCourseId = teacherCourse.id;
      } else {
        const error = new Error("COURSE_NOT_FOUND");
        error.cause = 404;
        throw error;
      }
    }
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

  let resolvedTargetIds = [];

  if (target === offerTargetEnum.SPECIFIC_STUDENTS) {
    const ids = (studentIds?.length ? studentIds : targetIds) || [];
    if (!ids.length) {
      const error = new Error("STUDENT_IDS_REQUIRED_FOR_SPECIFIC_STUDENTS");
      error.cause = 400;
      throw error;
    }
    for (const sId of ids) {
      const student = await dbService.findOne({
        model: "student",
        where: { id: sId },
      });
      if (!student) {
        const error = new Error(`STUDENT_NOT_FOUND: ${sId}`);
        error.cause = 404;
        throw error;
      }
    }
    resolvedTargetIds = ids;
  } else if (target === offerTargetEnum.SPECIFIC_TEACHERS) {
    const ids = (teacherIds?.length ? teacherIds : targetIds) || [];
    if (!ids.length) {
      const error = new Error("TEACHER_IDS_REQUIRED_FOR_SPECIFIC_TEACHERS");
      error.cause = 400;
      throw error;
    }
    for (const tId of ids) {
      const teacher = await dbService.findOne({
        model: "teacher",
        where: { id: tId },
      });
      if (!teacher) {
        const error = new Error(`TEACHER_NOT_FOUND: ${tId}`);
        error.cause = 404;
        throw error;
      }
    }
    resolvedTargetIds = ids;
  } else {
    resolvedTargetIds = [];
  }

  const finalStatus =
    status ||
    (start > new Date() ? offerStatusEnum.SCHEDULED : offerStatusEnum.ACTIVE);

  const offer = await dbService.create({
    model: "offer",
    data: {
      courseId: resolvedCourseId,
      teacherCourseId: resolvedTeacherCourseId,
      target: target || offerTargetEnum.ALL_USERS,
      targetIds: resolvedTargetIds,
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
      course: {
        select: {
          id: true,
          thumbnail: true,
          originalPrice: true,
          salePrice: true,
          translations: { select: { locale: true, title: true } },
        },
      },
      teacherCourse: {
        select: {
          id: true,
          wallPaper: true,
          price: true,
          name: true,
        },
      },
    },
  });

  return { offer: formatAdminOfferResponse(offer) };
};

export const getAllOffersService = async ({
  courseId,
  page = 1,
  limit = 10,
  search = "",
  locale,
  status,
  offerType,
  target,
  sort = "createdAt",
  sortType = "desc",
} = {}) => {
  const where = {
    ...(courseId
      ? {
          OR: [{ courseId }, { teacherCourseId: courseId }],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(offerType ? { offerType } : {}),
    ...(target ? { target: { contains: target, mode: "insensitive" } } : {}),
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
            { target: { contains: search, mode: "insensitive" } },
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
      course: {
        select: {
          id: true,
          thumbnail: true,
          originalPrice: true,
          salePrice: true,
          translations: { select: { locale: true, title: true } },
        },
      },
      teacherCourse: {
        select: {
          id: true,
          wallPaper: true,
          price: true,
          name: true,
        },
      },
      translations: {
        where: locale ? { locale } : undefined,
      },
    },
  });

  const now = new Date();
  const next7Days = dayjs().add(7, "day").toDate();
  const startOfWeek = dayjs().startOf("week").toDate();

  const [
    totalOffers,
    activeOffers,
    activeThisWeek,
    expiringSoon,
    expiredOffers,
  ] = await Promise.all([
    dbService.count({
      model: "offer",
      where: { teacherCourseId: null },
    }),
    dbService.count({
      model: "offer",
      where: { teacherCourseId: null, status: offerStatusEnum.ACTIVE },
    }),
    dbService.count({
      model: "offer",
      where: {
        teacherCourseId: null,
        status: offerStatusEnum.ACTIVE,
        createdAt: { gte: startOfWeek },
      },
    }),
    dbService.count({
      model: "offer",
      where: {
        teacherCourseId: null,
        status: offerStatusEnum.ACTIVE,
        endDate: { gte: now, lte: next7Days },
      },
    }),
    dbService.count({
      model: "offer",
      where: {
        teacherCourseId: null,
        OR: [
          { status: offerStatusEnum.EXPIRED },
          { endDate: { lt: now } },
        ],
      },
    }),
  ]);

  const stats = {
    totalOffers,
    activeOffers,
    activeThisWeek,
    expiringSoon,
    expired: expiredOffers,
    expiredOffers,
  };

  return {
    stats,
    totalOffers,
    activeOffers,
    expiringSoon,
    expired: expiredOffers,
    offers: result.items.map(formatAdminOfferResponse),
    pagination: result.pagination,
  };
};

export const getOfferByIdService = async (offerId, locale) => {
  const offer = await dbService.findFirst({
    model: "offer",
    where: { id: offerId },
    include: {
      course: {
        select: {
          id: true,
          thumbnail: true,
          originalPrice: true,
          salePrice: true,
          translations: { select: { locale: true, title: true } },
        },
      },
      teacherCourse: {
        select: {
          id: true,
          wallPaper: true,
          price: true,
          name: true,
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

  return { offer: formatAdminOfferResponse(offer) };
};

export const updateOfferService = async (offerId, body) => {
  const {
    courseId,
    target,
    studentIds,
    teacherIds,
    targetIds,
    offerType,
    discount,
    startDate,
    endDate,
    status,
    translations,
  } = body;

  const offer = await dbService.findFirst({
    model: "offer",
    where: { id: offerId },
    include: {
      translations: true,
    },
  });

  if (!offer) {
    const error = new Error("OFFER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  let resolvedCourseId = undefined;
  let resolvedTeacherCourseId = undefined;

  if (courseId !== undefined) {
    if (courseId === null) {
      resolvedCourseId = null;
      resolvedTeacherCourseId = null;
    } else {
      const course = await dbService.findOne({
        model: "course",
        where: { id: courseId },
      });
      if (course) {
        resolvedCourseId = course.id;
        resolvedTeacherCourseId = null;
      } else {
        const teacherCourse = await dbService.findOne({
          model: "teacherCourse",
          where: { id: courseId },
        });
        if (teacherCourse) {
          resolvedTeacherCourseId = teacherCourse.id;
          resolvedCourseId = null;
        } else {
          const error = new Error("COURSE_NOT_FOUND");
          error.cause = 404;
          throw error;
        }
      }
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

  let resolvedTargetIds = undefined;
  const currentTarget = target !== undefined ? target : offer.target;

  if (currentTarget === offerTargetEnum.SPECIFIC_STUDENTS && (studentIds !== undefined || targetIds !== undefined || target !== undefined)) {
    const ids = (studentIds?.length ? studentIds : targetIds) || offer.targetIds || [];
    if (!ids.length) {
      const error = new Error("STUDENT_IDS_REQUIRED_FOR_SPECIFIC_STUDENTS");
      error.cause = 400;
      throw error;
    }
    for (const sId of ids) {
      const student = await dbService.findOne({
        model: "student",
        where: { id: sId },
      });
      if (!student) {
        const error = new Error(`STUDENT_NOT_FOUND: ${sId}`);
        error.cause = 404;
        throw error;
      }
    }
    resolvedTargetIds = ids;
  } else if (currentTarget === offerTargetEnum.SPECIFIC_TEACHERS && (teacherIds !== undefined || targetIds !== undefined || target !== undefined)) {
    const ids = (teacherIds?.length ? teacherIds : targetIds) || offer.targetIds || [];
    if (!ids.length) {
      const error = new Error("TEACHER_IDS_REQUIRED_FOR_SPECIFIC_TEACHERS");
      error.cause = 400;
      throw error;
    }
    for (const tId of ids) {
      const teacher = await dbService.findOne({
        model: "teacher",
        where: { id: tId },
      });
      if (!teacher) {
        const error = new Error(`TEACHER_NOT_FOUND: ${tId}`);
        error.cause = 404;
        throw error;
      }
    }
    resolvedTargetIds = ids;
  } else if (target !== undefined && target !== offerTargetEnum.SPECIFIC_STUDENTS && target !== offerTargetEnum.SPECIFIC_TEACHERS) {
    resolvedTargetIds = [];
  }

  const updatedOffer = await dbService.updateOne({
    model: "offer",
    where: { id: offerId },
    data: {
      ...(resolvedCourseId !== undefined && { courseId: resolvedCourseId }),
      ...(resolvedTeacherCourseId !== undefined && { teacherCourseId: resolvedTeacherCourseId }),
      ...(target !== undefined && { target }),
      ...(resolvedTargetIds !== undefined && { targetIds: resolvedTargetIds }),
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
      course: {
        select: {
          id: true,
          thumbnail: true,
          originalPrice: true,
          salePrice: true,
          translations: { select: { locale: true, title: true } },
        },
      },
      teacherCourse: {
        select: {
          id: true,
          wallPaper: true,
          price: true,
          name: true,
        },
      },
    },
  });

  return { offer: formatAdminOfferResponse(updatedOffer) };
};

export const changeOfferStatusService = async (offerId, body) => {
  const { status } = body;

  const offer = await dbService.findFirst({
    model: "offer",
    where: { id: offerId },
  });

  if (!offer) {
    const error = new Error("OFFER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const updateStatus = await dbService.updateOne({
    model: "offer",
    where: { id: offerId },
    data: {
      status,
    },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  return { offer: updateStatus };
};

export const deleteOfferService = async (offerId) => {
  const offer = await dbService.findFirst({
    model: "offer",
    where: { id: offerId },
  });

  if (!offer) {
    const error = new Error("OFFER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await dbService.deleteOne({ model: "offer", where: { id: offerId } });
  return { success: true };
};

/**
 * Checks whether a user is eligible for a given offer based on its target configuration
 */
export const isUserEligibleForOffer = (user, offer) => {
  if (!offer || !user) return false;

  switch (offer.target) {
    case offerTargetEnum.ALL_USERS:
      return true;

    case offerTargetEnum.ALL_STUDENTS:
      return Boolean(user.student || user.role?.slug === "STUDENT");

    case offerTargetEnum.ALL_TEACHERS:
      return Boolean(user.teacher || user.role?.slug === "TEACHER");

    case offerTargetEnum.SPECIFIC_STUDENTS:
      return Boolean(
        user.student && offer.targetIds?.includes(user.student.id)
      );

    case offerTargetEnum.SPECIFIC_TEACHERS:
      return Boolean(
        user.teacher && offer.targetIds?.includes(user.teacher.id)
      );

    case offerTargetEnum.NEW_USERS:
      // Users registered within the last 7 days (1 week) using dayjs
      return dayjs(user.createdAt).isAfter(dayjs().subtract(7, "day"));

    default:
      return true;
  }
};

