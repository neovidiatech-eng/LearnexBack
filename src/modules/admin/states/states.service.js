import * as db from "../../../db/db.service.js";
const calculateGrowthPercent = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const growth = ((current - previous) / previous) * 100;
  return Number(growth.toFixed(1));
};
export const getStatesService = async (query = {}, locale = "en") => {
  const now = new Date();
  const selectedYear = query.year ? Number(query.year) : now.getFullYear();
  ///////month
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = startOfCurrentMonth;
  /////////year
  const startOfYear = new Date(selectedYear, 0, 1);
  const endOfYear = new Date(selectedYear + 1, 0, 1);
  /////////hours
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const prev24Hours = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const monthsNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [
    totalStudentsCount,
    currentMonthStudentsCount,
    lastMonthStudentsCount,

    totalTeachersCount,
    pendingTeachersCount,
    currentMonthTeachersCount,

    activeCoursesCount,
    draftCoursesCount,
    currentMonthCoursesCount,

    currentMonthEnrollments,
    lastMonthEnrollments,

    activeSessionsCount,
    prevSessionsCount,

    yearlyEnrollments,

    categoriesData,

    rawNotifications,

    recentActivities,
  ] = await Promise.all([
    db.count({ model: "student" }),
    //current month
    db.count({
      model: "student",
      where: { createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth } },
    }),

    //last month
    db.count({
      model: "student",
      where: { createdAt: { gte: startOfLastMonth, lt: endOfLastMonth } },
    }),

    db.count({ model: "teacher" }),
    db.count({
      model: "teacher",
      where: { createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth } },
    }),
    dbService.count({
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

    dbService.count({
      model: "course",
      where: { status: courseStatusEnum.PUBLISHED },
    }),
    dbService.count({
      model: "course",
      where: { status: courseStatusEnum.DRAFT },
    }),
    dbService.count({
      model: "course",
      where: { createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth } },
    }),

    dbService.findMany({
      model: "courseEnrollment",
      where: {
        enrolledAt: { gte: startOfCurrentMonth, lt: startOfNextMonth },
        status: {
          notIn: [
            enrollmentStatusEnum.CANCELLED,
            enrollmentStatusEnum.REFUNDED,
          ],
        },
      },
      select: { paidAmount: true },
    }),
    dbService.findMany({
      model: "courseEnrollment",
      where: {
        enrolledAt: { gte: startOfLastMonth, lt: endOfLastMonth },
        status: {
          notIn: [
            enrollmentStatusEnum.CANCELLED,
            enrollmentStatusEnum.REFUNDED,
          ],
        },
      },
      select: { paidAmount: true },
    }),
    dbService.count({
      model: "activityLog",
      where: { createdAt: { gte: last24Hours } },
    }),
    dbService.count({
      model: "activityLog",
      where: { createdAt: { gte: prev24Hours, lt: last24Hours } },
    }),

    dbService.findMany({
      model: "courseEnrollment",
      where: {
        enrolledAt: { gte: startOfYear, lt: endOfYear },
        status: {
          notIn: [
            enrollmentStatusEnum.CANCELLED,
            enrollmentStatusEnum.REFUNDED,
          ],
        },
      },
      select: { enrolledAt: true, paidAmount: true },
    }),
  ]);
    
};
