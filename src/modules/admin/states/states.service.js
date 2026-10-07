import * as db from "../../../db/db.service.js";
import dayjs from "dayjs";
const calculateGrowthPercent = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const growth = ((current - previous) / previous) * 100;
  return Number(growth.toFixed(1));
};
export const getStatesService = async (query = {}, locale = "en") => {
  const now = dayjs();

  const selectedYear = query.year ? Number(query.year) : now.year();

  // month
  const startOfCurrentMonth = now.startOf("month").toDate();

  const startOfNextMonth = now.add(1, "month").startOf("month").toDate();

  const startOfLastMonth = now.subtract(1, "month").startOf("month").toDate();

  const endOfLastMonth = startOfCurrentMonth;

  // year
  const startOfYear = dayjs().year(selectedYear).startOf("year").toDate();

  const endOfYear = dayjs()
    .year(selectedYear + 1)
    .startOf("year")
    .toDate();

  // hours
  const last24Hours = now.subtract(24, "hour").toDate();

  const prev24Hours = now.subtract(48, "hour").toDate();

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

    dbService.findMany({
      model: "category",
      include: {
        translations: true,
        courses: {
          select: {
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    }),
    dbService.findMany({
      model: "notification",
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { notificationTranslations: true },
    }),

    dbService.findMany({
      model: "activityLog",
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userName: true,
        action: true,
        module: true,
        status: true,
        createdAt: true,
      },
    }),





  ]);
};



