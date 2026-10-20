import * as db from "../../../db/db.service.js";
import dayjs from "dayjs";
import {
  getCardsAnalytics,
  ValidEnrollmentStatus,
} from "../../../utils/helpers/generalStats.js";

const MONTHS = [
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

export const getReportsService = async (query = {}, locale = "en") => {
  const now = dayjs();
  const year = query.year ? Number(query.year) : now.year();
  const startOfYear = dayjs().year(year).startOf("year").toDate();
  const endOfYear = dayjs()
    .year(year + 1)
    .startOf("year")
    .toDate();

  const [cards, enrollments, top] = await Promise.all([
    getCardsAnalytics({ now }),
    db.findMany({
      model: "courseEnrollment",
      where: {
        enrolledAt: { gte: startOfYear, lt: endOfYear },
        status: ValidEnrollmentStatus,
      },
      select: { enrolledAt: true },
    }),

    db.groupBy({
      model: "courseEnrollment",
      by: ["courseId"],
      where: { status: ValidEnrollmentStatus },
      _count: { _all: true },
      _sum: { paidAmount: true },
      _avg: { progressPercent: true },
      orderBy: { _count: { courseId: "desc" } },
      take: 5,
    }),
  ]);

  //best rather than db.count()
  let total = 0;
  const studentsGrowth = MONTHS.map((month, i) => {
    const count = enrollments.filter(
      (enrollment) => dayjs(enrollment.enrolledAt).month() === i,
    ).length;
    total += count;
    return { month, total };
  });

  const courses = await db.findMany({
    model: "course",
    where: { id: { in: top.map((t) => t.courseId) } },
    select: {
      id: true,
      thumbnail: true,
      avgRating: true,
      instructor: {
        select: { id: true, fullName: true, profilePhoto: true },
      },
      category: {
        select: {
          id: true,
          slug: true,
          translations: {
            where: locale ? { locale } : undefined,
            select: { locale: true, name: true },
          },
        },
      },
      translations: {
        where: locale ? { locale } : undefined,
        select: { title: true },
      },
    },
  });

  const topCourses = top.map((t) => {
    const course = courses.find((c) => c.id === t.courseId);
     const categoryTranslation = course?.category?.translations?.[0];
    return {
      id: t.courseId,
      title: course?.translations?.[0]?.title,
      category: course?.category
        ? {
            id: course.category.id,
            slug: course.category.slug,
            name: categoryTranslation?.name || course.category.slug,
          }
        : null,
      instructor: course?.instructor || null,
      avgRating: Number(course?.avgRating || 0),
      students: t._count._all,
      revenue: Number(t._sum.paidAmount || 0),
      progress: Math.round(Number(t._avg.progressPercent || 0)),
    };
  });

  return { cards, studentsGrowth, topCourses };
};


export const exportReportsToExcelService=async()=>{}