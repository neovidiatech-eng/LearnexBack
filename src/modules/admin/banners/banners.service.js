import dbService, * as db from "../../../db/db.service.js";
import { actionTypeEnum } from "../../../utils/Enums/banner.enum.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";
import { throwError } from "../../../utils/response.js";

const reorderTransaction = async ({ order, bannerId, bannerData }) => {
  return db.transaction(async (tx) => {
    const existingOrderBanner = await tx.findFirst({
      model: "banner",
      where: { order },
    });
    console.log(existingOrderBanner);

    if (existingOrderBanner) {
      await tx.updateMany({
        model: "banner",
        where: {
          order: { gte: order },
          ...(bannerId && { id: { not: bannerId } }),
        },
        data: {
          order: { increment: 1 },
        },
      });
    }
    if (bannerId) {
      return tx.updateOne({
        model: "banner",
        where: { id: bannerId },
        data: { order },
        include: { translations: true },
      });
    }
    return tx.create({
      model: "banner",
      data: {
        ...bannerData,
        order,
        translations: {
          create: bannerData.translations,
        },
      },
      include: { translations: true },
    });
  });
};
export const getAllBannersService = async (query) => {
  const { page = 1, limit = 10, search = "", locale = "en", isActive } = query;
  const where = {
    ...(isActive !== undefined && {
      isActive: isActive === true || isActive === "true",
    }),
    ...(search && {
      OR: [
        {
          translations: {
            some: { title: { contains: search, mode: "insensitive" } },
          },
        },
        {
          translations: {
            some: { subtitle: { contains: search, mode: "insensitive" } },
          },
        },
        {
          translations: {
            some: { buttonText: { contains: search, mode: "insensitive" } },
          },
        },
        { actionType: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  const result = await db.findManyWithPaginationAndCount({
    model: "banner",
    where,
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    orderBy: { order: "asc" },
    include: {
      translations: locale ? { where: { locale } } : true,
    },
  });
  return {
    banners: result.items,
    pagination: result.pagination,
  };
};

export const getBannerByIdService = async (id, locale) => {
  const banner = await db.findFirst({
    model: "banner",
    where: { id },
    include: {
      translations: {
        where: locale ? { locale } : undefined,
      },
    },
  });
  if (!banner) {
    throwError({ message: "BANNER_NOT_FOUND", status: 404 });
  }
  return banner;
};
export const createBannerService = async (body, file) => {
  const { isActive, actionType, targetId, order, translations = [] } = body;
  let banner;
  if (actionType === actionTypeEnum.DISCOUNT_ON_COURSE) {
    const course = await db.findFirst({
      model: "course",
      where: { id: targetId },
    });
    if (!course) {
      throwError({ message: "COURSE_NOT_FOUND", status: 404 });
    }
  }
  const imageUrl = file ? file.relativeDestination : null;
  banner = await reorderTransaction({
    order: Number(order),
    bannerData: {
      isActive,
      actionType,
      targetId,
      imageUrl,
      translations,
    },
  });

  return banner;
};
export const updateBannerService = async (id, body, file) => {
  const { isActive, actionType, targetId, translations } = body;
  const newImage = file?.relativeDestination;
  const banner = await db.findFirst({ model: "banner", where: { id } });
  if (!banner) {
    deleteFile(newImage);
    throwError({ message: "BANNER_NOT_FOUND", status: 404 });
  }
  const updatedBanner = await db.updateOne({
    model: "banner",
    where: { id },
    data: {
      ...(newImage && { imageUrl: newImage }),
      ...(isActive !== undefined && { isActive }),
      ...(actionType !== undefined && { actionType }),
      ...(targetId !== undefined && { targetId: targetId || null }),
      ...(translations?.length > 0 && {
        translations: {
          upsert: translations.map((translation) => ({
            where: {
              bannerId_locale: { bannerId: id, locale: translation.locale },
            },
            create: {
              locale: translation.locale,
              title: translation.title,
              subtitle: translation.subtitle,
              buttonText: translation.buttonText,
            },
            update: {
              title: translation.title,
              subtitle: translation.subtitle,
              buttonText: translation.buttonText,
            },
          })),
        },
      }),
    },
    include: {
      translations: true,
    },
  });
  if (newImage && banner.imageUrl) {
    deleteFile(banner.imageUrl);
  }
  return { banner: updatedBanner };
};

export const updateBannerStatusService = async (id, isActive) => {
  const banner = await db.findFirst({ model: "banner", where: { id } });
  if (!banner) {
    throwError({ message: "BANNER_NOT_FOUND", status: 404 });
  }
  const updateStatus = await db.updateOne({
    model: "banner",
    where: { id },
    data: {
      isActive,
    },
    select: { id: true, isActive: true, updatedAt: true },
  });
  return { banner: updateStatus };
};
export const reOrderBannerService = async (bannerId, order) => {
  const existingBanner = await dbService.findFirst({
    model: "banner",
    where: { id: bannerId },
  });
  if (!existingBanner) {
    throwError({
      message: "BANNER_NOT_FOUND",
      status: 404,
    });
  }

  await reorderTransaction({
    order,
    bannerId: existingBanner ? existingBanner.id : bannerId,
  });
  return { success: true };
};
