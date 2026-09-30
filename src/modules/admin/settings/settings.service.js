import * as db from "../../../db/db.service.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";
export const updateAppInfoService = async (body, file, locale = "ar") => {
  const {
    appName,
    appVersion,
    aboutUs,
    facebookUrl,
    instaUrl,
    websiteUrl,
    copyright,
  } = body;
  const currentSetting = await db.findFirst({ model: "appSetting" });
  if (!currentSetting) {
    const error = new Error("APP_SETTINGS_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  const updatedSetting = await db.updateOne({
    model: "appSetting",
    where: { id: currentSetting.id },
    data: {
      ...(file && { logoUrl: file.relativeDestination }),
      ...(appVersion !== undefined && { appVersion }),
      ...(facebookUrl !== undefined && { facebookUrl }),
      ...(instaUrl !== undefined && { instaUrl }),
      ...(websiteUrl !== undefined && { websiteUrl }),
      translations: {
        upsert: {
          where: {
            settingId_locale: {
              settingId: currentSetting.id,
              locale,
            },
          },
          update: {
            ...(copyright !== undefined && { copyright }),
            ...(aboutUs !== undefined && { aboutUs }),
            ...(appName !== undefined && { appName }),
          },
          create: {
            locale,
            appName: body.appName || "LMS",
            aboutUs: body.aboutUs || "",
            copyright: body.copyright || "جميع الحقوق محفوظة",
          },
        },
      },
    },
    include: {
      translations: true,
    },
  });
  if (file && currentSetting.logoUrl) {
    deleteFile(currentSetting.logoUrl);
  }
  return updatedSetting;
};

export const updatePagesService = async (body, slug, locale = "ar") => {
  const { content, title } = body;
  const currentPage = await db.findFirst({
    model: "staticPage",
    where: { slug },
  });
  if (!currentPage) {
    const error = new Error("SLUG_ALREADY_EXISTS");
    error.cause = 409;
    throw error;
  }
  const updatedPage = await db.updateOne({
    model: "staticPage",
    where: { id: currentPage.id },
    data: {
      translations: {
        upsert: {
          where: {
            pageId_locale: {
              pageId: currentPage.id,
              locale,
            },
          },
          update: {
            ...(content !== undefined && { content }),
            ...(title !== undefined && { title }),
          },
          create: {
            locale,
            content,
            title,
          },
        },
      },
    },
    include: {
      translations: true,
    },
  });
  return updatedPage;
};

export const getAllPagesService = async ({
  page = 1,
  limit = 10,
  search = "",
  locale = "en",
}) => {
  const where = {
    ...(search
      ? {
          OR: [
            {
              translations: {
                some: {
                  title: { contains: search, mode: "insensitive" },
                },
              },
            },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const result = await db.findManyWithPaginationAndCount({
    model: "staticPage",
    where,
    page,
    limit,
    select: {
      id: true,
      slug: true,
      type: true,
      updatedAt: true,
      translations: {
        where: locale ? { locale } : undefined,
        select: {
          id: true,
          locale: true,
          content: true,
          title: true,
        },
      },
    },
  });
  return {
    pages: result.items,
    pagination: result.pagination,
  };
};
