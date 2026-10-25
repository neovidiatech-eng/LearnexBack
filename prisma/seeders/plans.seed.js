export async function seedPlans(prisma, teachers) {
  console.log("🌱 Seeding session plans with translations...");

  let teacherList = teachers;
  if (!teacherList || teacherList.length === 0) {
    teacherList = await prisma.teacher.findMany({
      include: {
        user: {
          select: { email: true, fullName: true },
        },
      },
    });
  }

  // Helper to extract teacher entity and user email
  const resolveTeacher = (t) => {
    if (t.teacher) {
      return {
        id: t.teacher.id,
        email: t.email,
        name: t.fullName,
      };
    }
    return {
      id: t.id,
      email: t.user?.email,
      name: t.user?.fullName,
    };
  };

  const resolvedTeachers = teacherList.map(resolveTeacher);

  const ahmed = resolvedTeachers.find((t) => t.email === "ahmed.hassan@learnex.com");
  const sara = resolvedTeachers.find((t) => t.email === "sara.ibrahim@learnex.com");
  const omar = resolvedTeachers.find((t) => t.email === "omar.ali@learnex.com");
  const sayed = resolvedTeachers.find((t) => t.email === "elsayedatef469@gmail.com");

  const plansData = [];

  if (ahmed) {
    plansData.push(
      {
        teacherId: ahmed.id,
        sessionsCount: 3,
        price: 75.0,
        discountType: null,
        discountValue: null,
        color: "#2563EB",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "خطة البداية السريعة (3 جلسات)",
            description: "جلسات فردية مركزة لأساسيات تطوير الويب ومراجعة مشاريع HTML/CSS/JavaScript وحل المشكلات البرمجية.",
            slug: "ahmed-web-starter-ar",
          },
          {
            lang: "en",
            title: "Web Dev Quickstart (3 Sessions)",
            description: "Focused 1-on-1 sessions covering web development foundations, HTML/CSS/JS reviews, and code debugging.",
            slug: "ahmed-web-starter-en",
          },
        ],
      },
      {
        teacherId: ahmed.id,
        sessionsCount: 6,
        price: 140.0,
        discountType: "PERCENTAGE",
        discountValue: 10.0,
        color: "#7C3AED",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "خطة الإتقان الشاملة (6 جلسات)",
            description: "خطة متكاملة للتدريب على تقنيات React و Node.js وبناء مشروع عملي متكامل مع كود ريفيو مباشر.",
            slug: "ahmed-fullstack-mastery-ar",
          },
          {
            lang: "en",
            title: "Full-Stack Mastery (6 Sessions)",
            description: "Comprehensive hands-on training with React and Node.js, building a real production project with live reviews.",
            slug: "ahmed-fullstack-mastery-en",
          },
        ],
      },
      {
        teacherId: ahmed.id,
        sessionsCount: 10,
        price: 220.0,
        discountType: "FIXED",
        discountValue: 30.0,
        color: "#b36c14ff",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "حزمة الاحتراف والتوجيه المهني (10 جلسات)",
            description: "توجيه شامل يشمل معمارية البرمجيات المتقدمة، تحضير لمقابلات العمل التقنية، وإشراف على بناء بورتفوليو احترافي.",
            slug: "ahmed-pro-mentorship-ar",
          },
          {
            lang: "en",
            title: "Pro Mentorship & Career Track (10 Sessions)",
            description: "Full mentorship covering advanced software architecture, tech interview preparation, and portfolio building.",
            slug: "ahmed-pro-mentorship-en",
          },
        ],
      }
    );
  }

  if (sara) {
    plansData.push(
      {
        teacherId: sara.id,
        sessionsCount: 4,
        price: 100.0,
        discountType: null,
        discountValue: null,
        color: "#059669",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "خطة تحليل البيانات السريعة (4 جلسات)",
            description: "جلسات متخصصة لتحليل وتنظيف البيانات الكبيرة باستخدام مكتبات Python، Pandas، و NumPy مع أمثلة واقعية.",
            slug: "sara-data-analysis-ar",
          },
          {
            lang: "en",
            title: "Data Analysis Crash Course (4 Sessions)",
            description: "Specialized sessions for data cleaning and exploration using Python, Pandas, and NumPy with real datasets.",
            slug: "sara-data-analysis-en",
          },
        ],
      },
      {
        teacherId: sara.id,
        sessionsCount: 8,
        price: 190.0,
        discountType: "PERCENTAGE",
        discountValue: 15.0,
        color: "#DC2626",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "مسار تعلم الآلة المتقدم (8 جلسات)",
            description: "بناء وتدريب وتقييم نماذج تعلم الآلة وتطبيق الخوارزميات وتحسين دقة النماذج في بيئة إنتاجية.",
            slug: "sara-ml-track-ar",
          },
          {
            lang: "en",
            title: "Applied Machine Learning Track (8 Sessions)",
            description: "Build, train, and evaluate ML models, implementing algorithms and tuning hyperparameters for production.",
            slug: "sara-ml-track-en",
          },
        ],
      },
      {
        teacherId: sara.id,
        sessionsCount: 12,
        price: 280.0,
        discountType: "FIXED",
        discountValue: 40.0,
        color: "#D97706",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "خطة الذكاء الاصطناعي الشاملة (12 جلسة)",
            description: "تغطية متقدمة لشبكات التعلم العميق Deep Learning ومشاريع الرؤية الحاسوبية وتطبيقات NLP باستخدام PyTorch.",
            slug: "sara-ai-mastery-ar",
          },
          {
            lang: "en",
            title: "Deep Learning & AI Master Track (12 Sessions)",
            description: "Deep dive into neural networks, Computer Vision, and NLP applications using PyTorch and transformer models.",
            slug: "sara-ai-mastery-en",
          },
        ],
      }
    );
  }

  if (omar) {
    plansData.push(
      {
        teacherId: omar.id,
        sessionsCount: 3,
        price: 85.0,
        discountType: null,
        discountValue: null,
        color: "#0284C7",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "خطة استشارات ومراجعة التطبيقات (3 جلسات)",
            description: "جلسات مكثفة لمراجعة كود التطبيقات وتصحيح الأخطاء وتحسين تجربة المستخدم وأداء تطبيقات الموبايل.",
            slug: "omar-mobile-review-ar",
          },
          {
            lang: "en",
            title: "Mobile App Consultation & Code Review (3 Sessions)",
            description: "Intensive sessions for mobile code auditing, bug hunting, UI/UX refinement, and performance profiling.",
            slug: "omar-mobile-review-en",
          },
        ],
      },
      {
        teacherId: omar.id,
        sessionsCount: 6,
        price: 160.0,
        discountType: "PERCENTAGE",
        discountValue: 10.0,
        color: "#0D9488",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "خطة تطوير تطبيقات Flutter المتكاملة (6 جلسات)",
            description: "بناء تطبيق موبايل متكامل بتقنية Flutter مع إدارة الحالة State Management وربط REST APIs والتعامل مع الكاش.",
            slug: "omar-flutter-production-ar",
          },
          {
            lang: "en",
            title: "Flutter Production App Track (6 Sessions)",
            description: "Build an end-to-end Flutter app with solid state management, REST API integration, and offline caching.",
            slug: "omar-flutter-production-en",
          },
        ],
      },
      {
        teacherId: omar.id,
        sessionsCount: 10,
        price: 250.0,
        discountType: "FIXED",
        discountValue: 35.0,
        color: "#831843",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "خطة هندسة ونشر التطبيقات (10 جلسات)",
            description: "معمارية برمجية متطورة، كتابة Unit & Widget Tests، والتحضير لنشر التطبيق على متجري Google Play و Apple App Store.",
            slug: "omar-mobile-architecture-ar",
          },
          {
            lang: "en",
            title: "Mobile Architecture & App Store Launch (10 Sessions)",
            description: "Clean mobile architecture, unit/widget tests, CI/CD pipelines, and store submissions to Google Play & App Store.",
            slug: "omar-mobile-architecture-en",
          },
        ],
      },
      {
        teacherId: omar.id,
        sessionsCount: 2,
        price: 60.0,
        discountType: null,
        discountValue: null,
        color: "#475569",
        isActive: false,
        translations: [
          {
            lang: "ar",
            title: "خطة الإعداد لمقابلات عمل الموبايل (2 جلسات)",
            description: "جلسات محاكاة لمقابلات العمل التقنية لمطوري الموبايل ومراجعة الخوارزميات وأسئلة النظام الشائعة.",
            slug: "omar-mobile-interview-ar",
          },
          {
            lang: "en",
            title: "Mobile Technical Interview Prep (2 Sessions)",
            description: "Mock technical interviews for mobile engineering roles covering CS fundamentals, system design, and algorithms.",
            slug: "omar-mobile-interview-en",
          },
        ],
      }
    );
  }

  if (sayed) {
    plansData.push(
      {
        teacherId: sayed.id,
        sessionsCount: 4,
        price: 120.0,
        discountType: null,
        discountValue: null,
        color: "#059669",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "باقة هندسة البرمجيات والتوجيه (4 جلسات)",
            description: "جلسات استشارية مكثفة تغطي معمارية التطبيقات، كود ريفيو، وهندسة البرمجيات النظيفة Clean Architecture.",
            slug: "sayed-software-engineering-ar",
          },
          {
            lang: "en",
            title: "Software Engineering Mentorship (4 Sessions)",
            description: "Intensive 1-on-1 mentorship covering architecture, code reviews, and Clean Architecture best practices.",
            slug: "sayed-software-engineering-en",
          },
        ],
      },
      {
        teacherId: sayed.id,
        sessionsCount: 8,
        price: 220.0,
        discountType: "PERCENTAGE",
        discountValue: 15.0,
        color: "#2563EB",
        isActive: true,
        translations: [
          {
            lang: "ar",
            title: "المسار الشامل للاحتراف وتطوير الموبايل (8 جلسات)",
            description: "برنامج تدريبي متكامل لبناء وتوسيع تطبيقات Flutter و Node.js وإعدادك للوظائف العليا والشركات العالمية.",
            slug: "sayed-mobile-mastery-ar",
          },
          {
            lang: "en",
            title: "Full Mobile & Backend Pro Track (8 Sessions)",
            description: "Comprehensive hands-on roadmap building scalable Flutter & Node.js apps and preparing for senior roles.",
            slug: "sayed-mobile-mastery-en",
          },
        ],
      }
    );
  }

  // Delete previously seeded session plans to re-seed cleanly with translations
  await prisma.sessionPlan.deleteMany({
    where: {
      teacherId: { in: resolvedTeachers.map((t) => t.id) },
    },
  });

  const seededPlans = [];
  for (const plan of plansData) {
    const { translations, ...scalarFields } = plan;
    const created = await prisma.sessionPlan.create({
      data: {
        ...scalarFields,
        sessionPlansTranslations: {
          create: translations,
        },
      },
      include: {
        sessionPlansTranslations: true,
      },
    });
    seededPlans.push(created);
  }

  console.log(`✅ Seeded ${seededPlans.length} session plans with translations across ${resolvedTeachers.length} teachers!`);
  return seededPlans;
}
