import * as db from "../../../db/db.service.js";
import { courseStatusEnum } from "../../../utils/Enums/courseStatus.enum.js";
import { enrollmentTypeEnum } from "../../../utils/Enums/enrollmentType.enum.js";
import {
  notificationTypeEnum,
  priorityEnum,
  reciverNotificationEnum,
} from "../../../utils/Enums/notifications.js";
import {
  requestPriorityEnum,
  requestReferenceModelEnum,
  requestTabEnum,
  requestTypeEnum,
} from "../../../utils/Enums/request.enum.js";
import { coursesType } from "../../../utils/Enums/teacherCourse.enum.js";
import { notify } from "../../../utils/helpers/notify.helper.js";
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

const syncCartTotals = async (cartId) => {
  const items = await db.findMany({
    model: "cartItem",
    where: { cartId },
  });

  const courseIds = [];
  const teacherCourseIds = [];

  for (const item of items) {
    if (item.type === coursesType.COURSE) {
      courseIds.push(item.itemId);
    } else if (item.type === coursesType.TEACHER_COURSE) {
      teacherCourseIds.push(item.itemId);
    }
  }

  const [platformCourses, teacherCourses] = await Promise.all([
    courseIds.length > 0
      ? db.findMany({
          model: "course",
          where: { id: { in: courseIds } },
          select: { id: true, originalPrice: true, salePrice: true },
        })
      : [],
    teacherCourseIds.length > 0
      ? db.findMany({
          model: "teacherCourse",
          where: { id: { in: teacherCourseIds } },
          select: { id: true, price: true },
        })
      : [],
  ]);

  const platformMap = new Map(platformCourses.map((c) => [c.id, c]));
  const teacherMap = new Map(teacherCourses.map((c) => [c.id, c]));

  let totalPrice = 0;
  for (const item of items) {
    if (item.type === coursesType.COURSE) {
      const course = platformMap.get(item.itemId);
      if (course) {
        const rawPrice = course.salePrice ?? course.originalPrice ?? 0;
        totalPrice += Math.max(0, Number(rawPrice) || 0);
      }
    } else if (item.type === coursesType.TEACHER_COURSE) {
      const course = teacherMap.get(item.itemId);
      if (course) {
        totalPrice += Math.max(0, Number(course.price) || 0);
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

  const courseIds = [];
  const teacherCourseIds = [];

  for (const item of cart.cartItems) {
    if (item.type === coursesType.COURSE) {
      courseIds.push(item.itemId);
    } else if (item.type === coursesType.TEACHER_COURSE) {
      teacherCourseIds.push(item.itemId);
    }
  }

  const [platformCourses, teacherCourses] = await Promise.all([
    courseIds.length > 0
      ? db.findMany({
          model: "course",
          where: { id: { in: courseIds } },
          include: {
            translations: { where: { locale } },
            instructor: {
              select: { fullName: true, profilePhoto: true },
            },
          },
        })
      : [],
    teacherCourseIds.length > 0
      ? db.findMany({
          model: "teacherCourse",
          where: { id: { in: teacherCourseIds } },
          include: {
            teacher: {
              include: {
                user: { select: { fullName: true, profilePhoto: true } },
              },
            },
          },
        })
      : [],
  ]);

  const platformCourseMap = new Map(platformCourses.map((c) => [c.id, c]));
  const teacherCourseMap = new Map(
    teacherCourses.map((c) => [
      c.id,
      { ...c, instructor: c.teacher?.user ?? null },
    ]),
  );

  const enrichedItems = cart.cartItems.map((item) => {
    let course = null;
    if (item.type === coursesType.COURSE) {
      course = platformCourseMap.get(item.itemId) ?? null;
    } else if (item.type === coursesType.TEACHER_COURSE) {
      course = teacherCourseMap.get(item.itemId) ?? null;
    }
    return { ...item, course };
  });

  return {
    id: cart.id,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    items: enrichedItems,
  };
};

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

    const enrollment = await db.findFirst({
      model: "courseEnrollment",
      where: { studentId: userId, courseId: itemId },
    });
    if (enrollment) throwError("ALREADY_ENROLLED", 409);
  } else if (type === coursesType.TEACHER_COURSE) {
    const course = await db.findOne({
      model: "teacherCourse",
      where: { id: itemId },
      select: { id: true, status: true, price: true },
    });

    if (!course) throwError("COURSE_NOT_FOUND", 404);
    if (course.status !== "APPROVED") throwError("COURSE_NOT_AVAILABLE", 400);

    const existingEnrollment = await db.findFirst({
      model: "teacherCourseEnrollment",
      where: { studentId: userId, courseId: itemId },
    });
    if (existingEnrollment) throwError("ALREADY_ENROLLED", 409);
  } else {
    throwError("INVALID_ITEM_TYPE", 400);
  }

  const cart = await getOrCreateCart(userId);

  const exists = cart.cartItems.some((i) => i.itemId === itemId);
  if (exists) throwError("ITEM_ALREADY_IN_CART", 409);

  await db.create({
    model: "cartItem",
    data: { cartId: cart.id, type, itemId },
  });

  await syncCartTotals(cart.id);

  return getCartService(userId);
};

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

  // المستلمين اللي هنبعتلهم إشعار بعد نجاح الـ transaction
  const enrollNotifyReceivers = [];

  const result = await db.transaction(async (tx) => {
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

        const paidAmount = Number(
          course.salePrice ?? course.originalPrice ?? 0,
        );
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

        if (teacherUserId) enrollNotifyReceivers.push(teacherUserId);
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

        if (teacherUserId) enrollNotifyReceivers.push(teacherUserId);
      }
    }

    if (enrolled.length === 0) {
      throwError("NO_NEW_COURSES_TO_ENROLL", 400);
    }

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

    await tx.deleteMany({
      model: "cartItem",
      where: { cartId: cart.id },
    });

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

  // الإشعارات بعد نجاح الـ transaction (مش جواها)
  for (const receiverId of enrollNotifyReceivers) {
    if (receiverId === userId) continue;
    await notify({
      receiverId,
      receiverType: reciverNotificationEnum.USER,
      type: notificationTypeEnum.COURSE_ENROLLED,
      priority: priorityEnum.MEDIUM,
    });
  }

  return result;
};
