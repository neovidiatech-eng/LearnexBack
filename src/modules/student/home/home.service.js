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
    categoriesRaw,
    featuredCoursesRaw,
    topRatedCoursesRaw,
    instructorsRaw,
    cart,
    todaySessionsRaw,
    activeOffersRaw,
    bannersRaw,
  ] = await Promise.all([
    db.findMany({
      model: "category",
      select: {
        id: true,
        slug: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            courses: { where: { status: "PUBLISHED" } },
            teacherCourses: { where: { status: "APPROVED" } },
          },
        },
        translations: {
          where: { locale },
          select: { id: true, locale: true, name: true, description: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),

    db.findMany({
      model: "course",
      where: { status: "PUBLISHED" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        translations: true,
        category: {
          select: {
            id: true,
            slug: true,
            translations: true,
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
        translations: true,
        category: {
          select: {
            id: true,
            slug: true,
            translations: true,
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
      where: {
        user: { status: "ACTIVE" },
      },
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
            status: true,
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

    db.findMany({
      model: "offer",
      where: {
        status: "ACTIVE",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      take: 5,
      include: {
        translations: { where: { locale } },
        course: {
          select: {
            id: true,
            thumbnail: true,
            translations: { where: { locale } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.findMany({
      model: "banner",
      where: {
        isActive: true,
      },
      include: {
        translations: { where: { locale } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const categories = (categoriesRaw || [])
    .map(({ _count, ...category }) => ({
      ...category,
      coursesCount: _count ? (_count.courses || 0) + (_count.teacherCourses || 0) : 0,
    }))
    .sort((a, b) => (b.coursesCount || 0) - (a.coursesCount || 0));

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
    const trans =
      c.translations?.find((t) => t.locale === locale) ||
      c.translations?.[0];

    const categoryTrans =
      c.category?.translations?.find((t) => t.locale === locale) ||
      c.category?.translations?.[0];

    return {
      ...c,
      title: trans?.title || c.title || "",
      name: trans?.title || c.title || "",
      description: trans?.description || c.description || "",
      thumbnail: c.thumbnail || null,
      wallPaper: c.thumbnail || null,
      categoryName: categoryTrans?.name || "",
      instructorName: c.instructor?.fullName || "",
      instructorPhoto: c.instructor?.profilePhoto || null,
      provider: "PLATFORM",
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

  const offerBanners = (activeOffersRaw || []).map((o) => {
    const trans = o.translations?.find((t) => t.locale === locale) || o.translations?.[0];
    const courseTrans = o.course?.translations?.find((t) => t.locale === locale) || o.course?.translations?.[0];
    const discountText = o.discount ? `${Number(o.discount)}%` : "";
    return {
      id: o.id,
      title: trans?.name || (discountText ? (locale === "ar" ? `خصم حصري ${discountText}` : `Exclusive ${discountText} Off`) : (locale === "ar" ? "عرض حصري" : "Special Offer")),
      subtitle: trans?.offerDesc || courseTrans?.title || (locale === "ar" ? "عرض خاص لفترة محدودة على أفضل الكورسات" : "Limited time exclusive offer"),
      imageUrl: o.course?.thumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
      actionType: o.courseId ? "COURSE" : "DISCOUNT",
      targetId: o.courseId || null,
      buttonText: locale === "ar" ? "استفد من العرض" : "Claim Offer",
    };
  });



  const banners = offerBanners.length > 0 ? [...offerBanners, ...bannersRaw] : bannersRaw;

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
