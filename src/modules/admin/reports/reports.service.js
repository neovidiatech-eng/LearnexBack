import * as db from "../../../db/db.service.js";
import dayjs from "dayjs";
import {
  getCardsAnalytics,
  ValidEnrollmentStatus,
} from "../../../utils/helpers/generalStats.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
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

export const exportReportsToExcelService = async (
  query = {},
  locale = "en",
) => {
  const { cards, studentsGrowth, topCourses } = await getReportsService(
    query,
    locale,
  );
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LearnX LMS";
  const growthSheet = workbook.addWorksheet("Students Growth");
  growthSheet.columns = [
    { header: "Month", key: "month", width: 20 },
    { header: "Total Students", key: "total", width: 20 },
  ];
  studentsGrowth.forEach((item) => {
    growthSheet.addRow(item);
  });

  const courseSheet = workbook.addWorksheet("Top Courses");
  courseSheet.columns = [
    { header: "Course", key: "title", width: 30 },
    { header: "Students", key: "students", width: 15 },
    { header: "Category", key: "category", width: 20 },
    { header: "Instructor", key: "instructor", width: 20 },
    { header: "Revenue", key: "revenue", width: 18 },
    { header: "Rating", key: "avgRating", width: 15 },
    { header: "Progress", key: "progress", width: 15 },
  ];
  topCourses.forEach((course) => {
    courseSheet.addRow({
      title: course.title || "N/A",
      students: course.students,
      revenue: course.revenue,
      avgRating: course.avgRating,
      progress: course.progress,
    });
  });
  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 25 },
    { header: "Value", key: "value", width: 20 },
  ];
  summarySheet.addRows([
    { metric: "Total Students", value: cards.totalStudents.count },
    { metric: "Total Teachers", value: cards.totalTeachers.count },
    { metric: "Active Courses", value: cards.activeCourses.count },
    { metric: "Monthly Revenue", value: cards.monthlyRevenue.amount },
    { metric: "Active Sessions", value: cards.activeSessions.count },
  ]);
  [growthSheet, courseSheet, summarySheet].forEach((s) => {
    s.getRow(1).font = { bold: true };
  });

  return workbook;
};
export const exportReportsToPdfService = async (query = {}, locale = "en") => {
  const { cards, studentsGrowth, topCourses } = await getReportsService(
    query,
    locale,
  );

  const doc = new PDFDocument({ margin: 40, size: "A4" });

  const title = (text) => {
    doc.moveDown(1);
    doc.fillColor("#1e3a5f").font("Helvetica-Bold").fontSize(14).text(text);
    doc.moveDown(0.3);
  };

  doc
    .fillColor("#1e3a5f")
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("LearnX Reports", { align: "center" });
  doc
    .fillColor("#6b7280")
    .font("Helvetica")
    .fontSize(10)
    .text(`Generated: ${dayjs().format("DD MMM YYYY")}`, { align: "center" });

  title("Summary");
  doc.fillColor("#1f2937").font("Helvetica").fontSize(11);
  doc.text(`Total Students: ${cards.totalStudents.count}`);
  doc.text(`Total Teachers: ${cards.totalTeachers.count}`);
  doc.text(`Active Courses: ${cards.activeCourses.count}`);
  doc.text(`Monthly Revenue: $${cards.monthlyRevenue.amount}`);
  doc.text(`Active Sessions: ${cards.activeSessions.count}`);

  title("Students Growth");
  doc.fillColor("#1f2937").font("Helvetica").fontSize(11);
  studentsGrowth.forEach((row) => doc.text(`${row.month}: ${row.total}`));

  title("Top Selling Courses");
  doc.fillColor("#1f2937").font("Helvetica").fontSize(11);
  topCourses.forEach((c, i) => {
    doc.font("Helvetica-Bold").text(`${i + 1}. ${c.title || "N/A"}`);
    doc
      .font("Helvetica")
      .fillColor("#6b7280")
      .text(
        `${c.category?.name || "N/A"} | ${c.instructor?.fullName || "N/A"} | ${c.students} students | $${c.revenue} | ${c.progress}%`,
      );
    doc.fillColor("#1f2937").moveDown(0.5);
  });

  return doc;
};