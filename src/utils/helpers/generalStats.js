import * as db from "../../db/db.service.js";
import dayjs from "dayjs";
import {
  userStatusEnum,
  courseStatusEnum,
  enrollmentStatusEnum,
} from "../../utils/Enums/index.js";
import { sessionStatus } from "../../utils/Enums/session.enum.js";
export const calculateGrowthPercent = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const ValidEnrollmentStatus = {
  notIn: [enrollmentStatusEnum.CANCELLED, enrollmentStatusEnum.REFUNDED],
};
const revenueCalc = (items) =>
  items.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);

export const getCardsAnalytics = async ({ now = dayjs() } = {}) => {
  const startOfCurrentMonth = now.startOf("month").toDate();
  const startOfNextMonth = now.add(1, "month").startOf("month").toDate();
  const startOfLastMonth = now.subtract(1, "month").startOf("month").toDate();
  const endOfLastMonth = startOfCurrentMonth;
  const last24Hours = now.subtract(24, "hour").toDate();
  const prev24Hours = now.subtract(48, "hour").toDate();
  const thisMonth = { gte: startOfCurrentMonth, lt: startOfNextMonth };
  const lastMonth = { gte: startOfLastMonth, lt: endOfLastMonth };

  const [
    totalStudentsCount,
    currentMonthStudentsCount,
    lastMonthStudentsCount,

    totalTeachersCount,
    currentMonthTeachersCount,
    pendingTeachersCount,

    activeCoursesCount,
    draftCoursesCount,
    currentMonthCoursesCount,

    currentMonthEnrollments,
    lastMonthEnrollments,

    activeSessionsCount,
    todaySessionsCount,
    yesterdaySessionsCount,
  ] = await Promise.all([
    db.count({ model: "student" }),
    db.count({ model: "student", where: { createdAt: thisMonth } }),
    db.count({ model: "student", where: { createdAt: lastMonth } }),
    db.count({ model: "teacher" }),
    db.count({ model: "teacher", where: { createdAt: thisMonth } }),
    db.count({
      model: "teacher",
      where: {
        user: {
          status: {
            in: [
              userStatusEnum.PENDING_REVIEW,
              userStatusEnum.PENDING_VERIFICATION,
            ],
          },
        },
      },
    }),
    db.count({
      model: "course",
      where: { status: courseStatusEnum.PUBLISHED },
    }),
    db.count({
      model: "course",
      where: { status: courseStatusEnum.DRAFT },
    }),
    db.count({
      model: "course",
      where: { status: courseStatusEnum.PUBLISHED, createdAt: thisMonth },
    }),

    db.findMany({
      model: "courseEnrollment",
      where: { enrolledAt: thisMonth, status: ValidEnrollmentStatus },
      select: { paidAmount: true },
    }),
    db.findMany({
      model: "courseEnrollment",
      where: { enrolledAt: lastMonth, status: ValidEnrollmentStatus },
      select: { paidAmount: true },
    }),
    db.count({
      model: "session",
      where: {
        OR: [
          { status: sessionStatus.LIVE },
          {
            status: sessionStatus.SCHEDULED,
            startAt: { lte: now.toDate() },
            endAt: { gte: now.toDate() },
          },
        ],
      },
    }),
    db.count({
      model: "session",
      where: {
        startAt: { gte: last24Hours },
        status: { not: sessionStatus.CANCELLED },
      },
    }),
    db.count({
      model: "session",
      where: {
        startAt: {
          gte: prev24Hours,
          lt: last24Hours,
        },
        status: { not: sessionStatus.CANCELLED },
      },
    }),
  ]);
  const currentMonthRevenue = revenueCalc(currentMonthEnrollments);
  const lastMonthRevenue = revenueCalc(lastMonthEnrollments);
  
  return {
    totalStudents: {
      count: totalStudentsCount,
      subTitle: "Across all courses",
      growthPercent: calculateGrowthPercent(
        currentMonthStudentsCount,
        lastMonthStudentsCount,
      ),
    },
    totalTeachers: {
      count: totalTeachersCount,
      pendingApprovalCount: pendingTeachersCount,
      thisMonthCount: currentMonthTeachersCount,
    },
    activeCourses: {
      count: activeCoursesCount,
      draftCount: draftCoursesCount,
      thisMonthCount: currentMonthCoursesCount,
    },
    monthlyRevenue: {
      amount: currentMonthRevenue,
      monthName: now.format("MMM YYYY"),
      growthPercent: calculateGrowthPercent(
        currentMonthRevenue,
        lastMonthRevenue,
      ),
    },
    activeSessions: {
      count: activeSessionsCount,
      subTitle: "Right now",
      growthPercent: calculateGrowthPercent(
        todaySessionsCount,
        yesterdaySessionsCount,
      ),
    },
  };
};
