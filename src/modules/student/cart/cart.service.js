import * as db from "../../../db/db.service.js";
import { courseStatusEnum } from "../../../utils/Enums/courseStatus.enum.js";
import { enrollmentTypeEnum } from "../../../utils/Enums/enrollmentType.enum.js";
import { requestPriorityEnum, requestReferenceModelEnum, requestTabEnum, requestTypeEnum } from "../../../utils/Enums/request.enum.js";
import { coursesType } from "../../../utils/Enums/teacherCourse.enum.js";
import { createSystemRequest } from "../../../utils/helpers/requests.helper.js";
import {
  getCommissionSettings,
  calculateCommissionSplit,
  creditSystemWallet,
  creditTeacherWallet,
} from "../../../utils/helpers/commission.helper.js";
import {
  paymentMethod as paymentMethodEnum,
  transactionStatus,
  transactionType,
} from "../../../utils/Enums/transactions.enum.js";

// ─── helpers ────────────────────────────────────────────────────────────────

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.cause = status;
  throw err;
};


/**
 * Get-or-create the cart for a user.
 * Returns the cart with its items included.
 */
const getOrCreateCart = async (userId) => {
  let cart = await db.findOne({
    model: "cart",
    where: { userId },
    include: { cartItems: true },
  });

  if (!cart) {
    cart = await db.create({
      model: "cart",
      data: { userId, totalItems: 0, totalPrice: 0 },
      include: { cartItems: true },
    });
  }

  return cart;
};

/**
 * Recalculate totalItems & totalPrice from the cart's items
 * and persist the updated totals.
 */
const syncCartTotals = async (cartId) => {
  const items = await db.findMany({
    model: "cartItem",
    where: { cartId },
  });

  let totalPrice = 0;
  for (const item of items) {
    if (item.type === coursesType.COURSE) {
      const course = await db.findOne({
        model: "course",
        where: { id: item.itemId },
        select: { originalPrice: true, salePrice: true },
      });
      if (course) {
        totalPrice += Number(course.salePrice ?? course.originalPrice ?? 0);
      }
    } else if (item.type === coursesType.TEACHER_COURSE) {
      const course = await db.findOne({
        model: "teacherCourse",
        where: { id: item.itemId },
        select: { price: true },
      });
      if (course) {
        totalPrice += Number(course.price ?? 0);
      }
    }
  }

  await db.updateOne({
    model: "cart",
    where: { id: cartId },
    data: {
      totalItems: items.length,
      totalPrice: Math.round(totalPrice),
    },
  });
};

// ─── service functions ───────────────────────────────────────────────────────

/**
 * GET /cart
 * Returns the user's cart with rich course details per item.
 */
export const getCartService = async (userId, locale = "ar") => {
  const cart = await db.findOne({
    model: "cart",
    where: { userId },
    include: {
      cartItems: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cart) {
    return { cart: null, items: [], totalItems: 0, totalPrice: 0 };
  }

  // Enrich each item with course details
  const enrichedItems = await Promise.all(
    cart.cartItems.map(async (item) => {
      if (item.type === coursesType.COURSE) {
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
        return { ...item, course: course ?? null };
      }
      else if (item.type === coursesType.TEACHER_COURSE) {
        const course = await db.findOne({
          model: "teacherCourse",
          where: { id: item.itemId },
          include: {
            teacher:{
              include:{
                user:{select:{fullName:true,profilePhoto:true}}
              }
            }
            
          },
        });
        return {
          ...item,
          course: course
            ? { ...course, instructor: course.teacher?.user ?? null }
            : null,
        }
      }
      return item;
    })
  );

  return {
    id: cart.id,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    items: enrichedItems,
  };
};

/**
 * POST /cart/add
 * Adds a course to the cart. Validates:
 *   - course exists and is PUBLISHED
 *   - course is PAID (free courses can be enrolled directly)
 *   - student is not already enrolled
 *   - item not already in cart
 */
export const addToCartService = async (userId, { type, itemId }) => {
  if (type === coursesType.COURSE) {
    const course = await db.findOne({
      model: "course",
      where: { id: itemId },
      select: {
        id: true,
        status: true,
        enrollmentType: true,
        originalPrice: true,
        salePrice: true,
      },
    });

    if (!course) throwError("COURSE_NOT_FOUND", 404);
    if (course.status !== courseStatusEnum.PUBLISHED)
      throwError("COURSE_NOT_PUBLISHED", 400);
    if (course.enrollmentType === enrollmentTypeEnum.FREE)
      throwError("FREE_COURSE_NO_CART", 400);

    // Check if already enrolled in this course
    const enrollment = await db.findFirst({
      model: "courseEnrollment",
      where: { studentId: userId, courseId: itemId },
    });
    if (enrollment) throwError("ALREADY_ENROLLED", 409);
  } else if (type === coursesType.TEACHER_COURSE) {
    // TeacherCourse uses: status APPROVED, price field, no enrollmentType
    const course = await db.findOne({
      model: "teacherCourse",
      where: { id: itemId },
      select: { id: true, status: true, price: true },
    });

    if (!course) throwError("COURSE_NOT_FOUND", 404);
    if (course.status !== "APPROVED")
      throwError("COURSE_NOT_AVAILABLE", 400);

    const existingEnrollment = await db.findFirst({
      model: "teacherCourseEnrollment",
      where: { studentId: userId, courseId: itemId },
    })
    if (existingEnrollment) throwError("ALREADY_ENROLLED", 409);

  } else {
    throwError("INVALID_ITEM_TYPE", 400);
  }

  const cart = await getOrCreateCart(userId);

  // Check duplicate item in cart
  const exists = cart.cartItems.some((i) => i.itemId === itemId);
  if (exists) throwError("ITEM_ALREADY_IN_CART", 409);

  // Add item
  await db.create({
    model: "cartItem",
    data: { cartId: cart.id, type, itemId },
  });

  // Sync totals
  await syncCartTotals(cart.id);

  return getCartService(userId);
};

/**
 * DELETE /cart/remove/:itemId
 * Removes a specific item (by CartItem.id) from the cart.
 */
export const removeFromCartService = async (userId, cartItemId) => {
  const cart = await db.findOne({
    model: "cart",
    where: { userId },
  });

  if (!cart) throwError("CART_NOT_FOUND", 404);

  const item = await db.findFirst({
    model: "cartItem",
    where: { id: cartItemId, cartId: cart.id },
  });

  if (!item) throwError("ITEM_NOT_FOUND", 404);

  await db.deleteOne({
    model: "cartItem",
    where: { id: cartItemId },
  });

  await syncCartTotals(cart.id);

  return getCartService(userId);
};

/**
 * DELETE /cart/clear
 * Removes all items from the user's cart.
 */
export const clearCartService = async (userId) => {
  const cart = await db.findOne({
    model: "cart",
    where: { userId },
  });

  if (!cart) throwError("CART_NOT_FOUND", 404);

  await db.deleteMany({
    model: "cartItem",
    where: { cartId: cart.id },
  });

  await db.updateOne({
    model: "cart",
    where: { id: cart.id },
    data: { totalItems: 0, totalPrice: 0 },
  });

  return { id: cart.id, totalItems: 0, totalPrice: 0, items: [] };
};

/**
 * POST /cart/checkout
 * Converts all cart items to CourseEnrollments, processes payments,
 * applies platform commission according to AppSettings, credits wallets,
 * records the transaction, and clears the cart.
 */
export const checkoutCartService = async (userId, body = {}, locale = "ar") => {
  const cart = await db.findOne({
    model: "cart",
    where: { userId },
    include: { cartItems: true },
  });

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    throwError("CART_IS_EMPTY", 400);
  }

  const commissionSettings = await getCommissionSettings();

  return await db.transaction(async (tx) => {
    const enrolled = [];
    const processedItems = [];
    let totalPaid = 0;
    let totalPlatformCommission = 0;
    let totalTeacherEarnings = 0;

    for (const item of cart.cartItems) {
      if (item.type === coursesType.COURSE) {
        const course = await tx.findOne({
          model: "course",
          where: { id: item.itemId },
          select: {
            id: true,
            status: true,
            provider: true,
            originalPrice: true,
            salePrice: true,
            totalStudentsCount: true,
            totalRevenue: true,
            instructorId: true,
            translations: {
              where: { locale },
              select: { title: true },
            },
          },
        });

        if (!course || course.status !== courseStatusEnum.PUBLISHED) {
          continue;
        }

        const existingEnrollment = await tx.findFirst({
          model: "courseEnrollment",
          where: { studentId: userId, courseId: course.id },
        });

        if (existingEnrollment) {
          continue;
        }

        const paidAmount = Number(course.salePrice ?? course.originalPrice ?? 0);
        const hasTeacher = Boolean(course.instructorId);
        const teacherUserId = course.instructorId;

        const split = calculateCommissionSplit({
          price: paidAmount,
          settings: commissionSettings,
          hasTeacher,
        });

        if (split.price > 0) {
          await creditSystemWallet({
            tx,
            amount: split.platformCommission,
          });

          if (hasTeacher && split.teacherEarnings > 0) {
            await creditTeacherWallet({
              tx,
              userId: teacherUserId,
              amount: split.teacherEarnings,
            });
          }
        }

        const enrollment = await tx.create({
          model: "courseEnrollment",
          data: {
            studentId: userId,
            courseId: course.id,
            status: "ACTIVE",
            paidAmount: split.price,
            progressPercent: 0,
          },
        });

        await tx.updateOne({
          model: "course",
          where: { id: course.id },
          data: {
            totalStudentsCount: { increment: 1 },
            totalRevenue: { increment: split.price },
          },
        });

        enrolled.push(enrollment);
        totalPaid += split.price;
        totalPlatformCommission += split.platformCommission;
        totalTeacherEarnings += split.teacherEarnings;

        processedItems.push({
          courseId: course.id,
          courseTitle: course.translations?.[0]?.title || "Course",
          itemType: coursesType.COURSE,
          provider: course.provider || "PLATFORM",
          price: split.price,
          platformCommission: split.platformCommission,
          teacherEarnings: split.teacherEarnings,
          instructorId: course.instructorId,
        });

        await createSystemRequest({
          tab: requestTabEnum.STUDENT,
          type: requestTypeEnum.COURSE_ENROLLMENT,
          priority: requestPriorityEnum.HIGH,
          requesterId: userId,
          requesterRole: requestTabEnum.STUDENT,
          referenceId: enrollment.id,
          referenceModel: requestReferenceModelEnum.COURSE_ENROLLMENT,
          details: {
            courseId: course.id,
            amount: enrollment.paidAmount,
            status: enrollment.status,
            provider: course.provider || "PLATFORM",
            platformCommission: split.platformCommission,
            teacherEarnings: split.teacherEarnings,
          },
        });
      } else if (item.type === coursesType.TEACHER_COURSE) {
        const course = await tx.findOne({
          model: "teacherCourse",
          where: { id: item.itemId },
          select: {
            id: true,
            name: true,
            status: true,
            provider: true,
            price: true,
            totalStudentsCount: true,
            totalRevenue: true,
            teacherId: true,
            teacher: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        });

        if (!course || course.status !== "APPROVED") {
          continue;
        }

        const existingEnrollment = await tx.findFirst({
          model: "teacherCourseEnrollment",
          where: { studentId: userId, courseId: course.id },
        });

        if (existingEnrollment) {
          continue;
        }

        const paidAmount = Number(course.price || 0);
        const teacherUserId = course.teacher?.userId;
        const hasTeacher = Boolean(teacherUserId);

        const split = calculateCommissionSplit({
          price: paidAmount,
          settings: commissionSettings,
          hasTeacher,
        });

        if (split.price > 0) {
          await creditSystemWallet({
            tx,
            amount: split.platformCommission,
          });

          if (hasTeacher && split.teacherEarnings > 0) {
            await creditTeacherWallet({
              tx,
              userId: teacherUserId,
              amount: split.teacherEarnings,
            });
          }
        }

        const enrollment = await tx.create({
          model: "teacherCourseEnrollment",
          data: {
            studentId: userId,
            courseId: course.id,
            status: "ACTIVE",
            paidAmount: split.price,
            progressPercent: 0,
          },
        });

        await tx.updateOne({
          model: "teacherCourse",
          where: { id: course.id },
          data: {
            totalStudentsCount: { increment: 1 },
            totalRevenue: { increment: split.price },
          },
        });

        enrolled.push({
          ...enrollment,
          type: coursesType.TEACHER_COURSE,
        });
        totalPaid += split.price;
        totalPlatformCommission += split.platformCommission;
        totalTeacherEarnings += split.teacherEarnings;

        processedItems.push({
          courseId: course.id,
          courseTitle: course.name || "Teacher Course",
          itemType: coursesType.TEACHER_COURSE,
          provider: course.provider || "TEACHER",
          price: split.price,
          platformCommission: split.platformCommission,
          teacherEarnings: split.teacherEarnings,
          teacherId: course.teacherId,
          teacherUserId,
        });

        await createSystemRequest({
          tab: requestTabEnum.STUDENT,
          type: requestTypeEnum.COURSE_ENROLLMENT,
          priority: requestPriorityEnum.HIGH,
          requesterId: userId,
          requesterRole: requestTabEnum.STUDENT,
          referenceId: enrollment.id,
          referenceModel: requestReferenceModelEnum.TEACHER_COURSE,
          details: {
            courseId: course.id,
            amount: enrollment.paidAmount,
            status: enrollment.status,
            itemType: coursesType.TEACHER_COURSE,
            provider: course.provider || "TEACHER",
            platformCommission: split.platformCommission,
            teacherEarnings: split.teacherEarnings,
          },
        });
      }
    }

    if (enrolled.length === 0) {
      throwError("NO_NEW_COURSES_TO_ENROLL", 400);
    }

    // Record Transaction
    const transaction = await tx.create({
      model: "transaction",
      data: {
        userId,
        amount: totalPaid,
        type: transactionType.PAYMENT,
        status: transactionStatus.COMPLETED,
        paymentMethod: body.paymentMethod || paymentMethodEnum.CARD,
        reason: {
          action: "CART_CHECKOUT",
          cartId: cart.id,
          coursesCount: enrolled.length,
          totalAmount: totalPaid,
          totalCommission: totalPlatformCommission,
          totalTeacherEarnings,
          commissionType: commissionSettings.commissionType,
          commissionValue: commissionSettings.commissionValue,
          items: processedItems,
          confirmedAt: new Date().toISOString(),
        },
      },
    });

    // Clear cart items
    await tx.deleteMany({
      model: "cartItem",
      where: { cartId: cart.id },
    });

    // Reset cart totals
    await tx.updateOne({
      model: "cart",
      where: { id: cart.id },
      data: { totalItems: 0, totalPrice: 0 },
    });

    return {
      totalEnrolled: enrolled.length,
      enrolled,
      transaction: {
        id: transaction.id,
        amount: Number(transaction.amount),
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
      },
      summary: {
        totalAmount: totalPaid,
        totalCommission: totalPlatformCommission,
        totalTeacherEarnings,
        commissionType: commissionSettings.commissionType,
        commissionValue: commissionSettings.commissionValue,
      },
    };
  });
};
