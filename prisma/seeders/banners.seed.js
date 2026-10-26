import { actionTypeEnum } from "../../src/utils/Enums/banner.enum.js";

export const bannersSeedData = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    actionType: actionTypeEnum.DISCOUNT,
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Spring Learning Sale: Up to 50% Off",
        subtitle:
          "Unlock your full potential with premier courses across tech, AI, and creative design at unbeatable discounts.",
        buttonText: "Explore Offers",
      },
      {
        locale: "ar",
        title: "عروض الربيع: خصم يصل إلى 50%",
        subtitle:
          "أطلق العنان لإمكانياتك مع دورات مميزة في تطوير الويب والذكاء الاصطناعي والتصميم بنصف السعر لفترة محدودة.",
        buttonText: "تصفح العروض",
      },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    actionType: actionTypeEnum.COURSE,
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Full-Stack Web Development Bootcamp",
        subtitle:
          "Master modern web applications from scratch with React, Node.js, and PostgreSQL through hands-on projects.",
        buttonText: "Enroll Now",
      },
      {
        locale: "ar",
        title: "بوتكامب تطوير تطبيقات الويب المتكاملة",
        subtitle:
          "احترف تطوير الويب الحديث باستخدام React و Node.js و PostgreSQL من خلال مشاريع حقيقية عملية تؤهلك للعمل.",
        buttonText: "اشترك الآن",
      },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    actionType: actionTypeEnum.CATEGORY,
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Master Data Science & AI",
        subtitle:
          "Explore industry-curated pathways in machine learning, artificial intelligence, and big data analytics.",
        buttonText: "Browse Category",
      },
      {
        locale: "ar",
        title: "احترف علم البيانات والذكاء الاصطناعي",
        subtitle:
          "استكشف أفضل المسارات التعليمية في تعلم الآلة والذكاء الاصطناعي وتحليل البيانات المطلوبة عالمياً.",
        buttonText: "تصفح المسار",
      },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000004",
    actionType: actionTypeEnum.INSTRUCTORS,
    imageUrl:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Learn Directly from Industry Leaders",
        subtitle:
          "Book 1-on-1 private mentoring sessions with seasoned instructors to accelerate your career growth.",
        buttonText: "Meet Instructors",
      },
      {
        locale: "ar",
        title: "تعلم على يد نخبة من الخبراء والمتخصصين",
        subtitle:
          "احجز جلسات توجيه فردية ومباشرة مع أفضل المحاضرين لتسريع نموك المهني والحصول على إرشاد شخصي.",
        buttonText: "اكتشف المدربين",
      },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000005",
    actionType: actionTypeEnum.EXTERNAL_URL,
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Join Our Live Coding Community",
        subtitle:
          "Participate in weekly interactive sessions, collaborate on coding challenges, and expand your network.",
        buttonText: "Join Community",
      },
      {
        locale: "ar",
        title: "انضم إلى مجتمع التعلم التفاعلي",
        subtitle:
          "شارك في ورش عمل أسبوعية مباشرة وتحديات برمجية تفاعلية وتواصل مع نخبة من الطلاب والمطورين.",
        buttonText: "انضم الآن",
      },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000006",
    actionType: actionTypeEnum.NONE,
    imageUrl:
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop",
    isActive: false,
    translations: [
      {
        locale: "en",
        title: "Upcoming: Interactive Code Playground",
        subtitle:
          "Practice coding directly in your browser without any local setup needed. Stay tuned!",
        buttonText: "Coming Soon",
      },
      {
        locale: "ar",
        title: "قريباً: بيئة برمجية تفاعلية مباشرة",
        subtitle:
          "مارس البرمجة وتطبيق التمارين مباشرة داخل المتصفح دون الحاجة لأي تثبيت أو إعدادات مسبقة.",
        buttonText: "قريباً",
      },
    ],
  },
];

export async function seedBanners(prisma, courses = [], categories = []) {
  console.log("🌱 Seeding banners...");

  // 1. Resolve course for COURSE action banner
  let targetCourse = courses?.[0];
  if (!targetCourse) {
    targetCourse = await prisma.course.findFirst({
      where: { status: "PUBLISHED" },
      select: { id: true },
    });
  }

  // 2. Resolve category for CATEGORY action banner
  let targetCategory = categories?.[0];
  if (!targetCategory) {
    targetCategory = await prisma.category.findFirst({
      select: { id: true },
    });
  }

  const seededBanners = [];

  for (const item of bannersSeedData) {
    let resolvedTargetId = null;

    if (item.actionType === actionTypeEnum.COURSE && targetCourse?.id) {
      resolvedTargetId = targetCourse.id;
    } else if (item.actionType === actionTypeEnum.CATEGORY && targetCategory?.id) {
      resolvedTargetId = targetCategory.id;
    }

    const banner = await prisma.banner.upsert({
      where: { id: item.id },
      update: {
        imageUrl: item.imageUrl,
        actionType: item.actionType,
        targetId: resolvedTargetId,
        isActive: item.isActive,
      },
      create: {
        id: item.id,
        imageUrl: item.imageUrl,
        actionType: item.actionType,
        targetId: resolvedTargetId,
        isActive: item.isActive,
      },
    });

    for (const translation of item.translations) {
      await prisma.bannerTranslation.upsert({
        where: {
          bannerId_locale: {
            bannerId: banner.id,
            locale: translation.locale,
          },
        },
        update: {
          title: translation.title,
          subtitle: translation.subtitle,
          buttonText: translation.buttonText,
        },
        create: {
          bannerId: banner.id,
          locale: translation.locale,
          title: translation.title,
          subtitle: translation.subtitle,
          buttonText: translation.buttonText,
        },
      });
    }

    seededBanners.push(banner);
  }

  console.log(`✅ Seeded ${seededBanners.length} banners with translations`);
  return seededBanners;
}

async function standalone() {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { default: pg } = await import("pg");
  await import("dotenv/config");

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🚀 Starting standalone banners seeder...\n");
    await seedBanners(prisma);
    console.log("\n🎉 Banners seeding completed successfully!");
  } catch (err) {
    console.error("❌ Banners seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("banners.seed.js")) {
  standalone();
}
