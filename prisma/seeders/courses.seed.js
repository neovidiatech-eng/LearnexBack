export async function seedCourses(prisma, teachers, categories) {
  console.log("🌱 Seeding courses...");

  const webDevCategory = categories.find((c) => c.slug === "web-development");
  const dataScienceCategory = categories.find((c) => c.slug === "data-science");
  const mobileCategory = categories.find((c) => c.slug === "mobile-development");

  const coursesData = [
    {
      instructorId: teachers[0].id, // Ahmed - Web Dev
      categoryId: webDevCategory.id,
      level: "BEGINNER",
      status: "PUBLISHED",
      enrollmentType: "PAID",
      language: "arabic",
      originalPrice: 299.99,
      salePrice: 149.99,
      currency: "EGP",
      durationHours: 40,
      tags: ["html", "css", "javascript", "react"],
      hasCertificate: true,
      translations: [
        {
          locale: "en",
          title: "Complete Web Development Bootcamp",
          description: "Master web development from zero to hero. Learn HTML, CSS, JavaScript, and React with hands-on projects.",
          whatYouWillLearn: ["Build responsive websites", "Master JavaScript ES6+", "Create React apps", "Deploy to production"],
          requirements: ["Basic computer skills", "No prior coding experience needed"],
        },
        {
          locale: "ar",
          title: "بوتكامب تطوير الويب الشامل",
          description: "أتقن تطوير الويب من الصفر حتى الاحتراف. تعلم HTML وCSS وJavaScript وReact مع مشاريع عملية.",
          whatYouWillLearn: ["بناء مواقع متجاوبة", "إتقان JavaScript ES6+", "إنشاء تطبيقات React", "نشر على الإنتاج"],
          requirements: ["مهارات الحاسوب الأساسية", "لا يلزم خبرة سابقة في البرمجة"],
        },
      ],
      sections: [
        {
          order: 1,
          translations: [{ locale: "en", title: "Getting Started with HTML" }, { locale: "ar", title: "البدء مع HTML" }],
          lessons: [
            { order: 1, type: "VIDEO", durationMinutes: 15, isFreePreview: true, translations: [{ locale: "en", title: "Introduction to HTML", description: "Overview of HTML basics" }, { locale: "ar", title: "مقدمة في HTML", description: "نظرة عامة على أساسيات HTML" }] },
            { order: 2, type: "VIDEO", durationMinutes: 20, isFreePreview: false, translations: [{ locale: "en", title: "HTML Tags & Elements", description: "Learn all essential HTML tags" }, { locale: "ar", title: "وسوم وعناصر HTML", description: "تعلم جميع وسوم HTML الأساسية" }] },
          ],
        },
        {
          order: 2,
          translations: [{ locale: "en", title: "CSS Fundamentals" }, { locale: "ar", title: "أساسيات CSS" }],
          lessons: [
            { order: 1, type: "VIDEO", durationMinutes: 25, isFreePreview: true, translations: [{ locale: "en", title: "Introduction to CSS", description: "Styling your first webpage" }, { locale: "ar", title: "مقدمة في CSS", description: "تصميم أول صفحة ويب خاصة بك" }] },
            { order: 2, type: "VIDEO", durationMinutes: 30, isFreePreview: false, translations: [{ locale: "en", title: "CSS Flexbox & Grid", description: "Master modern CSS layout systems" }, { locale: "ar", title: "Flexbox و Grid في CSS", description: "إتقان أنظمة التخطيط الحديثة في CSS" }] },
          ],
        },
      ],
    },
    {
      instructorId: teachers[1].id, // Sara - Data Science
      categoryId: dataScienceCategory.id,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      enrollmentType: "PAID",
      language: "english",
      originalPrice: 399.99,
      salePrice: 199.99,
      currency: "EGP",
      durationHours: 60,
      tags: ["python", "machine-learning", "pandas", "tensorflow"],
      hasCertificate: true,
      translations: [
        {
          locale: "en",
          title: "Data Science & Machine Learning Masterclass",
          description: "Comprehensive data science course covering Python, Pandas, Scikit-learn, and TensorFlow for real-world applications.",
          whatYouWillLearn: ["Python for data science", "Data visualization", "Machine learning algorithms", "Deep learning basics"],
          requirements: ["Basic Python knowledge", "High school mathematics"],
        },
        {
          locale: "ar",
          title: "ماستركلاس علم البيانات والتعلم الآلي",
          description: "دورة شاملة في علم البيانات تغطي Python وPandas وScikit-learn وTensorFlow للتطبيقات الواقعية.",
          whatYouWillLearn: ["Python لعلم البيانات", "تصور البيانات", "خوارزميات التعلم الآلي", "أساسيات التعلم العميق"],
          requirements: ["معرفة أساسية بـ Python", "رياضيات المرحلة الثانوية"],
        },
      ],
      sections: [
        {
          order: 1,
          translations: [{ locale: "en", title: "Python for Data Science" }, { locale: "ar", title: "Python لعلم البيانات" }],
          lessons: [
            { order: 1, type: "VIDEO", durationMinutes: 20, isFreePreview: true, translations: [{ locale: "en", title: "Python Setup & Introduction", description: "Setting up your Python environment" }, { locale: "ar", title: "إعداد Python ومقدمة", description: "إعداد بيئة Python الخاصة بك" }] },
            { order: 2, type: "VIDEO", durationMinutes: 35, isFreePreview: false, translations: [{ locale: "en", title: "NumPy & Pandas Basics", description: "Data manipulation with NumPy and Pandas" }, { locale: "ar", title: "أساسيات NumPy و Pandas", description: "معالجة البيانات باستخدام NumPy و Pandas" }] },
          ],
        },
      ],
    },
    {
      instructorId: teachers[2].id, // Omar - Mobile
      categoryId: mobileCategory.id,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      enrollmentType: "FREE",
      language: "arabic",
      originalPrice: 0,
      currency: "EGP",
      durationHours: 30,
      tags: ["react-native", "mobile", "javascript", "expo"],
      hasCertificate: true,
      translations: [
        {
          locale: "en",
          title: "React Native Mobile Development",
          description: "Build cross-platform mobile apps for iOS and Android using React Native and Expo.",
          whatYouWillLearn: ["React Native fundamentals", "Navigation & routing", "State management", "API integration"],
          requirements: ["Basic JavaScript knowledge", "Understanding of React basics"],
        },
        {
          locale: "ar",
          title: "تطوير تطبيقات الجوال بـ React Native",
          description: "بناء تطبيقات جوال متعددة المنصات لـ iOS وAndroid باستخدام React Native وExpo.",
          whatYouWillLearn: ["أساسيات React Native", "التنقل والتوجيه", "إدارة الحالة", "دمج API"],
          requirements: ["معرفة أساسية بـ JavaScript", "فهم أساسيات React"],
        },
      ],
      sections: [
        {
          order: 1,
          translations: [{ locale: "en", title: "React Native Basics" }, { locale: "ar", title: "أساسيات React Native" }],
          lessons: [
            { order: 1, type: "VIDEO", durationMinutes: 18, isFreePreview: true, translations: [{ locale: "en", title: "Setting Up React Native", description: "Install and configure React Native with Expo" }, { locale: "ar", title: "إعداد React Native", description: "تثبيت وتكوين React Native مع Expo" }] },
            { order: 2, type: "VIDEO", durationMinutes: 22, isFreePreview: false, translations: [{ locale: "en", title: "Core Components", description: "View, Text, Image and other core components" }, { locale: "ar", title: "المكونات الأساسية", description: "View وText وImage والمكونات الأساسية الأخرى" }] },
          ],
        },
      ],
    },
  ];

  const courses = [];
  for (const course of coursesData) {
    const { translations, sections, ...courseData } = course;

    const created = await prisma.course.create({
      data: {
        ...courseData,
        originalPrice: courseData.originalPrice,
        salePrice: courseData.salePrice ?? null,
        translations: { create: translations },
        sections: {
          create: sections.map((section) => ({
            order: section.order,
            translations: { create: section.translations },
            lessons: {
              create: section.lessons.map((lesson) => ({
                order: lesson.order,
                type: lesson.type,
                durationMinutes: lesson.durationMinutes,
                isFreePreview: lesson.isFreePreview,
                translations: { create: lesson.translations },
              })),
            },
          })),
        },
      },
      include: { translations: true, sections: { include: { lessons: true } } },
    });
    courses.push(created);
  }

  console.log(`✅ Seeded ${courses.length} courses`);
  return courses;
}