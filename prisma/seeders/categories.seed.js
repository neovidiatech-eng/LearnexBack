const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categoriesData = [
  {
    slug: "web-development",
    translations: [
      { locale: "en", name: "Web Development", description: "Learn modern web development from scratch including HTML, CSS, JavaScript, and popular frameworks." },
      { locale: "ar", name: "تطوير الويب", description: "تعلم تطوير الويب الحديث من الصفر بما في ذلك HTML وCSS وJavaScript والأطر الشائعة." },
    ],
  },
  {
    slug: "mobile-development",
    translations: [
      { locale: "en", name: "Mobile Development", description: "Build iOS and Android apps using React Native, Flutter, and native technologies." },
      { locale: "ar", name: "تطوير التطبيقات", description: "بناء تطبيقات iOS وAndroid باستخدام React Native وFlutter والتقنيات الأصلية." },
    ],
  },
  {
    slug: "data-science",
    translations: [
      { locale: "en", name: "Data Science", description: "Master data analysis, machine learning, and AI with Python and industry tools." },
      { locale: "ar", name: "علم البيانات", description: "إتقان تحليل البيانات والتعلم الآلي والذكاء الاصطناعي باستخدام Python وأدوات الصناعة." },
    ],
  },
  {
    slug: "ui-ux-design",
    translations: [
      { locale: "en", name: "UI/UX Design", description: "Create beautiful and user-friendly digital experiences with Figma and design principles." },
      { locale: "ar", name: "تصميم واجهات المستخدم", description: "إنشاء تجارب رقمية جميلة وسهلة الاستخدام باستخدام Figma ومبادئ التصميم." },
    ],
  },
  {
    slug: "cybersecurity",
    translations: [
      { locale: "en", name: "Cybersecurity", description: "Protect systems and networks with ethical hacking and security fundamentals." },
      { locale: "ar", name: "الأمن السيبراني", description: "حماية الأنظمة والشبكات من خلال القرصنة الأخلاقية وأساسيات الأمان." },
    ],
  },
];

async function seedCategories() {
  console.log("🌱 Seeding categories...");

  const categories = [];
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: cat.slug,
        translations: {
          create: cat.translations,
        },
      },
      include: { translations: true },
    });
    categories.push(upserted);
  }

  console.log(`✅ Seeded ${categories.length} categories`);
  return categories;
}

module.exports = { seedCategories };
