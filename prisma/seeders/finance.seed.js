import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

export async function seedFinance(
  prisma,
  students = [],
  teachers = [],
  courses = [],
  teacherCourses = []
) {
  console.log("🌱 Seeding finance data (wallets, transactions, revenue)...");

  const now = dayjs();
  const currentYear = now.year();

  // ─── 1. Ensure Commission in AppSetting ─────────────────────────────────────
  let appSetting = await prisma.appSetting.findFirst();
  if (!appSetting) {
    appSetting = await prisma.appSetting.create({
      data: {
        appVersion: "1.0.0",
        commissionType: "PERCENTAGE",
        commissionValue: 15,
      },
    });
  } else {
    appSetting = await prisma.appSetting.update({
      where: { id: appSetting.id },
      data: {
        commissionType: "PERCENTAGE",
        commissionValue: 15,
      },
    });
  }

  // ─── 2. Ensure System Wallet ──────────────────────────────────────────────
  await prisma.wallet.upsert({
    where: { id: "system-platform-wallet-main" },
    update: {
      type: "SYSTEM",
      balance: 48950.0,
    },
    create: {
      id: "system-platform-wallet-main",
      type: "SYSTEM",
      balance: 48950.0,
    },
  });

  // ─── 3. Ensure Teacher Wallets ─────────────────────────────────────────────
  let allTeachers = teachers;
  if (!allTeachers || allTeachers.length === 0) {
    allTeachers = await prisma.user.findMany({
      where: {
        OR: [{ role: { slug: "TEACHER" } }, { teacher: { isNot: null } }],
      },
      select: { id: true, fullName: true },
    });
  }

  const teacherBalances = [14250.0, 18600.0, 9800.0, 22400.0, 11500.0];
  for (let i = 0; i < allTeachers.length; i++) {
    const t = allTeachers[i];
    const balance = teacherBalances[i % teacherBalances.length];

    await prisma.wallet.upsert({
      where: { userId: t.id },
      update: { balance, type: "TEACHER" },
      create: {
        userId: t.id,
        type: "TEACHER",
        balance,
      },
    });
  }

  // ─── 4. Find or Create Students (including "Muneeb") ───────────────────────
  let allStudents = students;
  if (!allStudents || allStudents.length === 0) {
    allStudents = await prisma.user.findMany({
      where: {
        OR: [{ role: { slug: "STUDENT" } }, { student: { isNot: null } }],
      },
      select: { id: true, fullName: true, email: true },
    });
  }

  // Ensure Muneeb from the screenshot exists
  let muneebUser = allStudents.find(
    (s) => s.fullName?.toLowerCase().includes("muneeb")
  );
  if (!muneebUser) {
    muneebUser = await prisma.user.findFirst({
      where: { email: "muneeb@learnex.com" },
    });
  }
  if (!muneebUser) {
    const studentRole = await prisma.role.findFirst({
      where: { slug: "STUDENT" },
    });
    muneebUser = await prisma.user.create({
      data: {
        fullName: "Muneeb",
        email: "muneeb@learnex.com",
        phone: "+201099887766",
        country: "EG",
        status: "ACTIVE",
        confirmEmail: true,
        roleId: studentRole?.id || null,
        student: {
          create: {
            dateOfBirth: new Date("1998-08-12"),
            notes: "Active learner in full-stack web development.",
          },
        },
      },
    });
    allStudents.push(muneebUser);
  }

  // ─── 5. Update Top Courses Revenue (matching screenshot numbers) ────────────
  const showcaseCourses = [
    {
      titleEn: "Complete Web Development 2024",
      titleAr: "تطوير الويب الشامل 2024",
      revenue: 87861.0,
      studentsCount: 380,
    },
    {
      titleEn: "Machine Learning with Python",
      titleAr: "تعلم الآلة باستخدام بايثون",
      revenue: 62489.0,
      studentsCount: 310,
    },
    {
      titleEn: "Python for Data Science",
      titleAr: "بايثون لعلوم البيانات",
      revenue: 55363.0,
      studentsCount: 290,
    },
    {
      titleEn: "Business Strategy Fundamentals",
      titleAr: "أساسيات استراتيجيات الأعمال",
      revenue: 36101.0,
      studentsCount: 180,
    },
    {
      titleEn: "UI/UX Design Masterclass",
      titleAr: "دورة احتراف تصميم واجهات المستخدم",
      revenue: 32832.0,
      studentsCount: 160,
    },
  ];

  let dbCourses = await prisma.course.findMany({
    include: { translations: true },
    take: 10,
  });

  for (let i = 0; i < Math.min(dbCourses.length, showcaseCourses.length); i++) {
    const course = dbCourses[i];
    const showcase = showcaseCourses[i];

    await prisma.course.update({
      where: { id: course.id },
      data: {
        totalRevenue: showcase.revenue,
        totalStudentsCount: showcase.studentsCount,
      },
    });

    // Update English translation title if exists
    const enTrans = course.translations.find((t) => t.locale === "en");
    if (enTrans) {
      await prisma.courseTranslation.update({
        where: { id: enTrans.id },
        data: { title: showcase.titleEn },
      });
    }
  }

  // ─── 6. Seed Realistic Transactions Across All 12 Months ─────────────────────
  console.log("🌱 Creating financial transaction records across the year...");

  const paymentMethods = ["VISA", "Stripe", "Paypal", "CARD", "Mastercard"];
  const courseNames = [
    "Complete Web Development 2024",
    "Python for Data Science",
    "Business Strategy Fundamentals",
    "UI/UX Design Masterclass",
    "Machine Learning with Python",
  ];

  // Specific template for transactions to match the screenshot table
  const transactionTemplates = [
    // Month 10 (October - Current month recent)
    {
      studentIndex: 0,
      amount: 233,
      method: "VISA",
      status: "COMPLETED",
      course: "Complete Web Development 2024",
      month: 9, // Oct
      day: 28,
    },
    {
      studentIndex: 0,
      amount: 233,
      method: "Stripe",
      status: "COMPLETED",
      course: "Complete Web Development 2024",
      month: 9,
      day: 25,
    },
    {
      studentIndex: 0,
      amount: 233,
      method: "Paypal",
      status: "COMPLETED",
      course: "Complete Web Development 2024",
      month: 9,
      day: 21,
    },
    {
      studentIndex: 0,
      amount: 233,
      method: "VISA",
      status: "PENDING",
      course: "Complete Web Development 2024",
      month: 9,
      day: 18,
    },
    {
      studentIndex: 0,
      amount: 233,
      method: "Stripe",
      status: "FAILED",
      course: "Complete Web Development 2024",
      month: 9,
      day: 14,
    },
    {
      studentIndex: 0,
      amount: 233,
      method: "Paypal",
      status: "REFUNDED",
      type: "REFUND",
      course: "Complete Web Development 2024",
      month: 9,
      day: 10,
    },

    // September (Month 8) - Last month comparison
    {
      studentIndex: 1,
      amount: 199.99,
      method: "CARD",
      status: "COMPLETED",
      course: "Python for Data Science",
      month: 8,
      day: 22,
    },
    {
      studentIndex: 2,
      amount: 149.99,
      method: "VISA",
      status: "COMPLETED",
      course: "UI/UX Design Masterclass",
      month: 8,
      day: 15,
    },
    {
      studentIndex: 3,
      amount: 299.99,
      method: "Stripe",
      status: "COMPLETED",
      course: "Machine Learning with Python",
      month: 8,
      day: 8,
    },
    {
      studentIndex: 4,
      amount: 180.0,
      method: "Paypal",
      status: "PENDING",
      course: "Business Strategy Fundamentals",
      month: 8,
      day: 5,
    },

    // August (Month 7)
    {
      studentIndex: 1,
      amount: 249.99,
      method: "VISA",
      status: "COMPLETED",
      course: "Complete Web Development 2024",
      month: 7,
      day: 20,
    },
    {
      studentIndex: 2,
      amount: 199.99,
      method: "Stripe",
      status: "COMPLETED",
      course: "Python for Data Science",
      month: 7,
      day: 12,
    },

    // July (Month 6 - Peak)
    {
      studentIndex: 3,
      amount: 320.0,
      method: "CARD",
      status: "COMPLETED",
      course: "Machine Learning with Python",
      month: 6,
      day: 27,
    },
    {
      studentIndex: 0,
      amount: 210.0,
      method: "VISA",
      status: "COMPLETED",
      course: "UI/UX Design Masterclass",
      month: 6,
      day: 18,
    },
    {
      studentIndex: 4,
      amount: 280.0,
      method: "Stripe",
      status: "COMPLETED",
      course: "Complete Web Development 2024",
      month: 6,
      day: 5,
    },

    // June (Month 5)
    {
      studentIndex: 1,
      amount: 175.0,
      method: "Paypal",
      status: "COMPLETED",
      course: "Business Strategy Fundamentals",
      month: 5,
      day: 22,
    },
    {
      studentIndex: 2,
      amount: 220.0,
      method: "VISA",
      status: "COMPLETED",
      course: "Python for Data Science",
      month: 5,
      day: 9,
    },

    // May (Month 4)
    {
      studentIndex: 0,
      amount: 290.0,
      method: "Stripe",
      status: "COMPLETED",
      course: "Machine Learning with Python",
      month: 4,
      day: 19,
    },
    {
      studentIndex: 3,
      amount: 150.0,
      method: "CARD",
      status: "COMPLETED",
      course: "UI/UX Design Masterclass",
      month: 4,
      day: 7,
    },

    // April (Month 3 - Peak)
    {
      studentIndex: 4,
      amount: 350.0,
      method: "VISA",
      status: "COMPLETED",
      course: "Complete Web Development 2024",
      month: 3,
      day: 25,
    },
    {
      studentIndex: 1,
      amount: 280.0,
      method: "Stripe",
      status: "COMPLETED",
      course: "Machine Learning with Python",
      month: 3,
      day: 14,
    },
    {
      studentIndex: 2,
      amount: 190.0,
      method: "Paypal",
      status: "COMPLETED",
      course: "Business Strategy Fundamentals",
      month: 3,
      day: 3,
    },

    // March (Month 2)
    {
      studentIndex: 0,
      amount: 240.0,
      method: "VISA",
      status: "COMPLETED",
      course: "Python for Data Science",
      month: 2,
      day: 21,
    },
    {
      studentIndex: 3,
      amount: 160.0,
      method: "CARD",
      status: "COMPLETED",
      course: "UI/UX Design Masterclass",
      month: 2,
      day: 11,
    },

    // February (Month 1 - Peak)
    {
      studentIndex: 1,
      amount: 310.0,
      method: "Stripe",
      status: "COMPLETED",
      course: "Complete Web Development 2024",
      month: 1,
      day: 26,
    },
    {
      studentIndex: 4,
      amount: 275.0,
      method: "VISA",
      status: "COMPLETED",
      course: "Machine Learning with Python",
      month: 1,
      day: 15,
    },
    {
      studentIndex: 2,
      amount: 145.0,
      method: "Paypal",
      status: "COMPLETED",
      course: "Business Strategy Fundamentals",
      month: 1,
      day: 4,
    },

    // January (Month 0)
    {
      studentIndex: 0,
      amount: 220.0,
      method: "CARD",
      status: "COMPLETED",
      course: "UI/UX Design Masterclass",
      month: 0,
      day: 23,
    },
    {
      studentIndex: 3,
      amount: 180.0,
      method: "VISA",
      status: "COMPLETED",
      course: "Python for Data Science",
      month: 0,
      day: 12,
    },

    // Additional Pending and Refunds for realistic metrics
    {
      studentIndex: 1,
      amount: 250.0,
      method: "VISA",
      status: "PENDING",
      course: "Machine Learning with Python",
      month: 9,
      day: 27,
    },
    {
      studentIndex: 2,
      amount: 175.0,
      method: "Stripe",
      status: "REFUNDED",
      type: "REFUND",
      course: "Business Strategy Fundamentals",
      month: 9,
      day: 26,
    },
  ];

  let createdCount = 0;
  for (const item of transactionTemplates) {
    const student =
      item.studentIndex === 0 && muneebUser
        ? muneebUser
        : allStudents[item.studentIndex % allStudents.length] || muneebUser;

    const date = dayjs()
      .year(currentYear)
      .month(item.month)
      .date(item.day)
      .hour(14)
      .minute(30)
      .toDate();

    const commissionRate = 15;
    const platformCommission = Math.round(item.amount * 0.15 * 100) / 100;
    const teacherEarnings = Math.round((item.amount - platformCommission) * 100) / 100;

    await prisma.transaction.create({
      data: {
        userId: student.id,
        amount: item.amount,
        type: item.type || "PAYMENT",
        status: item.status,
        paymentMethod: item.method,
        createdAt: date,
        updatedAt: date,
        reason: {
          action: "COURSE_BUY",
          courseTitle: item.course,
          totalAmount: item.amount,
          commissionType: "PERCENTAGE",
          commissionValue: commissionRate,
          platformCommission,
          teacherEarnings,
          items: [
            {
              courseTitle: item.course,
              price: item.amount,
              platformCommission,
              teacherEarnings,
            },
          ],
        },
      },
    });
    createdCount++;
  }

  console.log(`✅ Seeded ${createdCount} financial transactions!`);
  console.log(`✅ System Wallet balance: $48,950`);
  console.log(`✅ Top courses revenue updated.`);
  console.log("✅ Finance seeding complete!");
}

async function standalone() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const students = await prisma.user.findMany({
      where: {
        OR: [{ role: { slug: "STUDENT" } }, { student: { isNot: null } }],
      },
      select: { id: true, fullName: true, email: true },
    });

    const teachers = await prisma.user.findMany({
      where: {
        OR: [{ role: { slug: "TEACHER" } }, { teacher: { isNot: null } }],
      },
      select: { id: true, fullName: true },
    });

    const courses = await prisma.course.findMany({
      include: { translations: true },
    });

    const teacherCourses = await prisma.teacherCourse.findMany();

    await seedFinance(prisma, students, teachers, courses, teacherCourses);
  } catch (error) {
    console.error("❌ Finance seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("finance.seed.js")) {
  standalone();
}

