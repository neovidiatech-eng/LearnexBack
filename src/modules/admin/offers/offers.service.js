import * as dbService from "../../../db/db.service.js";
import {
  offerStatusEnum,
  offerTypeEnum,
} from "../../../utils/Enums/offer.enum.js";

export const createOfferService = async (body) => {
  const {
    target,
    offerType,
    discount,
    startDate,
    endDate,
    status,
    translations = [],
  } = body;

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
    },
  });

  return { offer };
};

export const getAllOffersService = async ({
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

export const getOfferByIdService = async (offerId, locale) => {
  const offer = await dbService.findFirst({
    model: "offer",
    where: { id: offerId },
    include: {
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

export const updateOfferService = async (offerId, body) => {
  const {
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
    },
  });

  return { offer: updatedOffer };
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
