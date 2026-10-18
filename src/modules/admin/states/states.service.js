import * as db from "../../../db/db.service.js";
import dayjs from "dayjs";
import {
  userStatusEnum,
  courseStatusEnum,
  enrollmentStatusEnum,
} from "../../../utils/Enums/index.js";
import { sessionStatus } from "../../../utils/Enums/session.enum.js";

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

  // now         ==> 17 oct 8:00 pm
  // last24Hours ==> 16 oct 8:00 pm
  // prev24Hours ==> 15 oct 8:00 pm
  const last24Hours = now.subtract(24, "hour").toDate();
  const prev24Hours = now.subtract(48, "hour").toDate(); //48 from now to clear it & 24 from last24Hours

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
    todaySessionsCount,
    yesterdaySessionsCount,

    yearlyEnrollments,
    categoriesData,
    rawNotifications,
    recentEnrollments,
    recentPublishedCourses,
    recentLiveSessions,
  ] = await Promise.all([
    // Total students & monthly comparison
    db.count({ model: "student" }),
    db.count({
      model: "student",
      where: { createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth } },
    }),
    db.count({
      model: "student",
      where: { createdAt: { gte: startOfLastMonth, lt: endOfLastMonth } },
    }),

    // Total teachers, monthly & pending review
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

    // Active courses (PUBLISHED), draft courses & monthly new courses
    db.count({
      model: "course",
      where: { status: courseStatusEnum.PUBLISHED },
    }),
    db.count({
      model: "course",
      where: { status: courseStatusEnum.DRAFT },
    }),
    //courses in current month
    db.count({
      model: "course",
      where: { createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth } },
    }),

    // Current & last month enrollments for revenue calculation
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

    // Active sessions right now from the session model
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
    // Sessions today vs yesterday for daily comparison (-3.1% vs yesterday)
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
        startAt: { gte: prev24Hours, lt: last24Hours },
        status: { not: sessionStatus.CANCELLED },
      },
    }),

    // Yearly enrollments for line & bar charts
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

    // Categories data with course enrollments count
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

    // Recent notifications (5 items)
    db.findMany({
      model: "notification",
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { notificationTranslations: true },
    }),

    // Recent Activities 1: Recent course enrollments
    db.findMany({
      model: "courseEnrollment",
      take: 5,
      orderBy: { enrolledAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
          },
        },
        course: {
          select: {
            id: true,
            translations: {
              where: locale ? { locale } : undefined,
              select: { title: true },
            },
          },
        },
      },
    }),

    // Recent Activities 2: Recent published courses
    db.findMany({
      model: "course",
      where: { status: courseStatusEnum.PUBLISHED },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        translations: {
          where: locale ? { locale } : undefined,
          select: { title: true },
        },
        instructor: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
          },
        },
      },
    }),

    // Recent Activities 3: Recent live/joined sessions
    db.findMany({
      model: "session",
      where: {
        status: {
          in: [
            sessionStatus.LIVE,
            sessionStatus.COMPLETED,
            sessionStatus.SCHEDULED,
          ],
        },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Revenue calculation
  const currentMonthRevenue = currentMonthEnrollments.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0,
  );
  const lastMonthRevenue = lastMonthEnrollments.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0,
  );

  //grows +14.8% vs last
  const monthlyRevenueGrowth = calculateGrowthPercent(
    currentMonthRevenue,
    lastMonthRevenue,
  );

  // Yearly monthly stats (enrollments & revenue per month)
  const monthlyStats = monthsNames.map((month) => ({
    month,
    enrolledStudents: 0,
    revenue: 0,
  }));

  //توزيع اشتراكات السنة ع الشهور
  yearlyEnrollments.forEach((enrollment) => {
    const monthIndex = dayjs(enrollment.enrolledAt).month();
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyStats[monthIndex].enrolledStudents += 1;
      monthlyStats[monthIndex].revenue += Number(enrollment.paidAmount || 0);
    }
  });

  // Category distribution calculation
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

  // Format notifications
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

  // Normalize recent activities from educational models (Enrollments, Published Courses, Sessions)
  const formattedActivities = [
    ...recentEnrollments.map((item) => {
      const studentName = item.student?.fullName || "Student";
      const courseTitle = item.course?.translations?.[0]?.title || "Course";
      return {
        id: `enrollment-${item.id}`,
        type: "ENROLLMENT",
        action: "ENROLLED",
        title: `${studentName} enrolled in ${courseTitle}`,
        actor: {
          id: item.student?.id,
          name: studentName,
          photo: item.student?.profilePhoto || null,
        },
        target: {
          id: item.course?.id,
          title: courseTitle,
        },
        createdAt: item.enrolledAt,
      };
    }),

    ...recentPublishedCourses.map((item) => {
      const courseTitle = item.translations?.[0]?.title || "Untitled Course";
      const instructorName = item.instructor?.fullName || "Instructor";
      return {
        id: `course-${item.id}`,
        type: "COURSE_PUBLISHED",
        action: "PUBLISHED",
        title: `New Course '${courseTitle}' published`,
        actor: {
          id: item.instructor?.id,
          name: instructorName,
          photo: item.instructor?.profilePhoto || null,
        },
        target: {
          id: item.id,
          title: courseTitle,
        },
        createdAt: item.updatedAt,
      };
    }),

    ...recentLiveSessions.map((item) => {
      const studentName = item.student?.user?.fullName || "Student";
      const actionText =
        item.status === sessionStatus.LIVE ? "is in live session" : "joined";
      return {
        id: `session-${item.id}`,
        type: "SESSION",
        action: item.status,
        title: `${studentName} ${actionText} ${item.title}`,
        actor: {
          id: item.student?.user?.id,
          name: studentName,
          photo: item.student?.user?.profilePhoto || null,
        },
        target: {
          id: item.id,
          title: item.title,
        },
        createdAt: item.studentJoinedAt || item.startAt || item.updatedAt,
      };
    }),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

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
        subTitle: "Right now",
        growthPercent: calculateGrowthPercent(
          todaySessionsCount,
          yesterdaySessionsCount,
        ),
      },
    },

    charts: {
      selectedYear,
      yearlyOverview: monthlyStats,
      courseCategories: categoriesDistribution,
    },

    recentNotifications: formattedNotifications,
    recentActivities: formattedActivities,
  };
};
