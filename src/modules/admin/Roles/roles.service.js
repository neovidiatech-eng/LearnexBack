import slugify from "slugify";
import * as DBService from "../../../db/db.service.js";

/**
 * Creates a new role with translations and optional assigned permissions.
 */
export const createRoleService = async (body) => {
  let { color, translations, name, lang = "en", slug, permissionIds, permissions } = body;

  if (!translations || !translations.length) {
    if (!name) {
      const error = new Error("ROLE_NAME_OR_TRANSLATIONS_REQUIRED");
      error.cause = 400;
      throw error;
    }
    translations = [{ lang, name, slug }];
  }

  const formattedTranslations = translations.map((item) => {
    const itemLang = item.lang || item.locale || "en";
    const rawName = item.name || name;
    const itemSlug = item.slug || slugify(rawName, { lower: true });

    return {
      lang: itemLang,
      name: rawName,
      slug: itemSlug,
    };
  });


  const existingTranslations = await DBService.findMany({
    model: "roleTranslation",
    where: {
      OR: formattedTranslations.map((t) => ({
        lang: t.lang,
        slug: t.slug,
      })),
    },
  });

  if (existingTranslations && existingTranslations.length > 0) {
    const error = new Error("ROLE_SLUG_ALREADY_EXISTS");
    error.cause = 409;
    throw error;
  }

  const targetPermissions = permissionIds || permissions || [];
  let validPermissionIds = [];

  if (targetPermissions.length > 0) {
    const existingPermissions = await DBService.findMany({
      model: "permission",
      where: {
        OR: [
          { id: { in: targetPermissions } },
          { code: { in: targetPermissions } },
        ],
      },
    });

    if (existingPermissions.length !== targetPermissions.length) {
      const foundSet = new Set(
        existingPermissions.flatMap((p) => [p.id, p.code])
      );
      const invalidPermissions = targetPermissions.filter((p) => !foundSet.has(p));
      const error = new Error(
        `SOME_PERMISSIONS_NOT_FOUND`
      );
      error.meta = { invalidPermissions };
      error.cause = 404;
      throw error;
    }

    validPermissionIds = existingPermissions.map((p) => p.id);
  }

  const role = await DBService.create({
    model: "role",
    data: {
      color: color || null,
      roleTranslations: {
        create: formattedTranslations,
      },
      ...(validPermissionIds.length > 0
        ? {
            rolePermissions: {
              create: validPermissionIds.map((permissionId) => ({
                permissionId,
              })),
            },
          }
        : {}),
    },
    include: {
      roleTranslations: true,
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return { role };
};

export const getAllRolesService = async ({
  page = 1,
  limit = 10,
  search = "",
  lang,
  locale,
} = {}) => {
  const targetLang = lang || locale;
  const where = search
    ? {
        roleTranslations: {
          some: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      }
    : {};

  const select = {
    id: true,
    color: true,
    createdAt: true,
    updatedAt: true,
    roleTranslations: {
      where: targetLang ? { lang: targetLang } : undefined,
      select: {
        lang: true,
        name: true,
        slug: true,
      },
    },
    rolePermissions: {
      select: {
        permission: {
          select: {
            id: true,
            code: true,
            name: true,
            resource: true,
            action: true,
          },
        },
      },
    },
  };

  const result = await DBService.findManyWithPaginationAndCount({
    model: "role",
    where,
    page,
    limit,
    orderBy: { createdAt: "desc" },
    select,
  });

  return {
    roles: result.items,
    pagination: result.pagination,
  };
};

export const getRoleByIdService = async (roleId, { lang, locale } = {}) => {
  const targetLang = lang || locale;

  const role = await DBService.findFirst({
    model: "role",
    where: { id: roleId },
    include: {
      roleTranslations: {
        where: targetLang ? { lang: targetLang } : undefined,
      },
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!role) {
    const error = new Error("ROLE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return { role };
};

export const updateRoleService = async (roleId, body) => {
  const { color, translations, name, lang = "en", slug, permissionIds, permissions } = body;

  const existingRole = await DBService.findFirst({
    model: "role",
    where: { id: roleId },
    include: { roleTranslations: true },
  });

  if (!existingRole) {
    const error = new Error("ROLE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return await DBService.transaction(async (tx) => {
    if (color !== undefined) {
      await tx.updateOne({
        model: "role",
        where: { id: roleId },
        data: { color },
      });
    }

    const newTranslations = translations || (name ? [{ lang, name, slug }] : null);
    if (newTranslations && newTranslations.length > 0) {
      for (const item of newTranslations) {
        const itemLang = item.lang || item.locale || "en";
        const rawName = item.name || name;
        const itemSlug = (
          item.slug ||
          rawName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
        ).trim();

        const conflict = await tx.findFirst({
          model: "roleTranslation",
          where: {
            lang: itemLang,
            slug: itemSlug,
            NOT: { roleId },
          },
        });

        if (conflict) {
          const error = new Error("ROLE_SLUG_ALREADY_EXISTS");
          error.cause = 409;
          throw error;
        }

        await tx.upsertOne({
          model: "roleTranslation",
          where: {
            roleId_lang: {
              roleId,
              lang: itemLang,
            },
          },
          update: {
            name: rawName,
            slug: itemSlug,
          },
          create: {
            roleId,
            lang: itemLang,
            name: rawName,
            slug: itemSlug,
          },
        });
      }
    }

    const targetPermissions = permissionIds || permissions;
    if (targetPermissions !== undefined) {
      let validPermissionIds = [];
      if (targetPermissions.length > 0) {
        const existingPermissions = await tx.findMany({
          model: "permission",
          where: {
            OR: [
              { id: { in: targetPermissions } },
              { code: { in: targetPermissions } },
            ],
          },
        });

        if (existingPermissions.length !== targetPermissions.length) {
          const foundSet = new Set(
            existingPermissions.flatMap((p) => [p.id, p.code])
          );
          const invalidPermissions = targetPermissions.filter(
            (p) => !foundSet.has(p)
          );
          const error = new Error(
            `SOME_PERMISSIONS_NOT_FOUND`
          );
          error.cause = 404;
          error.meta = { invalidPermissions };
          throw error;
        }

        validPermissionIds = existingPermissions.map((p) => p.id);
      }

      await tx.deleteMany({
        model: "rolePermission",
        where: { roleId },
      });

      if (validPermissionIds.length > 0) {
        await tx.createMany({
          model: "rolePermission",
          data: validPermissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }
    }

    const updatedRole = await tx.findFirst({
      model: "role",
      where: { id: roleId },
      include: {
        roleTranslations: true,
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return { role: updatedRole };
  });
};

export const deleteRoleService = async (roleId) => {
  const role = await DBService.findFirst({
    model: "role",
    where: { id: roleId },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  if (!role) {
    const error = new Error("ROLE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (role._count?.users > 0) {
    const error = new Error("CANNOT_DELETE_ROLE_ASSIGNED_TO_USERS");
    error.cause = 400;
    throw error;
  }

  await DBService.transaction(async (tx) => {
    await tx.deleteMany({
      model: "roleTranslation",
      where: { roleId },
    });
    await tx.deleteMany({
      model: "rolePermission",
      where: { roleId },
    });
    await tx.deleteOne({
      model: "role",
      where: { id: roleId },
    });
  });
};
