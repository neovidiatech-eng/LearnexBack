import db, { paginationWithCursor } from "../../../db/db.service.js";
import { actionTypeEnum } from "../../../utils/Enums/banner.enum.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";
import { throwError } from "../../../utils/response.js";
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
    orderBy: { createdAt: "desc" },
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


  const existingOrderBanner=await db.findFirst({
    model:"banner",
    where:{order}
  })
  if(existingOrderBanner){
    
    
  }

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
  const banner = await db.create({
    model: "banner",
    data: {
      isActive,
      actionType,
      targetId,
      imageUrl,
      translations: {
        create: translations.map((translation) => ({
          locale: translation.locale,
          title: translation.title,
          subtitle: translation.subtitle,
          buttonText: translation.buttonText,
        })),
      },
    },
    include: {
      translations: true,
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
export const deleteBannerService = async (id) => {
  const banner = await db.findFirst({ model: "banner", where: { id } });
  if (!banner) {
    throwError({ message: "BANNER_NOT_FOUND", status: 404 });
  }
  if (banner.imageUrl) {
    deleteFile(banner.imageUrl);
  }
  await db.deleteOne({ model: "banner", where: { id } });
  return { success: true };
};
