import * as db from "../../../db/db.service.js";
import { courseStatusEnum } from "../../../utils/Enums/courseStatus.enum.js";
import { coursesType } from "../../../utils/Enums/teacherCourse.enum.js";

// ─── helpers ────────────────────────────────────────────────────────────────

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.cause = status;
  throw err;
};

// ─── service functions ───────────────────────────────────────────────────────

/**
 * GET /student/saved
 * Returns the user's saved items with rich course details.
 */
export const getSavedService = async (userId, locale = "ar") => {
  const savedItems = await db.findMany({
    model: "saved",
    where: { studentId: userId },
    orderBy: { createdAt: "desc" },
  });

  if (!savedItems || savedItems.length === 0) {
    return { totalItems: 0, items: [] };
  }

  // Enrich each item with course details
  const enrichedItems = await Promise.all(
    savedItems.map(async (item) => {
      const currentType = item.itemType || item.type;
      if (currentType === coursesType.COURSE) {
        const course = await db.findOne({
          model: "course",
          where: { id: item.itemId },
          include: {
            translations: { where: { locale } },
            instructor: {
              select: { fullName: true, profilePhoto: true },
            },
          },
        });
        return {
          ...item,
          type: currentType,
          course: course ?? null,
        };
      } else if (currentType === coursesType.TEACHER_COURSE) {
        const course = await db.findOne({
          model: "teacherCourse",
          where: { id: item.itemId },
          include: {
            teacher: {
              include: {
                user: { select: { fullName: true, profilePhoto: true } },
              },
            },
          },
        });
        return {
          ...item,
          type: currentType,
          course: course
            ? { ...course, instructor: course.teacher?.user ?? null }
            : null,
        };
      }
      return { ...item, type: currentType, course: null };
    })
  );

  return {
    totalItems: enrichedItems.length,
    items: enrichedItems,
  };
};

/**
 * POST /student/saved/add
 * Adds a course or teacher course to saved items.
 */
export const addToSavedService = async (userId, { itemType, itemId }, locale = "ar") => {
  const resolvedType = itemType;

  if (resolvedType === coursesType.COURSE) {
    const course = await db.findOne({
      model: "course",
      where: { id: itemId },
      select: { id: true, status: true },
    });

    if (!course) throwError("COURSE_NOT_FOUND", 404);
    if (course.status !== courseStatusEnum.PUBLISHED)
      throwError("COURSE_NOT_PUBLISHED", 400);
  } else if (resolvedType === coursesType.TEACHER_COURSE) {
    const course = await db.findOne({
      model: "teacherCourse",
      where: { id: itemId },
      select: { id: true, status: true },
    });

    if (!course) throwError("COURSE_NOT_FOUND", 404);
    if (course.status !== "APPROVED")
      throwError("COURSE_NOT_AVAILABLE", 400);
  } else {
    throwError("INVALID_ITEM_TYPE", 400);
  }

  // Check duplicate saved item
  const existing = await db.findFirst({
    model: "saved",
    where: { studentId: userId, itemId },
  });
  if (existing) throwError("ITEM_ALREADY_SAVED", 409);

  // Add saved item
  await db.create({
    model: "saved",
    data: {
      studentId: userId,
      itemId,
      itemType: resolvedType,
    },
  });

  return getSavedService(userId, locale);
};

/**
 * DELETE /student/saved/remove/:itemId
 * Removes an item from saved items by Saved id or itemId.
 */
export const removeFromSavedService = async (userId, itemId, locale = "ar") => {
  const item = await db.findFirst({
    model: "saved",
    where: {
      studentId: userId,
      OR: [{ id: itemId }, { itemId }],
    },
  });

  if (!item) throwError("ITEM_NOT_FOUND", 404);

  await db.deleteOne({
    model: "saved",
    where: { id: item.id },
  });

  return getSavedService(userId, locale);
};

/**
 * DELETE /student/saved/clear
 * Removes all saved items for the student.
 */
export const clearSavedService = async (userId) => {
  await db.deleteMany({
    model: "saved",
    where: { studentId: userId },
  });

  return { totalItems: 0, items: [] };
};
