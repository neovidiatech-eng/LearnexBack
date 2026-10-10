import * as db from "../../../db/db.service.js";
import { coursesType } from "../../../utils/Enums/teacherCourse.enum.js";

/**
 * GET /student/home
 * Aggregated Home Data for Student App:
 * - Categories
 * - Featured Courses (latest published)
 * - Top Rated Courses (highest rated published)
 * - Top Instructors
 * - Student Cart Items Count
 * - Dynamic / Promo Banners
 */
export const getStudentHomeDataService = async (userId, { locale = "ar" } = {}) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    categories,
    featuredCoursesRaw,
    topRatedCoursesRaw,
    instructorsRaw,
    cart,
    todaySessionsRaw,
  ] = await Promise.all([
    db.findMany({
      model: "category",
      include: {
        translations: {
          where: { locale },
          select: { id: true, locale: true, name: true, description: true },
        },
      },
      orderBy: { coursesCount: "desc" },
      take: 12,
    }),

    db.findMany({
      model: "course",
      where: { status: "PUBLISHED" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        translations: { where: { locale } },
        category: {
          select: {
            id: true,
            slug: true,
            translations: { where: { locale } },
          },
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

    db.findMany({
      model: "course",
      where: { status: "PUBLISHED" },
      take: 8,
      orderBy: { avgRating: "desc" },
      include: {
        translations: { where: { locale } },
        category: {
          select: {
            id: true,
            slug: true,
            translations: { where: { locale } },
          },
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

    db.findMany({
      model: "teacher",
      take: 10,
      orderBy: { avgRating: "desc" },
      select: {
        id: true,
        subject: true,
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
      },
    }),

    db.findOne({
      model: "cart",
      where: { userId },
      select: { totalItems: true },
    }),

    db.findMany({
      model: "course",
      where: {
        status: "PUBLISHED",
        scheduledAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      take: 5,
      include: {
        translations: { where: { locale } },
        instructor: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
          },
        },
      },
    }),
  ]);

  const allCourseIds = Array.from(
    new Set([
      ...featuredCoursesRaw.map((c) => c.id),
      ...topRatedCoursesRaw.map((c) => c.id),
    ])
  );

  let enrollmentMap = new Map();
  if (allCourseIds.length > 0) {
    const userEnrollments = await db.findMany({
      model: "courseEnrollment",
      where: {
        studentId: userId,
        courseId: { in: allCourseIds },
      },
      select: { courseId: true, progressPercent: true, status: true },
    });
    enrollmentMap = new Map(userEnrollments.map((e) => [e.courseId, e]));
  }

  const mapCourse = (c) => {
    const enrollment = enrollmentMap.get(c.id);
    return {
      ...c,
      type: coursesType.COURSE,
      isEnrolled: !!enrollment,
      progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
      enrollmentStatus: enrollment ? enrollment.status : null,
    };
  };

  const featuredCourses = featuredCoursesRaw.map(mapCourse);
  const topRatedCourses = topRatedCoursesRaw.map(mapCourse);

  const todaySessions = (todaySessionsRaw || []).map((c) => {
    const trans = c.translations?.[0];
    const sessionDate = c.scheduledAt ? new Date(c.scheduledAt) : null;
    const now = Date.now();
    const isLive = sessionDate ? Math.abs(now - sessionDate.getTime()) < 3600000 : false;
    return {
      id: c.id,
      title: trans?.title || c.title || "",
      instructorName: c.instructor?.fullName || "",
      instructorPhoto: c.instructor?.profilePhoto || null,
      imageUrl: c.thumbnail || null,
      time: sessionDate
        ? sessionDate.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      scheduledAt: c.scheduledAt,
      isLive,
      sessionUrl: c.previewVideoUrl || null,
    };
  });

  const banners = [
    {
      id: "b1",
      title: "خصم يصل إلى 50%",
      subtitle: "على جميع دورات تطوير البرمجيات والذكاء الاصطناعي",
      imageUrl:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
      actionType: "DISCOUNT",
    },
    {
      id: "b2",
      title: "تعلم مع نخبة المدربين",
      subtitle: "دورات عملية تؤهلك لسوق العمل فوراً",
      imageUrl:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop",
      actionType: "INSTRUCTORS",
    },
    {
      id: "b3",
      title: "مسارات احترافية جديدة",
      subtitle: "أحدث المناهج التعليمية في التصميم والبرمجة",
      imageUrl:
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000&auto=format&fit=crop",
      actionType: "CATEGORIES",
    },
  ];

  return {
    banners,
    categories,
    featuredCourses,
    topRatedCourses,
    instructors: instructorsRaw,
    cartCount: cart?.totalItems ?? 0,
    todaySessions,
  };
};
