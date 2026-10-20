import * as db from "../../../db/db.service.js";
import { teacherSubscription } from "../../../utils/Enums/subscriptions.enum.js";
import { transactionStatus, transactionType } from "../../../utils/Enums/transactions.enum.js";
import { throwError } from "../../../utils/response.js";
export const getAllTeachersService = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  subject,
} = {}) => {
  const where = {
    ...(status ? { user: { status } } : {}),
    ...(subject ? { subject: { contains: subject, mode: "insensitive" } } : {}),
    ...(search
      ? {
          OR: [
            { subject: { contains: search, mode: "insensitive" } },
            {
              user: {
                OR: [
                  { fullName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const select = {
    id: true,
    subject: true,
    bio: true,
    avgRating: true,
    reviewsCount: true,
    totalCoursesCount: true,
    experienceYears: true,
    user: {
      select: {
        id: true,
        fullName: true,
        profilePhoto: true,
      },
    },
  };

  const result = await db.findManyWithPaginationAndCount({
    model: "teacher",
    where,
    page,
    limit,
    orderBy: { createdAt: "desc" },
    select,
  });

  return {
    teachers: result.items,
    pagination: result.pagination,
  };
};
export const getTeacherByIdService = async ({ teacherId, lang }) => {
  const select = {
    id: true,
    subject: true,
    avgRating: true,
    totalStudentsCount: true,
    totalCoursesCount: true,
    experienceYears: true,
    bio: true,
    linkedinUrl: true,
    cvUrl: true,
    introVideoUrl: true,
    createdAt: true,
    courses: {
      where: { status: "APPROVED" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        totalHours: true,
        wallPaper: true,
        status: true,
        createdAt: true,
      },
    },
    user: {
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        country: true,
        status: true,
        profilePhoto: true,
        courses: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            thumbnail: true,
            originalPrice: true,
            salePrice: true,
            durationHours: true,
            totalLessonsCount: true,
            translations: true,
          },
        },
      },
    },
    sessionPlans: {
      where: { isActive: true },
      select: {
        id: true,
        price: true,
        discountType: true,
        discountValue: true,
        sessionsCount: true,
        isActive: true,
        color: true,
        sessionPlansTranslations: {
          where: {
            lang,
          },
        },
      },
    },
  };
  let teacher = await db.findFirst({
    model: "teacher",
    where: {
      OR: [
        { id: teacherId },
        { userId: teacherId },
      ],
    },
    select,
  });

  if (!teacher) {
    const user = await db.findFirst({
      model: "user",
      where: { id: teacherId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        country: true,
        status: true,
        profilePhoto: true,
        teacher: { select },
        courses: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            thumbnail: true,
            originalPrice: true,
            salePrice: true,
            durationHours: true,
            totalLessonsCount: true,
            translations: true,
          },
        },
      },
    });

    if (user?.teacher) {
      teacher = user.teacher;
    } else if (user) {
      teacher = {
        id: user.id,
        subject: "Instructor",
        avgRating: 5.0,
        totalStudentsCount: 0,
        totalCoursesCount: user.courses?.length || 0,
        experienceYears: 1,
        bio: "",
        linkedinUrl: null,
        cvUrl: null,
        introVideoUrl: null,
        createdAt: new Date(),
        courses: [],
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          country: user.country,
          status: user.status,
          profilePhoto: user.profilePhoto,
          courses: user.courses || [],
        },
        sessionPlans: [],
      };
    }
  }

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return teacher;
};
export const bookPlanService = async ({
  planId,
  userId,
  paymentMethod = "CARD",
}) => {



  const [student, plan] = await Promise.all([
    db.findFirst({
      model: "student",
      where: { userId },
      select: {
        id: true,
        userId: true,
        sessionCount: true,
        sessionLeft: true,
        sessionUsed: true,
        planId: true,
      },
    }),
    db.findFirst({
      model: "sessionPlan",
      where: { id: planId, isActive: true },
      select: {
        id: true,
        sessionsCount: true,
        price: true,
        discountType: true,
        discountValue: true,
        teacherId: true,
        teacher: {
          select: {
            id: true,
            userId: true,
            sessionPrice50Min: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!student) {
    throwError({
      message: "STUDENT_NOT_FOUND",
      status: 404,
    });
  }

  if (!plan) {
    throwError({
      message: "PLAN_NOT_FOUND",
      status: 404,
    });
  }

  if (plan.teacher?.userId === userId) {
    throwError({
      message: "CANNOT_BOOK_OWN_PLAN",
      status: 400,
    });
  }

  // Determine requested session count
  const effectiveSessionsCount = Number(plan.sessionsCount || 1);
  const isCustomized = false;
  const sessionUnitPrice = Number(plan.teacher?.sessionPrice50Min || 0);

  let basePrice = Number(plan.price);

 
  // Calculate final price with discount rules preserved
  const discountValue = Number(plan.discountValue || 0);
  let finalPrice = basePrice;

  if (plan.discountType === "PERCENTAGE" && discountValue > 0) {
    finalPrice = basePrice - (basePrice * discountValue) / 100;
  } else if (plan.discountType === "FIXED" && discountValue > 0) {
    finalPrice = basePrice - discountValue;
  }

  finalPrice = Math.max(0, Math.round(finalPrice * 100) / 100);

  // Atomic database transaction to create pending records
  // IMPORTANT: Neither systemWallet nor student session counters are updated here.
  // Those will only be updated upon verified payment confirmation.
  const booking = await db.transaction(async (tx) => {
    // 1) Create TeacherSubscription with PENDING status
    const validityDays = plan.validityDays || 30;
    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    const subscription = await tx.create({
      model: "teacherSubscription",
      data: {
        teacherId: plan.teacherId,
        studentId: student.id,
        planId: plan.id,
        status: "PENDING",
        amount: finalPrice,
        type: "PLAN",
        sessionsCount: effectiveSessionsCount,
        sessionLeft: effectiveSessionsCount,
        sessionUsed: 0,
        expiresAt,
      },
    });

    // 2) Create Transaction record with PENDING status
    const transaction = await tx.create({
      model: "transaction",
      data: {
        userId,
        amount: finalPrice,
        type: transactionType.PAYMENT,
        status: transactionStatus.PENDING,
        paymentMethod: paymentMethod || "CARD",
        reason: {
          action: "BOOK_PLAN",
          planId: plan.id,
          teacherId: plan.teacherId,
          studentId: student.id,
          subscriptionId: subscription.id,
          sessionsCount: effectiveSessionsCount,
          isCustomized,
          unitPrice: sessionUnitPrice,
          originalPrice: basePrice,
          finalPrice,
          discountType: plan.discountType,
          discountValue: plan.discountValue,
        },
      },
    });

    return {
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        type: transaction.type,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
      },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        amount: subscription.amount,
        type: subscription.type,
      },
      plan: {
        id: plan.id,
        sessionsCount: effectiveSessionsCount,
        isCustomized,
        price: finalPrice,
        originalPrice: basePrice,
      },
      teacher: {
        id: plan.teacher?.id,
        name: plan.teacher?.user?.fullName,
      },
    };
  });

  return booking;
};

/**
 * Finalizes a plan purchase after a trusted payment provider confirms payment.
 * Designed for server-to-server webhook/callback handlers.
 *
 * Ensures:
 * - Idempotency (prevent duplicate processing of the same payment).
 * - Safe transaction status transition PENDING -> COMPLETED.
 * - Activation of the teacher subscription.
 * - Credit of the system wallet according to platform accounting rules.
 * - Increment of student's session counters (sessionCount & sessionLeft) exactly once.
 */
export const finalizePlanPaymentService = async ({
  transactionId,
  gatewayPaymentId,
}) => {
  if (!transactionId) {
    throwError({
      message: "TRANSACTION_ID_REQUIRED",
      status: 400,
    });
  }

  return await db.transaction(async (tx) => {
    // 1) Find the transaction
    const transaction = await tx.findFirst({
      model: "transaction",
      where: { id: transactionId },
    });

    if (!transaction) {
      throwError({
        message: "TRANSACTION_NOT_FOUND",
        status: 404,
      });
    }

    // Idempotency check: if already completed, reject
    if (transaction.status === "COMPLETED") {
      throwError({
        message: "PAYMENT_ALREADY_PROCESSED",
        status: 409,
      });
    }

    if (transaction.status !== "PENDING") {
      throwError({
        message: "INVALID_TRANSACTION_STATUS",
        status: 400,
      });
    }

    const reason = transaction.reason || {};
    const { studentId, subscriptionId, sessionsCount, planId } = reason;

    if (!studentId || !sessionsCount) {
      throwError({
        message: "INVALID_TRANSACTION_METADATA",
        status: 400,
      });
    }

    // 2) Find student
    const student = await tx.findFirst({
      model: "student",
      where: { id: studentId },
    });

    if (!student) {
      throwError({
        message: "STUDENT_NOT_FOUND",
        status: 404,
      });
    }

    // 3) Update transaction to COMPLETED
    const updatedTransaction = await tx.updateOne({
      model: "transaction",
      where: { id: transaction.id },
      data: {
        status: "COMPLETED",
        reason: {
          ...reason,
          gatewayPaymentId: gatewayPaymentId || null,
          confirmedAt: new Date().toISOString(),
        },
      },
    });

    // 4) Activate teacher subscription
    let updatedSubscription = null;
    if (subscriptionId) {
      updatedSubscription = await tx.updateOne({
        model: "teacherSubscription",
        where: { id: subscriptionId },
        data: {
          status: "ACTIVE",
          sessionsCount: Number(sessionsCount),
          sessionLeft: Number(sessionsCount),
        },
      });
    }

    // 5) Update student session counts and planId exactly once
    const updatedStudent = await tx.updateOne({
      model: "student",
      where: { id: student.id },
      data: {
        ...(planId && { planId }),
        sessionCount: (student.sessionCount || 0) + Number(sessionsCount),
        sessionLeft: (student.sessionLeft || 0) + Number(sessionsCount),
      },
      select: {
        id: true,
        userId: true,
        planId: true,
        sessionCount: true,
        sessionLeft: true,
        sessionUsed: true,
      },
    });

    // 6) Credit System Wallet
    const amountNum = Number(transaction.amount);
    let systemWallet = await tx.findFirst({
      model: "wallet",
      where: { type: "system" },
    });

    if (!systemWallet) {
      systemWallet = await tx.create({
        model: "wallet",
        data: {
          type: "system",
          balance: amountNum,
        },
      });
    } else {
      systemWallet = await tx.updateOne({
        model: "wallet",
        where: { id: systemWallet.id },
        data: {
          balance: Number(systemWallet.balance || 0) + amountNum,
        },
      });
    }

    return {
      transaction: updatedTransaction,
      subscription: updatedSubscription,
      student: updatedStudent,
      systemWallet: {
        id: systemWallet.id,
        balance: systemWallet.balance,
      },
    };
  });
};
