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

  const teacherCourseInclude = {
    category: {
      select: {
        id: true,
        slug: true,
        translations: true,
      },
    },
    teacher: {
      select: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
          },
        },
      },
    },
  };

  const [
    categoriesRaw,
    featuredCoursesRaw,
    featuredTeacherCoursesRaw,
    topRatedCoursesRaw,
    topRatedTeacherCoursesRaw,
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
      model: "teacherCourse",
      where: { status: "APPROVED" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: teacherCourseInclude,
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
      model: "teacherCourse",
      where: { status: "APPROVED" },
      take: 8,
      orderBy: { avgRating: "desc" },
      include: teacherCourseInclude,
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
        teacherCourse: {
          select: {
            id: true,
            wallPaper: true,
            name: true,
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
      orderBy: { order: "asc" },
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
      ...(featuredCoursesRaw || []).map((c) => c.id),
      ...(topRatedCoursesRaw || []).map((c) => c.id),
    ])
  );

  const allTeacherCourseIds = Array.from(
    new Set([
      ...(featuredTeacherCoursesRaw || []).map((c) => c.id),
      ...(topRatedTeacherCoursesRaw || []).map((c) => c.id),
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

  let teacherEnrollmentMap = new Map();
  if (allTeacherCourseIds.length > 0) {
    const userTeacherEnrollments = await db.findMany({
      model: "teacherCourseEnrollment",
      where: {
        studentId: userId,
        courseId: { in: allTeacherCourseIds },
      },
      select: { courseId: true, progressPercent: true, status: true },
    });
    teacherEnrollmentMap = new Map(userTeacherEnrollments.map((e) => [e.courseId, e]));
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
      avgRating: Number(c.avgRating || 0),
      reviewsCount: c.reviewsCount || 0,
      isEnrolled: !!enrollment,
      progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
      enrollmentStatus: enrollment ? enrollment.status : null,
    };
  };

  const mapTeacherCourse = (c) => {
    const enrollment = teacherEnrollmentMap.get(c.id);
    const categoryTrans =
      c.category?.translations?.find((t) => t.locale === locale) ||
      c.category?.translations?.[0];

    return {
      ...c,
      title: c.name || "",
      name: c.name || "",
      description: c.description || "",
      thumbnail: c.wallPaper || null,
      wallPaper: c.wallPaper || null,
      categoryName: categoryTrans?.name || "",
      instructorName: c.teacher?.user?.fullName || "",
      instructorPhoto: c.teacher?.user?.profilePhoto || null,
      provider: "TEACHER",
      type: coursesType.TEACHER_COURSE,
      avgRating: Number(c.avgRating || 0),
      reviewsCount: c.reviewsCount || 0,
      isEnrolled: !!enrollment,
      progressPercent: enrollment ? Number(enrollment.progressPercent || 0) : 0,
      enrollmentStatus: enrollment ? enrollment.status : null,
    };
  };

  const featuredCourses = [
    ...(featuredCoursesRaw || []).map(mapCourse),
    ...(featuredTeacherCoursesRaw || []).map(mapTeacherCourse),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const topRatedCourses = [
    ...(topRatedCoursesRaw || []).map(mapCourse),
    ...(topRatedTeacherCoursesRaw || []).map(mapTeacherCourse),
  ]
    .sort((a, b) => {
      const diff = Number(b.avgRating || 0) - Number(a.avgRating || 0);
      if (diff !== 0) return diff;
      return Number(b.reviewsCount || 0) - Number(a.reviewsCount || 0);
    })
    .slice(0, 8);

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

    const isTeacherCourse = Boolean(o.teacherCourseId);
    const targetId = o.courseId || o.teacherCourseId || null;
    const actionType = targetId
      ? (isTeacherCourse ? "TEACHER_COURSE" : "COURSE")
      : "NONE";
    const courseType = isTeacherCourse ? "TEACHER_COURSE" : (o.courseId ? "COURSE" : null);

    const imageUrl =
      o.course?.thumbnail ||
      o.teacherCourse?.wallPaper ||
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop";

    const buttonText = targetId
      ? (locale === "ar" ? "استفد من العرض" : "Claim Offer")
      : null;

    return {
      id: o.id,
      title:
        trans?.name ||
        (discountText
          ? (locale === "ar" ? `خصم حصري ${discountText}` : `Exclusive ${discountText} Off`)
          : (locale === "ar" ? "عرض حصري" : "Special Offer")),
      subtitle:
        trans?.offerDesc ||
        courseTrans?.title ||
        o.teacherCourse?.name ||
        (locale === "ar" ? "عرض خاص لفترة محدودة على أفضل الكورسات" : "Limited time exclusive offer"),
      imageUrl,
      actionType,
      targetId,
      courseType,
      buttonText,
    };
  });

  const formattedBannersRaw = (bannersRaw || []).map((b) => {
    const trans = b.translations?.find((t) => t.locale === locale) || b.translations?.[0];
    const actType = (b.actionType || "NONE").toUpperCase();
    const hasNavigableTarget =
      actType !== "NONE" &&
      (Boolean(b.targetId) ||
        ["CATEGORIES", "CATEGORY", "INSTRUCTORS", "INSTRUCTOR", "COURSES"].includes(actType));

    return {
      id: b.id,
      title: trans?.title || "",
      subtitle: trans?.subtitle || "",
      imageUrl: b.imageUrl,
      actionType: b.actionType || "NONE",
      targetId: b.targetId || null,
      buttonText: hasNavigableTarget
        ? (trans?.buttonText || (locale === "ar" ? "المزيد" : "View Details"))
        : null,
      order: b.order,
    };
  });

  const banners = offerBanners.length > 0 ? [...offerBanners, ...formattedBannersRaw] : formattedBannersRaw;

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
