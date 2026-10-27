import { actionTypeEnum } from "../../src/utils/Enums/banner.enum.js";

export const bannersSeedData = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    actionType: actionTypeEnum.DISCOUNT_ON_COURSE,
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Spring Sale: 50% Off Top Course",
        subtitle:
          "Unlock your full potential with an exclusive 50% discount on this featured masterclass.",
        buttonText: "View Course",
      },
      {
        locale: "ar",
        title: "عروض الربيع: خصم 50% على هذا الكورس",
        subtitle:
          "أطلق العنان لإمكانياتك مع خصم حصري 50% على أفضل الكورسات الأكثر طلباً في سوق العمل.",
        buttonText: "عرض الكورس",
      },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    actionType: actionTypeEnum.COURSES,
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Explore All Popular Courses",
        subtitle:
          "Discover hundreds of certified courses in programming, AI, design, and business management.",
        buttonText: "All Courses",
      },
      {
        locale: "ar",
        title: "تصفح جميع الكورسات المميزة",
        subtitle:
          "اكتشف مئات الدورات المعتمدة في البرمجة والذكاء الاصطناعي والتصميم وإدارة الأعمال.",
        buttonText: "كل الكورسات",
      },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    actionType: actionTypeEnum.CATEGORIES,
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Master Data Science & Programming Track",
        subtitle:
          "Explore industry-curated pathways in software engineering and data analytics.",
        buttonText: "Browse Category",
      },
      {
        locale: "ar",
        title: "احترف مسار البرمجة وعلم البيانات",
        subtitle:
          "استكشف أفضل المسارات التعليمية المعتمدة في هندسة البرمجيات وتحليل البيانات المطلوبة عالمياً.",
        buttonText: "تصفح القسم",
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
        title: "Learn Directly from Expert Instructors",
        subtitle:
          "Book 1-on-1 private mentoring sessions with seasoned teachers to accelerate your learning.",
        buttonText: "All Instructors",
      },
      {
        locale: "ar",
        title: "تعلم مع أفضل المعلمين المعتمدين",
        subtitle:
          "احجز جلسات فردية ومباشرة مع نخبة من الأساتذة والخبراء لتسريع تعلمك وتطوير مهاراتك.",
        buttonText: "كل المعلمين",
      },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000005",
    actionType: actionTypeEnum.EXTERNAL_URL,
    targetId: "https://flutter.dev",
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Visit Our Official Developer Portal",
        subtitle:
          "Check out the official documentation, developer community guidelines, and learning resources.",
        buttonText: "Visit Link",
      },
      {
        locale: "ar",
        title: "انضم إلى مجتمعنا التقني الرسمي",
        subtitle:
          "تصفح التوثيق الرسمي ومصادر التعلم الإضافية وتواصل مع فريق التطوير في منصتنا.",
        buttonText: "زيارة الرابط",
      },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000006",
    actionType: actionTypeEnum.NONE,
    imageUrl:
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop",
    isActive: true,
    translations: [
      {
        locale: "en",
        title: "Announcement: Platform Update Coming Soon",
        subtitle:
          "We are continuously working to enhance the learning experience for all students and instructors.",
        buttonText: "Announcement",
      },
      {
        locale: "ar",
        title: "تنويه عام: تحديثات وتطويرات قادمة للمنصة",
        subtitle:
          "نعمل باستمرار على تطوير المنصة وتقديم أفضل الأدوات التفاعلية وتجربة تعليمية استثنائية.",
        buttonText: "إعلان",
      },
    ],
  },
];

export async function seedBanners(prisma, courses = [], categories = []) {
  console.log("🌱 Seeding banners according to all actionTypeEnums...");

  // 1. Resolve course for DISCOUNT_ON_COURSE action banner
  let targetCourse = courses?.[0];
  if (!targetCourse) {
    targetCourse = await prisma.course.findFirst({
      where: { status: "PUBLISHED" },
      select: { id: true },
    });
  }

  // 2. Resolve category for CATEGORIES action banner
  let targetCategory = categories?.[0];
  if (!targetCategory) {
    targetCategory = await prisma.category.findFirst({
      select: { id: true },
    });
  }

  const seededBanners = [];

  for (let i = 0; i < bannersSeedData.length; i++) {
    const item = bannersSeedData[i];
    let resolvedTargetId = item.targetId || null;

    if (item.actionType === actionTypeEnum.DISCOUNT_ON_COURSE && targetCourse?.id) {
      resolvedTargetId = targetCourse.id;
    } else if (item.actionType === actionTypeEnum.CATEGORIES && targetCategory?.id) {
      resolvedTargetId = targetCategory.id;
    }

    const banner = await prisma.banner.upsert({
      where: { id: item.id },
      update: {
        imageUrl: item.imageUrl,
        actionType: item.actionType,
        targetId: resolvedTargetId,
        isActive: item.isActive,
        order: i+1,
      },
      create: {
        id: item.id,
        imageUrl: item.imageUrl,
        actionType: item.actionType,
        targetId: resolvedTargetId,
        isActive: item.isActive,
        order: i+1,
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

  console.log(`✅ Successfully seeded ${seededBanners.length} banners covering all actionTypeEnums!`);
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
