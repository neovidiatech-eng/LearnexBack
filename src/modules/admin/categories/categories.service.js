import * as DBService from "../../../db/db.service.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";

export const getAllCategoriesService = async ({
  page = 1,
  limit = 10,
  search = "",
  locale = "en",
} = {}) => {
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

  return {
    categories: result.items,
    pagination: result.pagination,
  };
};

export const getCategoryByIdService = async (categoryId, locale) => {
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

  return { category };
};

export const createCategoryService = async (body, file, query = {}) => {
  const { name, description, locale = "en" } = body;
  const slug = (
    body.slug ||
    query.slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  ).trim();

  if (
    await DBService.findFirst({
      model: "category",
      where: { slug },
    })
  ) {
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

  return { category };
};

export const editCategoryService = async (
  categoryId,
  { name, description, locale = "en" },
  file
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

  const updatedCategory = await DBService.updateOne({
    model: "category",
    where: { id: categoryId },
    data: {
      ...(file && {
        image: file.relativeDestination,
      }),

      translations: {
        update: {
          where: {
            categoryId_locale: {
              categoryId,
              locale,
            },
          },
          data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
          },
        },
      },
    },
    include: {
      translations: true,
    },
  });

  if (file && categoryExists.image) {
    deleteFile(categoryExists.image);
  }

  return {
    category: updatedCategory,
  };
};
;


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

  if (categoryExists.image) {
    deleteFile(categoryExists.image);
  }

  await DBService.deleteOne({
    model: "category",
    where: { id: categoryId },
  });

  return { success: true };
};
