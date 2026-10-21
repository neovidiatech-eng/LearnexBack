import * as db from "../../../db/db.service.js";
import dayjs from "dayjs";
import {
  courseStatusEnum,
} from "../../../utils/Enums/index.js";
import { sessionStatus } from "../../../utils/Enums/session.enum.js";
import { getCardsAnalytics, ValidEnrollmentStatus } from "../../../utils/helpers/generalStats.js";

export const getStatesService = async (query = {}, locale = "en") => {
  const now = dayjs();
  const selectedYear = query.year ? Number(query.year) : now.year();
  const startOfYear = dayjs().year(selectedYear).startOf("year").toDate();
  const endOfYear = dayjs()
    .year(selectedYear + 1)
    .startOf("year")
    .toDate();

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
    cards,
    yearlyEnrollments,
    categoriesData,
    rawNotifications,
    recentEnrollments,
    recentPublishedCourses,
    recentLiveSessions,
  ] = await Promise.all([
    getCardsAnalytics({ now }),

    // Yearly enrollments for line & bar charts
    db.findMany({
      model: "courseEnrollment",
      where: {
        enrolledAt: { gte: startOfYear, lt: endOfYear },
        status: ValidEnrollmentStatus
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
    cards,
    charts: {
      selectedYear,
      yearlyOverview: monthlyStats,
      courseCategories: categoriesDistribution,
    },

    recentNotifications: formattedNotifications,
    recentActivities: formattedActivities,
  };
};
