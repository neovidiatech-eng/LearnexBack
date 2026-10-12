import "dotenv/config";
import test, { describe, before, after } from "node:test";
import assert from "node:assert/strict";
import * as db from "../src/db/db.service.js";
import {
  bookPlanService,
  finalizePlanPaymentService,
} from "../src/modules/student/teachers/teachers.service.js";
import { bookPlanSchema } from "../src/modules/student/teachers/teachers.validation.js";

describe("Student Book Plan Flow & Payment Preparation Tests", () => {
  let teacherUser;
  let teacher;
  let otherTeacherUser;
  let otherTeacher;
  let studentUser;
  let student;
  let activePlan;
  let inactivePlan;
  let percentageDiscountPlan;
  let fixedDiscountPlan;
  let excessiveDiscountPlan;

  const createdTransactions = [];
  const createdSubscriptions = [];
  const createdPlans = [];

  before(async () => {
    // 1) Find or create a teacher with a configured session price
    teacher = await db.findFirst({
      model: "teacher",
      where: {
        sessionPrice50Min: { gt: 0 },
        user: { status: "ACTIVE" },
      },
      include: { user: true },
    });

    if (!teacher) {
      teacher = await db.findFirst({
        model: "teacher",
        include: { user: true },
      });
      if (teacher) {
        teacher = await db.updateOne({
          model: "teacher",
          where: { id: teacher.id },
          data: { sessionPrice50Min: 50.0 },
          include: { user: true },
        });
      }
    }
    teacherUser = teacher.user;

    // 2) Find another teacher
    otherTeacher = await db.findFirst({
      model: "teacher",
      where: { id: { not: teacher.id } },
      include: { user: true },
    });
    if (!otherTeacher) {
      otherTeacher = teacher;
    }
    otherTeacherUser = otherTeacher.user;

    // 3) Find a student (ensuring student user is different from teacher)
    student = await db.findFirst({
      model: "student",
      where: { userId: { notIn: [teacherUser.id, otherTeacherUser.id] } },
      include: { user: true },
    });
    assert.ok(student, "A student entity must exist in the database for testing");
    studentUser = student.user;

    // 4) Create test plans for the teacher
    activePlan = await db.create({
      model: "sessionPlan",
      data: {
        teacherId: teacher.id,
        sessionsCount: 10,
        price: 300.0,
        isActive: true,
      },
    });
    createdPlans.push(activePlan.id);

    inactivePlan = await db.create({
      model: "sessionPlan",
      data: {
        teacherId: teacher.id,
        sessionsCount: 5,
        price: 150.0,
        isActive: false,
      },
    });
    createdPlans.push(inactivePlan.id);

    percentageDiscountPlan = await db.create({
      model: "sessionPlan",
      data: {
        teacherId: teacher.id,
        sessionsCount: 10,
        price: 200.0,
        discountType: "PERCENTAGE",
        discountValue: 20.0, // 20% off -> 160.00
        isActive: true,
      },
    });
    createdPlans.push(percentageDiscountPlan.id);

    fixedDiscountPlan = await db.create({
      model: "sessionPlan",
      data: {
        teacherId: teacher.id,
        sessionsCount: 5,
        price: 100.0,
        discountType: "FIXED",
        discountValue: 25.0, // 25 off -> 75.00
        isActive: true,
      },
    });
    createdPlans.push(fixedDiscountPlan.id);

    excessiveDiscountPlan = await db.create({
      model: "sessionPlan",
      data: {
        teacherId: teacher.id,
        sessionsCount: 2,
        price: 30.0,
        discountType: "FIXED",
        discountValue: 50.0, // 50 off 30 -> should clamp at 0
        isActive: true,
      },
    });
    createdPlans.push(excessiveDiscountPlan.id);
  });

  after(async () => {
    // Clean up created records
    for (const tid of createdTransactions) {
      try {
        await db.deleteOne({ model: "transaction", where: { id: tid } });
      } catch {}
    }
    for (const sid of createdSubscriptions) {
      try {
        await db.deleteOne({ model: "teacherSubscription", where: { id: sid } });
      } catch {}
    }
    for (const pid of createdPlans) {
      try {
        await db.deleteOne({ model: "sessionPlan", where: { id: pid } });
      } catch {}
    }
  });

  // ─── 1. Student profile not found ──────────────────────────────────────────
  test("1. Should fail when student profile is not found", async () => {
    await assert.rejects(
      async () => {
        await bookPlanService({
          planId: activePlan.id,
          userId: "00000000-0000-0000-0000-000000000000",
        });
      },
      (err) => {
        assert.equal(err.message, "STUDENT_NOT_FOUND");
        assert.equal(err.cause, 404);
        return true;
      }
    );
  });

  // ─── 2. Plan not found or inactive ─────────────────────────────────────────
  test("2. Should fail when plan does not exist or is inactive", async () => {
    // Non-existent plan
    await assert.rejects(
      async () => {
        await bookPlanService({
          planId: "00000000-0000-0000-0000-000000000000",
          userId: studentUser.id,
        });
      },
      (err) => {
        assert.equal(err.message, "PLAN_NOT_FOUND");
        assert.equal(err.cause, 404);
        return true;
      }
    );

    // Inactive plan
    await assert.rejects(
      async () => {
        await bookPlanService({
          planId: inactivePlan.id,
          userId: studentUser.id,
        });
      },
      (err) => {
        assert.equal(err.message, "PLAN_NOT_FOUND");
        assert.equal(err.cause, 404);
        return true;
      }
    );
  });

  // ─── 3. Teacher attempting to purchase their own plan ──────────────────────
  test("3. Should prevent teacher from booking their own plan", async () => {
    // If the teacher user also has a student profile or attempts purchase
    await assert.rejects(
      async () => {
        await bookPlanService({
          planId: activePlan.id,
          userId: teacherUser.id,
        });
      },
      (err) => {
        assert.ok(
          err.message === "CANNOT_BOOK_OWN_PLAN" ||
            err.message === "STUDENT_NOT_FOUND"
        );
        return true;
      }
    );
  });

  // ─── 4. Student wallet payment being rejected ──────────────────────────────
  test("4. Should reject student wallet payment in both validation and service", async () => {
    // Validation schema rejects WALLET
    const validationResult = bookPlanSchema.body.validate({
      paymentMethod: "WALLET",
    });
    assert.ok(validationResult.error, "Joi schema must reject WALLET paymentMethod");

    // Service also rejects WALLET explicitly
    await assert.rejects(
      async () => {
        await bookPlanService({
          planId: activePlan.id,
          userId: studentUser.id,
          paymentMethod: "WALLET",
        });
      },
      (err) => {
        assert.equal(err.message, "STUDENT_WALLET_NOT_SUPPORTED");
        assert.equal(err.cause, 400);
        return true;
      }
    );
  });

  // ─── 5. No successful transaction or system-wallet credit before payment ───
  test("5. Should create PENDING transaction and NOT credit system wallet before payment", async () => {
    const systemWalletBefore = await db.findFirst({
      model: "wallet",
      where: { type: "system" },
    });
    const initialBalance = Number(systemWalletBefore?.balance || 0);

    const booking = await bookPlanService({
      planId: activePlan.id,
      userId: studentUser.id,
    });
    createdTransactions.push(booking.transaction.id);
    createdSubscriptions.push(booking.subscription.id);

    // Verify transaction status is PENDING
    assert.equal(booking.transaction.status, "PENDING");

    // Query DB directly to verify persistence of PENDING status
    const dbTransaction = await db.findFirst({
      model: "transaction",
      where: { id: booking.transaction.id },
    });
    assert.equal(dbTransaction.status, "PENDING");

    // Verify system wallet balance was NOT increased
    const systemWalletAfter = await db.findFirst({
      model: "wallet",
      where: { type: "system" },
    });
    const afterBalance = Number(systemWalletAfter?.balance || 0);
    assert.equal(
      afterBalance,
      initialBalance,
      "System wallet balance must NOT be credited before payment confirmation"
    );
  });

  // ─── 6. No active subscription or session-counter update before payment ───
  test("6. Should create PENDING subscription and NOT increase student session counters", async () => {
    const studentBefore = await db.findFirst({
      model: "student",
      where: { id: student.id },
    });

    const booking = await bookPlanService({
      planId: activePlan.id,
      userId: studentUser.id,
    });
    createdTransactions.push(booking.transaction.id);
    createdSubscriptions.push(booking.subscription.id);

    // Subscription must be PENDING
    assert.equal(booking.subscription.status, "PENDING");
    const dbSub = await db.findFirst({
      model: "teacherSubscription",
      where: { id: booking.subscription.id },
    });
    assert.equal(dbSub.status, "PENDING");

    // Student session counts must remain unchanged
    const studentAfter = await db.findFirst({
      model: "student",
      where: { id: student.id },
    });
    assert.equal(
      studentAfter.sessionCount,
      studentBefore.sessionCount,
      "sessionCount must not increase before payment confirmation"
    );
    assert.equal(
      studentAfter.sessionLeft,
      studentBefore.sessionLeft,
      "sessionLeft must not increase before payment confirmation"
    );
  });

  // ─── 7. Pricing and discount calculation ───────────────────────────────────
  test("7. Should calculate pricing and discounts correctly", async () => {
    // PERCENTAGE: 200 - 20% = 160
    const pctBooking = await bookPlanService({
      planId: percentageDiscountPlan.id,
      userId: studentUser.id,
    });
    createdTransactions.push(pctBooking.transaction.id);
    createdSubscriptions.push(pctBooking.subscription.id);
    assert.equal(pctBooking.plan.price, 160.0);
    assert.equal(Number(pctBooking.transaction.amount), 160.0);

    // FIXED: 100 - 25 = 75
    const fixedBooking = await bookPlanService({
      planId: fixedDiscountPlan.id,
      userId: studentUser.id,
    });
    createdTransactions.push(fixedBooking.transaction.id);
    createdSubscriptions.push(fixedBooking.subscription.id);
    assert.equal(fixedBooking.plan.price, 75.0);
    assert.equal(Number(fixedBooking.transaction.amount), 75.0);

    // Excessive discount prevented from going negative (30 - 50 = 0)
    const clampedBooking = await bookPlanService({
      planId: excessiveDiscountPlan.id,
      userId: studentUser.id,
    });
    createdTransactions.push(clampedBooking.transaction.id);
    createdSubscriptions.push(clampedBooking.subscription.id);
    assert.equal(clampedBooking.plan.price, 0.0);
    assert.equal(Number(clampedBooking.transaction.amount), 0.0);
  });

  // ─── 8. Customized session count without modifying original plan ───────────
  test("8. Should calculate custom session count using teacher session price without mutating SessionPlan", async () => {
    const originalPlanBefore = await db.findFirst({
      model: "sessionPlan",
      where: { id: activePlan.id },
    });

    const customCount = 4;
    const unitPrice = Number(teacher.sessionPrice50Min);
    const expectedPrice = unitPrice * customCount;

    const booking = await bookPlanService({
      planId: activePlan.id,
      userId: studentUser.id,
      customSessionCount: customCount,
    });
    createdTransactions.push(booking.transaction.id);
    createdSubscriptions.push(booking.subscription.id);

    // Verify custom purchase details
    assert.equal(booking.plan.isCustomized, true);
    assert.equal(booking.plan.sessionsCount, customCount);
    assert.equal(booking.plan.price, expectedPrice);
    assert.equal(Number(booking.transaction.amount), expectedPrice);
    assert.equal(booking.subscription.type, "session");

    // CRITICAL: Verify the original SessionPlan was NOT mutated
    const originalPlanAfter = await db.findFirst({
      model: "sessionPlan",
      where: { id: activePlan.id },
    });
    assert.equal(originalPlanAfter.sessionsCount, originalPlanBefore.sessionsCount);
    assert.equal(Number(originalPlanAfter.price), Number(originalPlanBefore.price));
  });

  // ─── 9. Duplicate payment confirmation prevention ──────────────────────────
  test("9. Should confirm payment once and reject duplicate payment confirmations", async () => {
    const booking = await bookPlanService({
      planId: activePlan.id,
      userId: studentUser.id,
    });
    createdTransactions.push(booking.transaction.id);
    createdSubscriptions.push(booking.subscription.id);

    const studentBefore = await db.findFirst({
      model: "student",
      where: { id: student.id },
    });

    // 1st Finalization: Must succeed
    const finalized = await finalizePlanPaymentService({
      transactionId: booking.transaction.id,
      gatewayPaymentId: "gw_test_payment_123",
    });

    assert.equal(finalized.transaction.status, "COMPLETED");
    assert.equal(finalized.subscription.status, "ACTIVE");
    assert.equal(
      finalized.student.sessionCount,
      studentBefore.sessionCount + activePlan.sessionsCount
    );

    // 2nd Finalization (duplicate attempt): Must reject with 409
    await assert.rejects(
      async () => {
        await finalizePlanPaymentService({
          transactionId: booking.transaction.id,
          gatewayPaymentId: "gw_test_payment_duplicate",
        });
      },
      (err) => {
        assert.equal(err.message, "PAYMENT_ALREADY_PROCESSED");
        assert.equal(err.cause, 409);
        return true;
      }
    );

    // Student session counts must NOT be incremented a second time
    const studentFinal = await db.findFirst({
      model: "student",
      where: { id: student.id },
    });
    assert.equal(studentFinal.sessionCount, finalized.student.sessionCount);
  });

  // ─── 10. Rollback when a transactional operation fails ─────────────────────
  test("10. Should rollback changes when a transactional operation fails", async () => {
    const booking = await bookPlanService({
      planId: activePlan.id,
      userId: studentUser.id,
    });
    createdTransactions.push(booking.transaction.id);
    createdSubscriptions.push(booking.subscription.id);

    // Corrupt transaction metadata to cause a failure during finalization
    await db.updateOne({
      model: "transaction",
      where: { id: booking.transaction.id },
      data: {
        reason: {
          ...booking.transaction.reason,
          studentId: "non-existent-student-uuid",
        },
      },
    });

    // Attempt finalization: should fail because studentId is invalid
    await assert.rejects(async () => {
      await finalizePlanPaymentService({
        transactionId: booking.transaction.id,
      });
    });

    // Verify rollback: transaction status must remain PENDING
    const txn = await db.findFirst({
      model: "transaction",
      where: { id: booking.transaction.id },
    });
    assert.equal(txn.status, "PENDING");

    // Subscription must remain PENDING
    const sub = await db.findFirst({
      model: "teacherSubscription",
      where: { id: booking.subscription.id },
    });
    assert.equal(sub.status, "PENDING");
  });
});
