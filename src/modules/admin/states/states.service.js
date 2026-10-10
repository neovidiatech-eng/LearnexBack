import * as db from "../../../db/db.service.js";
import dayjs from "dayjs";
import {
  userStatusEnum,
  courseStatusEnum,
  enrollmentStatusEnum,
} from "../../../utils/Enums/index.js";

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

  const startOfCurrentMonth = now.startOf("month").toDate();
  const startOfNextMonth = now.add(1, "month").startOf("month").toDate();

  const startOfLastMonth = now.subtract(1, "month").startOf("month").toDate();
  const endOfLastMonth = startOfCurrentMonth;

  const startOfYear = dayjs().year(selectedYear).startOf("year").toDate();
  const endOfYear = dayjs()
    .year(selectedYear + 1)
    .startOf("year")
    .toDate();

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
    currentMonthTeachersCount,
    pendingTeachersCount,

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
    db.count({
      model: "student",
      where: { createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth } },
    }),
    db.count({
      model: "student",
      where: { createdAt: { gte: startOfLastMonth, lt: endOfLastMonth } },
    }),

    db.count({ model: "teacher" }),
    db.count({
      model: "teacher",
      where: { createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth } },
    }),
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
      where: { createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth } },
    }),

    db.findMany({
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
    db.findMany({
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

    db.count({
      model: "activityLog",
      where: { createdAt: { gte: last24Hours } },
    }),
    db.count({
      model: "activityLog",
      where: { createdAt: { gte: prev24Hours, lt: last24Hours } },
    }),

    db.findMany({
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

    db.findMany({
      model: "category",
      include: {
        translations: {
          where: locale ? { locale } : undefined,
        },
        courses: {
          select: {
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    }),

    db.findMany({
      model: "notification",
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { notificationTranslations: true },
    }),

    db.findMany({
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

  const currentMonthRevenue = currentMonthEnrollments.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0,
  );
  const lastMonthRevenue = lastMonthEnrollments.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0,
  );
  const monthlyRevenueGrowth = calculateGrowthPercent(
    currentMonthRevenue,
    lastMonthRevenue,
  );

  const monthlyStats = monthsNames.map((month) => ({
    month,
    enrolledStudents: 0,
    revenue: 0,
  }));

  yearlyEnrollments.forEach((enrollment) => {
    const monthIndex = dayjs(enrollment.enrolledAt).month(); 
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyStats[monthIndex].enrolledStudents += 1;
      monthlyStats[monthIndex].revenue += Number(enrollment.paidAmount || 0);
    }
  });

  let totalCategoryEnrollments = 0;
  const categoriesDistribution = categoriesData.map((cat) => {
    const enrollmentsCount = cat.courses.reduce(
      (sum, course) => sum + (course._count?.enrollments || 0),
      0,
    );
    totalCategoryEnrollments += enrollmentsCount;
    const name = cat.translations?.[0]?.name || cat.slug;

    return {
      id: cat.id,
      name,
      slug: cat.slug,
      image: cat.image,
      enrollmentsCount,
      percentage: 0,
    };
  });

  categoriesDistribution.forEach((cat) => {
    cat.percentage =
      totalCategoryEnrollments > 0
        ? Number(
            ((cat.enrollmentsCount / totalCategoryEnrollments) * 100).toFixed(
              1,
            ),
          )
        : 0;
  });

  const formattedNotifications = rawNotifications.map((n) => {
    const trans =
      n.notificationTranslations?.find((t) => t.locale === locale) ||
      n.notificationTranslations?.[0] ||
      {};

    return {
      id: n.id,
      type: n.type,
      priority: n.priority,
      link: n.link,
      isRead: n.isRead,
      title: trans.title || "",
      message: trans.message || "",
      createdAt: n.createdAt,
    };
  });

  return {
    cards: {
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
        growthPercent: monthlyRevenueGrowth,
      },
      activeSessions: {
        count: activeSessionsCount,
        growthPercent: calculateGrowthPercent(
          activeSessionsCount,
          prevSessionsCount,
        ),
      },
    },

    charts: {
      selectedYear,
      yearlyOverview: monthlyStats, 
      courseCategories: categoriesDistribution, 
    },

    recentNotifications: formattedNotifications,
    recentActivities,
  };
};
