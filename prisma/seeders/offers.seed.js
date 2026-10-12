import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
import dayjs from "dayjs";

export async function seedOffers(
  prisma,
  students = [],
  teachers = [],
  courses = [],
  teacherCourses = []
) {
  console.log("🌱 Seeding promotional offers and discounts...");

  // 1. Fetch Students from DB if not supplied
  let studentList = students;
  if (!studentList || studentList.length === 0) {
    studentList = await prisma.student.findMany({
      take: 5,
    });
  } else {
    // If user passed user objects with include: { student: true }
    studentList = studentList.map((s) => (s.student ? s.student : s));
  }

  // 2. Fetch Teachers from DB if not supplied
  let teacherList = teachers;
  if (!teacherList || teacherList.length === 0) {
    teacherList = await prisma.teacher.findMany({
      take: 5,
    });
  } else {
    teacherList = teacherList.map((t) => (t.teacher ? t.teacher : t));
  }

  // 3. Fetch Courses from DB if not supplied
  let courseList = courses;
  if (!courseList || courseList.length === 0) {
    courseList = await prisma.course.findMany({
      take: 5,
    });
  }

  // 4. Fetch Teacher Courses from DB if not supplied
  let teacherCourseList = teacherCourses;
  if (!teacherCourseList || teacherCourseList.length === 0) {
    teacherCourseList = await prisma.teacherCourse.findMany({
      take: 5,
    });
  }

  const now = dayjs();

  const offersData = [
    // 1. Sitewide Global Launch Sale - ALL_USERS (Active)
    {
      target: "ALL_USERS",
      targetIds: [],
      offerType: "PERCENTAGE",
      discount: 20,
      startDate: now.subtract(5, "day").toDate(),
      endDate: now.add(25, "day").toDate(),
      status: "ACTIVE",
      courseId: null,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "Global Platform Launch Sale",
          offerDesc: "Celebrate our platform launch with a sitewide 20% discount on all learning materials.",
        },
        {
          locale: "ar",
          name: "خصم انطلاق المنصة الشامل",
          offerDesc: "احتفل بانطلاق المنصة بخصم شامل 20% على جميع المسارات التعليمية لكل المستخدمين.",
        },
      ],
    },

    // 2. Semester Boost - ALL_STUDENTS (Active)
    {
      target: "ALL_STUDENTS",
      targetIds: [],
      offerType: "PERCENTAGE",
      discount: 25,
      startDate: now.subtract(3, "day").toDate(),
      endDate: now.add(20, "day").toDate(),
      status: "ACTIVE",
      courseId: null,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "Students Semester Boost",
          offerDesc: "Special 25% discount dedicated to all enrolled students for the new semester.",
        },
        {
          locale: "ar",
          name: "خصم بداية الفصل الدراسي للطلاب",
          offerDesc: "خصم خاص 25% لجميع الطلاب المسجلين بمناسبة بدء الفصل الدراسي الجديد.",
        },
      ],
    },

    // 3. Educators Professional Grant - ALL_TEACHERS (Active)
    {
      target: "ALL_TEACHERS",
      targetIds: [],
      offerType: "FIXED_AMOUNT",
      discount: 40.0,
      startDate: now.subtract(2, "day").toDate(),
      endDate: now.add(30, "day").toDate(),
      status: "ACTIVE",
      courseId: null,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "Educators Professional Grant",
          offerDesc: "$40 flat credit for all registered instructors to upgrade their teaching toolkit.",
        },
        {
          locale: "ar",
          name: "منحة التطوير المهني للمعلمين",
          offerDesc: "رصيد 40 دولار لجميع المعلمين المسجلين لترقية أدواتهم التعليمية وتطوير المحتوى.",
        },
      ],
    },

    // 4. VIP Scholars Exclusive - SPECIFIC_STUDENTS (Active)
    {
      target: "SPECIFIC_STUDENTS",
      targetIds: studentList.slice(0, 2).map((s) => s.id),
      offerType: "PERCENTAGE",
      discount: 35,
      startDate: now.subtract(1, "day").toDate(),
      endDate: now.add(15, "day").toDate(),
      status: "ACTIVE",
      courseId: null,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "VIP Scholars Exclusive",
          offerDesc: "Exclusive 35% discount for selected top-performing students across the platform.",
        },
        {
          locale: "ar",
          name: "خصم الطلاب المتفوقين الحصري",
          offerDesc: "خصم حصري 35% مخصص لصفوة الطلاب المتميزين المختارين على المنصة.",
        },
      ],
    },

    // 5. Master Instructors Recognition - SPECIFIC_TEACHERS (Active)
    {
      target: "SPECIFIC_TEACHERS",
      targetIds: teacherList.slice(0, 1).map((t) => t.id),
      offerType: "FIXED_AMOUNT",
      discount: 60.0,
      startDate: now.subtract(1, "day").toDate(),
      endDate: now.add(20, "day").toDate(),
      status: "ACTIVE",
      courseId: null,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "Master Instructors Recognition",
          offerDesc: "$60 reward grant awarded to selected top-rated educators.",
        },
        {
          locale: "ar",
          name: "مكافأة نخبة المعلمين المتميزين",
          offerDesc: "مكافأة بقيمة 60 دولار لمعلمي النخبة المختارين تقديراً لجهودهم.",
        },
      ],
    },

    // 6. New Learner Welcome Gift - NEW_USERS (Active)
    {
      target: "NEW_USERS",
      targetIds: [],
      offerType: "PERCENTAGE",
      discount: 15,
      startDate: now.subtract(4, "day").toDate(),
      endDate: now.add(45, "day").toDate(),
      status: "ACTIVE",
      courseId: null,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "New Learner Welcome Gift",
          offerDesc: "Welcome to LearnX! Get 15% off your first course during your first week.",
        },
        {
          locale: "ar",
          name: "هدية الترحيب بالمتعلمين الجدد",
          offerDesc: "أهلاً بك في LearnX! احصل على خصم 15% على أول كورس خلال أول 7 أيام من التسجيل.",
        },
      ],
    },

    // 7. Flash Weekend Special - ALL_USERS (Active - EXPIRING SOON in 3 days)
    {
      target: "ALL_USERS",
      targetIds: [],
      offerType: "PERCENTAGE",
      discount: 30,
      startDate: now.subtract(2, "day").toDate(),
      endDate: now.add(3, "day").toDate(), // Ends within 7 days -> Expiring soon!
      status: "ACTIVE",
      courseId: null,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "Flash Weekend Special",
          offerDesc: "Urgent 30% discount ending this weekend! Grab your favorite courses before it expires.",
        },
        {
          locale: "ar",
          name: "عرض نهاية الأسبوع الخاطف",
          offerDesc: "خصم خاطف 30% ينتهي خلال أيام قليلة! انتهز الفرصة قبل انتهاء العرض.",
        },
      ],
    },

    // 8. Summer Kickoff Mega Deal - ALL_USERS (EXPIRED)
    {
      target: "ALL_USERS",
      targetIds: [],
      offerType: "PERCENTAGE",
      discount: 50,
      startDate: now.subtract(40, "day").toDate(),
      endDate: now.subtract(10, "day").toDate(), // Ended in past -> Expired!
      status: "EXPIRED",
      courseId: null,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "Summer Kickoff Mega Deal",
          offerDesc: "Previous seasonal promotion that offered 50% discount.",
        },
        {
          locale: "ar",
          name: "خصم الصيف المنتهي",
          offerDesc: "عرض موسمي سابق بخصم 50% تم إغلاقه بنجاح.",
        },
      ],
    },

    // 9. Black Friday Teaser - ALL_USERS (SCHEDULED in future)
    {
      target: "ALL_USERS",
      targetIds: [],
      offerType: "PERCENTAGE",
      discount: 45,
      startDate: now.add(10, "day").toDate(), // Future start date -> Scheduled!
      endDate: now.add(25, "day").toDate(),
      status: "SCHEDULED",
      courseId: null,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "Black Friday Early Teaser",
          offerDesc: "Upcoming super sale coming soon with up to 45% off.",
        },
        {
          locale: "ar",
          name: "عرض الجمعة البيضاء المبكر",
          offerDesc: "عرض ترويجي قادم قريباً بخصومات تصل إلى 45%.",
        },
      ],
    },
  ];

  // Optional Course-specific offer if courses exist
  if (courseList.length > 0) {
    offersData.push({
      target: "ALL_USERS",
      targetIds: [],
      offerType: "PERCENTAGE",
      discount: 30,
      startDate: now.subtract(2, "day").toDate(),
      endDate: now.add(20, "day").toDate(),
      status: "ACTIVE",
      courseId: courseList[0].id,
      teacherCourseId: null,
      translations: [
        {
          locale: "en",
          name: "Featured Course Discount",
          offerDesc: "30% off on our flagship course of the month.",
        },
        {
          locale: "ar",
          name: "خصم الكورس المميز لهذا الشهر",
          offerDesc: "خصم 30% على الكورس الأكثر طلباً وتميزاً لهذا الشهر.",
        },
      ],
    });
  }

  // Optional Teacher Course offer if teacherCourses exist
  if (teacherCourseList.length > 0) {
    offersData.push({
      target: "ALL_STUDENTS",
      targetIds: [],
      offerType: "PERCENTAGE",
      discount: 20,
      startDate: now.subtract(1, "day").toDate(),
      endDate: now.add(14, "day").toDate(),
      status: "ACTIVE",
      courseId: null,
      teacherCourseId: teacherCourseList[0].id,
      translations: [
        {
          locale: "en",
          name: "Instructor Course Early Bird",
          offerDesc: "Special 20% discount on teacher live interactive course.",
        },
        {
          locale: "ar",
          name: "خصم الحجز المبكر لكورس المعلم",
          offerDesc: "خصم 20% للحجز المبكر في كورس المعلم التفاعلي المباشر.",
        },
      ],
    });
  }

  const seededOffers = [];

  for (const offerItem of offersData) {
    const { translations, ...scalarData } = offerItem;

    // Check if an offer with the same primary English name already exists to avoid duplicates
    const enName = translations.find((t) => t.locale === "en")?.name;
    const existingTranslation = await prisma.offerTranslation.findFirst({
      where: { name: enName, locale: "en" },
      select: { offerId: true },
    });

    let offer;
    if (existingTranslation) {
      // Update existing offer and its translations
      offer = await prisma.offer.update({
        where: { id: existingTranslation.offerId },
        data: {
          ...scalarData,
          translations: {
            deleteMany: {},
            create: translations,
          },
        },
        include: { translations: true },
      });
    } else {
      // Create new offer
      offer = await prisma.offer.create({
        data: {
          ...scalarData,
          translations: {
            create: translations,
          },
        },
        include: { translations: true },
      });
    }

    seededOffers.push(offer);
  }

  console.log(`✅ Seeded ${seededOffers.length} offers with multilingual translations!`);
  return seededOffers;
}

async function standalone() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🚀 Starting standalone offers seeder...\n");
    await seedOffers(prisma);
    console.log("\n🎉 Offers seeding completed successfully!");
  } catch (err) {
    console.error("❌ Offers seeding failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("offers.seed.js")) {
  standalone();
}
