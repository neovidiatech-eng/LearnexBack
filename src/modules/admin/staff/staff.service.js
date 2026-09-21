import * as DBService from "../../../db/db.service.js";
import { authProviderEnum } from "../../../utils/Enums/authProvider.enum.js";
import { userStatusEnum } from "../../../utils/Enums/userStatus.enum.js";
import { generateHash } from "../../../utils/security/hash.security.js";
import { generateEncryption } from "../../../utils/security/encryption.security.js";
import {
  buildStaffScopeFilter,
  isExcludedStaffRole,
  EXCLUDED_STAFF_ROLE_SLUGS,
} from "./staff.constants.js";
import ExcelJS from "exceljs";

// ─── Shared Prisma select for Staff user responses ───────────────────────────
const staffUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  country: true,
  status: true,
  profilePhoto: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      id: true,
      roleTranslations: {
        select: {
          name: true,
          slug: true,
          lang: true,
        },
      },
    },
  },
};

// ─── Helper: verify a user belongs to Staff scope ────────────────────────────
const verifyStaffScope = (user) => {
  if (!user) return false;
  const roleSlugs =
    user.role?.roleTranslations?.map((t) => t.slug.toLowerCase()) || [];
  return !roleSlugs.some((slug) => EXCLUDED_STAFF_ROLE_SLUGS.includes(slug));
};

// ─── Helper: resolve a role ID from slug, rejecting excluded roles ───────────
const resolveStaffRoleId = async (roleId) => {
  if (!roleId) return null;

  const role = await DBService.findFirst({
    model: "role",
    where: { id: roleId },
    include: { roleTranslations: true },
  });

  if (!role) {
    const error = new Error("ROLE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const slugs = role.roleTranslations.map((t) => t.slug.toLowerCase());
  if (slugs.some((s) => EXCLUDED_STAFF_ROLE_SLUGS.includes(s))) {
    const error = new Error("INVALID_STAFF_ROLE");
    error.cause = 400;
    throw error;
  }

  return role.id;
};

// ═════════════════════════════════════════════════════════════════════════════
// GET ALL STAFF (paginated, searchable, filterable)
// ═════════════════════════════════════════════════════════════════════════════
export const getAllStaffService = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  roleId,
} = {}) => {
  const staffScope = buildStaffScopeFilter();

  // If a specific role filter is provided, validate it's not excluded
  if (roleId) {
    await resolveStaffRoleId(roleId); // throws if student/teacher
  }

  const where = {
    ...staffScope,
    ...(status ? { status } : {}),
    ...(roleId ? { roleId } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const result = await DBService.findManyWithPaginationAndCount({
    model: "user",
    where,
    page,
    limit,
    orderBy: { createdAt: "desc" },
    select: staffUserSelect,
  });

  return {
    staff: result.items,
    pagination: result.pagination,
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// GET STAFF BY ID
// ═════════════════════════════════════════════════════════════════════════════
export const getStaffByIdService = async (staffId) => {
  const user = await DBService.findFirst({
    model: "user",
    where: { id: staffId },
    select: staffUserSelect,
  });

  if (!user || !verifyStaffScope(user)) {
    const error = new Error("STAFF_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return user;
};

// ═════════════════════════════════════════════════════════════════════════════
// CREATE STAFF
// ═════════════════════════════════════════════════════════════════════════════
export const createStaffService = async (body) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    country,
    status,
    roleId,
  } = body;

  // 1. Validate role is not student/teacher
  const validRoleId = await resolveStaffRoleId(roleId);

  // 2. Check email uniqueness
  const emailExist = await DBService.findFirst({
    model: "user",
    where: { email: email.toLowerCase() },
  });
  if (emailExist) {
    const error = new Error("EMAIL_ALREADY_EXISTS");
    error.cause = 409;
    throw error;
  }

  // 3. Hash password & encrypt phone
  const hashPassword = await generateHash({ plainText: password });
  const encPhone = phone
    ? await generateEncryption({ plainText: phone })
    : null;

  // 4. Create user
  const user = await DBService.create({
    model: "user",
    data: {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashPassword,
      phone: encPhone,
      country: country || null,
      roleId: validRoleId,
      status: status || userStatusEnum.ACTIVE,
      provider: authProviderEnum.SYSTEM,
      confirmEmail: new Date(), // Staff created by admin → auto-confirmed
    },
    select: staffUserSelect,
  });

  return user;
};

// ═════════════════════════════════════════════════════════════════════════════
// UPDATE STAFF
// ═════════════════════════════════════════════════════════════════════════════
export const updateStaffService = async (staffId, body) => {
  const { firstName, lastName, email, password, phone, country, status, roleId } =
    body;

  // 1. Verify target user is Staff scope
  const existingUser = await DBService.findFirst({
    model: "user",
    where: { id: staffId },
    select: staffUserSelect,
  });

  if (!existingUser || !verifyStaffScope(existingUser)) {
    const error = new Error("STAFF_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  // 2. Validate new role if provided
  if (roleId) {
    await resolveStaffRoleId(roleId);
  }

  // 3. Check email uniqueness if changing
  if (email && email.toLowerCase() !== existingUser.email) {
    const emailExist = await DBService.findFirst({
      model: "user",
      where: {
        email: email.toLowerCase(),
        id: { not: staffId },
      },
    });
    if (emailExist) {
      const error = new Error("EMAIL_ALREADY_EXISTS");
      error.cause = 409;
      throw error;
    }
  }

  // 4. Build update data
  const hashPassword = password
    ? await generateHash({ plainText: password })
    : undefined;
  const encPhone = phone
    ? await generateEncryption({ plainText: phone })
    : undefined;

  const updateData = {
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(email && { email: email.toLowerCase() }),
    ...(hashPassword && { password: hashPassword }),
    ...(encPhone !== undefined && phone !== undefined && { phone: encPhone }),
    ...(country !== undefined && { country }),
    ...(status && { status }),
    ...(roleId && { roleId }),
  };

  const updated = await DBService.updateOne({
    model: "user",
    where: { id: staffId },
    data: updateData,
    select: staffUserSelect,
  });

  return updated;
};

// ═════════════════════════════════════════════════════════════════════════════
// CHANGE STAFF STATUS
// ═════════════════════════════════════════════════════════════════════════════
export const changeStaffStatusService = async (staffId, status) => {
  // Verify the user is Staff scope
  const existingUser = await DBService.findFirst({
    model: "user",
    where: { id: staffId },
    select: staffUserSelect,
  });

  if (!existingUser || !verifyStaffScope(existingUser)) {
    const error = new Error("STAFF_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const updated = await DBService.updateOne({
    model: "user",
    where: { id: staffId },
    data: { status },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      updatedAt: true,
    },
  });

  return updated;
};

// ═════════════════════════════════════════════════════════════════════════════
// DELETE STAFF
// ═════════════════════════════════════════════════════════════════════════════
export const deleteStaffService = async (staffId) => {
  // Verify the user is Staff scope
  const existingUser = await DBService.findFirst({
    model: "user",
    where: { id: staffId },
    select: staffUserSelect,
  });

  if (!existingUser || !verifyStaffScope(existingUser)) {
    const error = new Error("STAFF_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await DBService.deleteOne({
    model: "user",
    where: { id: staffId },
  });

  return { success: true };
};

// ═════════════════════════════════════════════════════════════════════════════
// GET STAFF ROLES (for dropdown — excludes student/teacher)
// ═════════════════════════════════════════════════════════════════════════════
export const getStaffRolesService = async () => {
  const roles = await DBService.findMany({
    model: "role",
    where: {
      roleTranslations: {
        none: {
          slug: { in: EXCLUDED_STAFF_ROLE_SLUGS },
        },
      },
    },
    select: {
      id: true,
      roleTranslations: {
        select: {
          name: true,
          slug: true,
          lang: true,
        },
      },
    },
  });

  return roles;
};

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT STAFF TO EXCEL
// ═════════════════════════════════════════════════════════════════════════════
export const exportStaffToExcelService = async ({
  search = "",
  status,
  roleId,
} = {}) => {
  const staffScope = buildStaffScopeFilter();

  const where = {
    ...staffScope,
    ...(status ? { status } : {}),
    ...(roleId ? { roleId } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const staffUsers = await DBService.findMany({
    model: "user",
    where,
    orderBy: { createdAt: "desc" },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
      role: {
        select: {
          roleTranslations: {
            where: { lang: "en" },
            select: { name: true },
          },
        },
      },
    },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LearnX LMS";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Staff");

  worksheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Role", key: "role", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Joined Date", key: "joined", width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "2F4F4F" },
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  staffUsers.forEach((user) => {
    const roleName =
      user.role?.roleTranslations?.[0]?.name || "N/A";

    worksheet.addRow({
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: roleName,
      status: user.status,
      joined: new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    });
  });

  return workbook;
};
