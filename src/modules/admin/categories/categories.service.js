import * as DBService from "../../../db/db.service.js";
import { getFileUrl } from "../../../utils/multer/file.utils.js";

export const getAllCategoriesService = async (
  { page = 1, limit = 10, search = "", locale = "en" } = {},
  req = null
) => {
  const where = {
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
                  description: { contains: search, mode: "insensitive" },
                },
              },
            },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const select = {
    id: true,
    slug: true,
    image: true,
    coursesCount: true,
    studentsCount: true,
    createdAt: true,
    updatedAt: true,
    translations: {
      where: locale ? { locale } : undefined,
      select: {
        id: true,
        locale: true,
        name: true,
        description: true,
      },
    },
    _count: {
      select: {
        courses: true,
      },
    },
  };

  const result = await DBService.findManyWithPaginationAndCount({
    model: "category",
    where,
    page,
    limit,
    orderBy: { createdAt: "desc" },
    select,
  });

  const formattedCategories = result.items.map((cat) => ({
    ...cat,
    image: getFileUrl(cat.image, req),
  }));

  return {
    categories: formattedCategories,
    pagination: result.pagination,
  };
};

export const getCategoryByIdService = async (categoryId, locale, req = null) => {
  const category = await DBService.findFirst({
    model: "category",
    where: { id: categoryId },
    include: {
      translations: {
        where: locale ? { locale } : undefined,
      },
      courses: {
        select: {
          id: true,
          level: true,
          status: true,
          originalPrice: true,
          totalStudentsCount: true,
          translations: {
            where: locale ? { locale } : undefined,
          },
        },
      },
      _count: {
        select: {
          courses: true,
        },
      },
    },
  });

  if (!category) {
    const error = new Error("CATEGORY_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  category.image = getFileUrl(category.image, req);

  return { category };
};

export const createCategoryService = async (body, file, query = {}, req = null) => {
  const { name, description, locale = "en" } = body;
  const slug = (
    body.slug ||
    query.slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  ).trim();

  const existingCategory = await DBService.findFirst({
    model: "category",
    where: { slug },
  });

  if (existingCategory) {
    const error = new Error("SLUG_ALREADY_EXISTS");
    error.cause = 409;
    throw error;
  }
  const image = file ? file.relativeDestination : null;

  const category = await DBService.create({
    model: "category",
    data: {
      slug,
      image,
      translations: {
        create: [
          {
            locale,
            name,
            description,
          },
        ],
      },
    },
    include: {
      translations: true,
    },
  });

  category.image = getFileUrl(category.image, req);

  return { category };
};

export const editCategoryService = async (
  categoryId,
  { name, description, slug, locale = "en" },
  file,
  req = null
) => {
  const categoryExists = await DBService.findFirst({
    model: "category",
    where: { id: categoryId },
  });

  if (!categoryExists) {
    const error = new Error("CATEGORY_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (slug && slug !== categoryExists.slug) {
    const slugConflict = await DBService.findFirst({
      model: "category",
      where: { slug, NOT: { id: categoryId } },
    });
    if (slugConflict) {
      const error = new Error("SLUG_ALREADY_IN_USE");
      error.cause = 409;
      throw error;
    }
  }

  const updateData = {};
  if (slug !== undefined) updateData.slug = slug;
  if (file) updateData.image = file.relativeDestination;

  if (Object.keys(updateData).length > 0) {
    await DBService.updateOne({
      model: "category",
      where: { id: categoryId },
      data: updateData,
    });
  }

  if (name !== undefined || description !== undefined) {
    await DBService.upsert({
      model: "categoryTranslation",
      where: {
        categoryId_locale: {
          categoryId,
          locale,
        },
      },
      update: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
      },
      create: {
        categoryId,
        locale,
        name: name || "",
        description: description || "",
      },
    });
  }

  const updatedCategory = await DBService.findFirst({
    model: "category",
    where: { id: categoryId },
    include: {
      translations: true,
    },
  });

  updatedCategory.image = getFileUrl(updatedCategory.image, req);

  return { category: updatedCategory };
};

export const deleteCategoryService = async (categoryId) => {
  const categoryExists = await DBService.findFirst({
    model: "category",
    where: { id: categoryId },
  });

  if (!categoryExists) {
    const error = new Error("CATEGORY_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await DBService.deleteOne({
    model: "category",
    where: { id: categoryId },
  });

  return { success: true };
};
