import * as dbService from "../../db/db.service.js";

export const changeLanguageService = async (userId, userRole, language) => {
  const isAdmin = ["admin", "super_admin"].includes(
    String(userRole).toLowerCase(),
  );
  const model = isAdmin ? "admin" : "user";

  const updatedAccount = await dbService.updateOne({
    model,
    where: { id: userId },
    data: {
      preferredLanguage: language.toLowerCase().trim(),
    },
    select: {
      id: true,
      email: true,
      preferredLanguage: true,
      updatedAt: true,
    },
  });

  return updatedAccount;
};

export const getAppInfoService = async () => {
  const currentSetting = await dbService.findFirst({
    model: "appSetting",
    include: {
      translations: true,
    },
  });
  if (!currentSetting) {
    const error = new Error("APP_SETTINGS_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  return currentSetting;
};
export const getPageBySlugService = async (slug) => {
  const currentPage = await dbService.findFirst({
    model: "staticPage",
    where:{slug},
    include: {
      translations: true,
    },
  });
  if (!currentPage) {
    const error = new Error("PAGE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  return currentPage;
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
