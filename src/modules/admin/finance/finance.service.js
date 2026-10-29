import * as db from "../../../db/db.service.js";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { calculateGrowthPercent } from "../../../utils/helpers/generalStats.js";
import { courseStatusEnum } from "../../../utils/Enums/courseStatus.enum.js";
import { coursesType } from "../../../utils/Enums/teacherCourse.enum.js";

const MONTH_NAMES = [
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

const MONTH_NAMES_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const getStatusBadge = (status, type) => {
  const normStatus = (status || "").toUpperCase();
  const normType = (type || "").toUpperCase();

  if (normType === "REFUND" || normStatus === "REFUNDED") {
    return { status: "REFUNDED", label: "مسترد", color: "pink" };
  }
  if (normStatus === "COMPLETED" || normStatus === "APPROVED" || normStatus === "PAID") {
    return { status: "COMPLETED", label: "مدفوع", color: "green" };
  }
  if (normStatus === "PENDING") {
    return { status: "PENDING", label: "قيد الانتظار", color: "orange" };
  }
  if (normStatus === "FAILED" || normStatus === "REJECTED") {
    return { status: "FAILED", label: "فاشل", color: "red" };
  }
  return { status: normStatus || "UNKNOWN", label: normStatus, color: "gray" };
};

const extractCourseTitleFromReason = (reason, locale = "ar") => {
  if (!reason || typeof reason !== "object") return "دورة تعليمية";
  if (reason.courseTitle) return reason.courseTitle;
  if (Array.isArray(reason.items) && reason.items.length > 0) {
    const titles = reason.items
      .map((item) => item.courseTitle || item.title)
      .filter(Boolean);
    if (titles.length > 0) return titles.join(", ");
  }
  if (reason.planTitle) return reason.planTitle;
  if (reason.action === "BOOK_PLAN") return "اشتراك خطة دروس";
  return "دورة تعليمية";
};

/**
 * Format transaction record for table display matching admin dashboard UI
 */
const formatTransactionItem = (txn, index = 0) => {
  const badge = getStatusBadge(txn.status, txn.type);
  const courseTitle = extractCourseTitleFromReason(txn.reason);
  const shortId = txn.id ? txn.id.slice(0, 8) : `${index + 1}`;

  return {
    id: txn.id,
    transactionNumber: `TXN - ${index + 1}`,
    referenceCode: `TXN-${shortId.toUpperCase()}`,
    student: {
      id: txn.user?.id || txn.userId,
      name: txn.user?.fullName || "طالب",
      email: txn.user?.email || "",
      profilePhoto: txn.user?.profilePhoto || null,
    },
    course: {
      title: courseTitle,
      id: txn.reason?.courseId || txn.reason?.items?.[0]?.courseId || null,
    },
    amount: Number(txn.amount || 0),
    currency: "USD",
    date: dayjs(txn.createdAt).format("YYYY-MM-DD"),
    createdAt: txn.createdAt,
    paymentMethod: txn.paymentMethod || "CARD",
    status: badge.status,
    statusLabel: badge.label,
    badgeColor: badge.color,
    reason: txn.reason || {},
  };
};

/**
 * GET /api/v1/admin/finance/overview (or /dashboard)
 * Returns the 4 metric cards, revenue breakdown by top courses,
 * 12-month revenue trend, and recent transactions.
 */
export const getFinanceOverviewService = async (query = {}, locale = "ar") => {
  const now = dayjs();
  const selectedYear = query.year ? Number(query.year) : now.year();
  const startOfYear = dayjs().year(selectedYear).startOf("year").toDate();
  const endOfYear = dayjs()
    .year(selectedYear + 1)
    .startOf("year")
    .toDate();

  const startOfCurrentMonth = now.startOf("month").toDate();
  const startOfNextMonth = now.add(1, "month").startOf("month").toDate();
  const startOfLastMonth = now.subtract(1, "month").startOf("month").toDate();
  const endOfLastMonth = startOfCurrentMonth;

  const thisMonthRange = { gte: startOfCurrentMonth, lt: startOfNextMonth };
  const lastMonthRange = { gte: startOfLastMonth, lt: endOfLastMonth };

  const [
    // All completed payment transactions
    allCompletedTxns,
    thisMonthCompletedTxns,
    lastMonthCompletedTxns,

    // Pending transactions
    allPendingTxns,
    thisMonthPendingTxns,
    lastMonthPendingTxns,

    // Refunded transactions
    allRefundTxns,
    thisMonthRefundTxns,
    lastMonthRefundTxns,

    // Yearly transactions for trend
    yearlyTxns,
    yearlyEnrollments,

    // Top Platform Courses
    topPlatformCourses,
    // Top Teacher Courses
    topTeacherCourses,

    // Recent Transactions
    recentTransactionsRaw,
  ] = await Promise.all([
    // All completed
    db.findMany({
      model: "transaction",
      where: {
        status: { in: ["COMPLETED", "APPROVED"] },
        type: "PAYMENT",
      },
      select: { amount: true, createdAt: true },
    }),
    db.findMany({
      model: "transaction",
      where: {
        status: { in: ["COMPLETED", "APPROVED"] },
        type: "PAYMENT",
        createdAt: thisMonthRange,
      },
      select: { amount: true },
    }),
    db.findMany({
      model: "transaction",
      where: {
        status: { in: ["COMPLETED", "APPROVED"] },
        type: "PAYMENT",
        createdAt: lastMonthRange,
      },
      select: { amount: true },
    }),

    // Pending
    db.findMany({
      model: "transaction",
      where: { status: "PENDING" },
      select: { amount: true },
    }),
    db.findMany({
      model: "transaction",
      where: { status: "PENDING", createdAt: thisMonthRange },
      select: { amount: true },
    }),
    db.findMany({
      model: "transaction",
      where: { status: "PENDING", createdAt: lastMonthRange },
      select: { amount: true },
    }),

    // Refunds
    db.findMany({
      model: "transaction",
      where: {
        OR: [{ type: "REFUND" }, { status: "REFUNDED" }],
      },
      select: { amount: true },
    }),
    db.findMany({
      model: "transaction",
      where: {
        OR: [{ type: "REFUND" }, { status: "REFUNDED" }],
        createdAt: thisMonthRange,
      },
      select: { amount: true },
    }),
    db.findMany({
      model: "transaction",
      where: {
        OR: [{ type: "REFUND" }, { status: "REFUNDED" }],
        createdAt: lastMonthRange,
      },
      select: { amount: true },
    }),

    // Yearly transactions
    db.findMany({
      model: "transaction",
      where: {
        createdAt: { gte: startOfYear, lt: endOfYear },
        status: { in: ["COMPLETED", "APPROVED"] },
      },
      select: { amount: true, createdAt: true },
    }),

    // Yearly enrollments
    db.findMany({
      model: "courseEnrollment",
      where: {
        enrolledAt: { gte: startOfYear, lt: endOfYear },
      },
      select: { enrolledAt: true, paidAmount: true },
    }),

    // Top Platform Courses
    db.findMany({
      model: "course",
      where: { status: courseStatusEnum.PUBLISHED },
      orderBy: { totalRevenue: "desc" },
      take: 5,
      include: {
        translations: {
          where: locale ? { locale } : undefined,
          select: { title: true },
        },
      },
    }),

    // Top Teacher Courses
    db.findMany({
      model: "teacherCourse",
      where: { status: "APPROVED" },
      orderBy: { totalRevenue: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        totalRevenue: true,
        totalStudentsCount: true,
        wallPaper: true,
      },
    }),

    // Recent 10 Transactions
    db.findMany({
      model: "transaction",
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    }),
  ]);

  // ─── 1. Calculate Metric Cards ──────────────────────────────────────────────
  const sumAmount = (list) =>
    list.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalRevenue = sumAmount(allCompletedTxns);
  const thisMonthRevenue = sumAmount(thisMonthCompletedTxns);
  const lastMonthRevenue = sumAmount(lastMonthCompletedTxns);
  const revenueGrowthPercent = calculateGrowthPercent(
    thisMonthRevenue,
    lastMonthRevenue
  );

  const totalPending = sumAmount(allPendingTxns);
  const thisMonthPending = sumAmount(thisMonthPendingTxns);
  const lastMonthPending = sumAmount(lastMonthPendingTxns);
  const pendingGrowthPercent = calculateGrowthPercent(
    thisMonthPending,
    lastMonthPending
  );

  const totalRefunds = sumAmount(allRefundTxns);
  const thisMonthRefunds = sumAmount(thisMonthRefundTxns);
  const lastMonthRefunds = sumAmount(lastMonthRefundTxns);
  const refundsGrowthPercent = calculateGrowthPercent(
    thisMonthRefunds,
    lastMonthRefunds
  );

  const cards = {
    totalRevenue: {
      title: locale === "ar" ? "إجمالي الإيرادات" : "Total Revenue",
      value: totalRevenue,
      changePercent: Math.abs(revenueGrowthPercent),
      isPositive: revenueGrowthPercent >= 0,
      trendText:
        revenueGrowthPercent >= 0
          ? `+${revenueGrowthPercent}%`
          : `${revenueGrowthPercent}%`,
      subtitle: locale === "ar" ? "مقارنة بالشهر الماضي" : "Compared to last month",
    },
    thisMonth: {
      title: locale === "ar" ? "هذا الشهر" : "This Month",
      value: thisMonthRevenue,
      changePercent: Math.abs(revenueGrowthPercent),
      isPositive: revenueGrowthPercent >= 0,
      trendText:
        revenueGrowthPercent >= 0
          ? `+${revenueGrowthPercent}%`
          : `${revenueGrowthPercent}%`,
      subtitle: locale === "ar" ? "مقارنة بالشهر الماضي" : "Compared to last month",
    },
    pending: {
      title: locale === "ar" ? "معلق" : "Pending",
      value: totalPending,
      changePercent: Math.abs(pendingGrowthPercent),
      isPositive: pendingGrowthPercent <= 0, // In pending/debt, negative or zero can be considered healthy
      trendText:
        pendingGrowthPercent >= 0
          ? `+${pendingGrowthPercent}%`
          : `${pendingGrowthPercent}%`,
      subtitle: locale === "ar" ? "مقارنة بالشهر الماضي" : "Compared to last month",
    },
    refunds: {
      title: locale === "ar" ? "المستردات" : "Refunds",
      value: totalRefunds,
      changePercent: Math.abs(refundsGrowthPercent),
      isPositive: refundsGrowthPercent <= 0,
      trendText:
        refundsGrowthPercent >= 0
          ? `+${refundsGrowthPercent}%`
          : `${refundsGrowthPercent}%`,
      subtitle: locale === "ar" ? "مقارنة بالشهر الماضي" : "Compared to last month",
    },
  };

  // ─── 2. Revenue Breakdown (تفصيل الإيرادات) ──────────────────────────────────
  const normalizedPlatformCourses = topPlatformCourses.map((c) => ({
    id: c.id,
    title: c.translations?.[0]?.title || "دورة المنصة",
    revenue: Number(c.totalRevenue || 0),
    studentsCount: c.totalStudentsCount || 0,
    thumbnail: c.thumbnail || null,
    provider: c.provider || "PLATFORM",
    type: coursesType.COURSE,
  }));

  const normalizedTeacherCourses = topTeacherCourses.map((c) => ({
    id: c.id,
    title: c.name || "دورة المعلم",
    revenue: Number(c.totalRevenue || 0),
    studentsCount: c.totalStudentsCount || 0,
    thumbnail: c.wallPaper || null,
    provider: "TEACHER",
    type: coursesType.TEACHER_COURSE,
  }));

  const allTopCourses = [...normalizedPlatformCourses, ...normalizedTeacherCourses]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const maxRevenue = Math.max(1, ...allTopCourses.map((c) => c.revenue));

  const revenueBreakdown = allTopCourses.map((course) => {
    const progressPercent = Math.min(
      100,
      Math.round((course.revenue / maxRevenue) * 100)
    );
    return {
      id: course.id,
      title: course.title,
      revenue: course.revenue,
      studentsCount: course.studentsCount,
      percentage: progressPercent,
      thumbnail: course.thumbnail,
      provider: course.provider,
      type: course.type,
    };
  });

  // ─── 3. Revenue Trend (اتجاه الإيرادات over the year) ────────────────────────
  const revenueTrend = MONTH_NAMES.map((monthKey, index) => {
    const monthTxns = yearlyTxns.filter(
      (t) => dayjs(t.createdAt).month() === index
    );
    const monthEnrollments = yearlyEnrollments.filter(
      (e) => dayjs(e.enrolledAt).month() === index
    );

    const monthRevenue = monthTxns.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    const studentsCount = Math.max(
      monthTxns.length,
      monthEnrollments.length
    );

    return {
      month: monthKey,
      monthName: locale === "ar" ? MONTH_NAMES_AR[index] : monthKey,
      revenue: Math.round(monthRevenue * 100) / 100,
      studentsCount,
    };
  });

  // ─── 4. Recent Transactions (أحدث المعاملات) ────────────────────────────────
  const recentTransactions = recentTransactionsRaw.map((txn, index) =>
    formatTransactionItem(txn, index)
  );

  return {
    year: selectedYear,
    cards,
    revenueBreakdown,
    revenueTrend,
    recentTransactions,
  };
};

/**
 * GET /api/v1/admin/finance/transactions
 * Returns paginated, searchable, and filterable transactions list
 */
export const getTransactionsService = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "ALL",
  paymentMethod = "ALL",
  startDate,
  endDate,
  locale = "ar",
}) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));

  const where = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (paymentMethod && paymentMethod !== "ALL") {
    where.paymentMethod = paymentMethod;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { id: { contains: term, mode: "insensitive" } },
      { paymentMethod: { contains: term, mode: "insensitive" } },
      {
        user: {
          OR: [
            { fullName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const { items, pagination } = await db.findManyWithPaginationAndCount({
    model: "transaction",
    where,
    page: pageNum,
    limit: limitNum,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  const formattedTransactions = items.map((txn, index) =>
    formatTransactionItem(txn, (pageNum - 1) * limitNum + index)
  );

  return {
    transactions: formattedTransactions,
    pagination,
  };
};

/**
 * GET /api/v1/admin/finance/transactions/:id
 * Single transaction details
 */
export const getTransactionByIdService = async (transactionId, locale = "ar") => {
  const txn = await db.findOne({
    model: "transaction",
    where: { id: transactionId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profilePhoto: true,
        },
      },
    },
  });

  if (!txn) {
    const error = new Error("TRANSACTION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return formatTransactionItem(txn);
};

/**
 * GET /api/v1/admin/finance/export
 * Exports transactions to an Excel spreadsheet
 */
export const exportTransactionsExcelService = async ({
  search = "",
  status = "ALL",
  paymentMethod = "ALL",
  startDate,
  endDate,
  locale = "ar",
}) => {
  const where = {};
  if (status && status !== "ALL") where.status = status;
  if (paymentMethod && paymentMethod !== "ALL") where.paymentMethod = paymentMethod;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { id: { contains: term, mode: "insensitive" } },
      { paymentMethod: { contains: term, mode: "insensitive" } },
      {
        user: {
          OR: [
            { fullName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const transactions = await db.findMany({
    model: "transaction",
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LearnX LMS";
  const sheet = workbook.addWorksheet(
    locale === "ar" ? "المعاملات المالية" : "Transactions"
  );

  sheet.columns = [
    { header: locale === "ar" ? "رقم المعاملة" : "Transaction No", key: "txnNo", width: 16 },
    { header: locale === "ar" ? "معرّف المعاملة" : "Transaction ID", key: "id", width: 38 },
    { header: locale === "ar" ? "اسم الطالب" : "Student Name", key: "studentName", width: 25 },
    { header: locale === "ar" ? "البريد الإلكتروني" : "Email", key: "studentEmail", width: 30 },
    { header: locale === "ar" ? "اسم الدورة" : "Course / Item", key: "course", width: 35 },
    { header: locale === "ar" ? "المبلغ" : "Amount", key: "amount", width: 15 },
    { header: locale === "ar" ? "طريقة الدفع" : "Payment Method", key: "paymentMethod", width: 18 },
    { header: locale === "ar" ? "الحالة" : "Status", key: "status", width: 18 },
    { header: locale === "ar" ? "التاريخ" : "Date", key: "date", width: 18 },
  ];

  // Header styling
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F58220" }, // LearnX orange brand color
  };

  transactions.forEach((txn, i) => {
    const formatted = formatTransactionItem(txn, i);
    sheet.addRow({
      txnNo: formatted.transactionNumber,
      id: txn.id,
      studentName: formatted.student.name,
      studentEmail: formatted.student.email,
      course: formatted.course.title,
      amount: `$${formatted.amount}`,
      paymentMethod: formatted.paymentMethod,
      status: formatted.statusLabel,
      date: formatted.date,
    });
  });

  return workbook;
};

