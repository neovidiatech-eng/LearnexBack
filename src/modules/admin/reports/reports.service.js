import * as db from "../../../db/db.service.js";
import dayjs from "dayjs";
import {
  courseStatusEnum,
  enrollmentStatusEnum,
} from "../../../utils/Enums/index.js";
import { sessionStatus } from "../../../utils/Enums/session.enum.js";
import { getCardsAnalytics, ValidEnrollmentStatus } from "../../../utils/helpers/generalStats.js";


export const getReportsService = async (query = {}, locale = "en") => {
  const now = dayjs();
  //cards
  const [cards] = await Promise.all([
    getCardsAnalytics({now})
  ])
  
  //top 5 best sellers courses
  const top =await db.groupBy({
    model: "courseEnrollment",
    by: ["courseId"],
    where: {
      status: ValidEnrollmentStatus,
    },
    _count: { _all: true },
    _sum: { paidAmount: true },
    orderBy: { _count: { courseId: "desc" } },
    take: 5,
  });
  const courses=await db.findMany({
    model: "course",
    where: { id: { in: top.map((t) => t.courseId) } },
    select: {
      id: true,
      thumbnail: true,
      status: true,
      avgRating: true,
      createdAt: true,
      translations: {
        where: locale ? { locale } : undefined,
        select: { title: true },
      },
    },
  });
  const topCourses = top.map((t) => {
    const course = courses.find((c) => c.id === t.courseId)
    return {
      id: t.courseId,
      title: course?.translations?.[0]?.title ,
      thumbnail: course?.thumbnail || null,
      avgRating: Number(course?.avgRating || 0),
      salesCount: t._count._all,
      revenue: Number(t._sum.paidAmount || 0),
    };
  })
  return {cards,topCourses}
};
