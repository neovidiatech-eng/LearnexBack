export async function seedTeacherCourses(prisma, teachers, categories = [], students = []) {
  console.log("🌱 Seeding teacher courses (teacher/courses)...");

  // Get teacher profiles from users
  const ahmedTeacher = teachers.find((t) => t.email === "ahmed.hassan@learnex.com")?.teacher;
  const saraTeacher = teachers.find((t) => t.email === "sara.ibrahim@learnex.com")?.teacher;
  const omarTeacher = teachers.find((t) => t.email === "omar.ali@learnex.com")?.teacher;
  const sayedTeacher = teachers.find((t) => t.email === "elsayedatef469@gmail.com")?.teacher;

  if (!ahmedTeacher || !saraTeacher || !omarTeacher) {
    console.log("⚠️ Teacher profiles not found, skipping teacher courses seed.");
    return [];
  }

  // Categories lookup
  let allCategories = categories;
  if (!allCategories || allCategories.length === 0) {
    allCategories = await prisma.category.findMany().catch(() => []);
  }
  const mobileCat = allCategories.find((c) => c.slug === "mobile-development");
  const webCat = allCategories.find((c) => c.slug === "web-development");
  const dataCat = allCategories.find((c) => c.slug === "data-science");
  const designCat = allCategories.find((c) => c.slug === "ui-ux-design");

  // Students lookup
  let allStudents = students;
  if (!allStudents || allStudents.length === 0) {
    allStudents = await prisma.user.findMany({
      where: { student: { isNot: null } },
      include: { student: true },
    }).catch(() => []);
  }

  const youssef = allStudents.find((s) => s.email === "youssef.mahmoud@learnex.com") || allStudents[0];
  const nour = allStudents.find((s) => s.email === "nour.khaled@learnex.com") || allStudents[1];
  const karim = allStudents.find((s) => s.email === "karim.mostafa@learnex.com") || allStudents[2];
  const aya = allStudents.find((s) => s.email === "aya.samy@learnex.com") || allStudents[3];
  const hassan = allStudents.find((s) => s.email === "hassan.fathy@learnex.com") || allStudents[4];

  const teacherCoursesData = [
    // ── Ahmed Hassan (Web Development) ──────────────────────────
    {
      teacherId: ahmedTeacher.id,
      categoryId: webCat?.id ?? null,
      level: "ADVANCED",
      language: "arabic",
      previewVideoUrl: "https://www.youtube.com/watch?v=VPvVD8t02U8",
      name: "Advanced Full-Stack Next.js 14 & Node.js",
      description: "Master full-stack modern web development with Next.js 14 App Router, Server Actions, Prisma, and PostgreSQL.",
      price: 349.99,
      totalHours: 45,
      status: "APPROVED",
      wallPaper: "uploads/teacherCourse/nextjs14-masterclass.jpg",
      sections: [
        {
          name: "Section 1: App Router & Server Components",
          order: 1,
          items: [
            {
              title: "Next.js 14 Architecture & RSC Overview",
              description: "Understanding Server vs Client Components and streaming SSR.",
              materialType: "VIDEO",
              materialLink: "https://www.youtube.com/watch?v=VPvVD8t02U8",
              order: 1,
            },
            {
              title: "Course Handbook & Next.js Cheatsheet",
              description: "Comprehensive PDF guide for Next.js 14 setup and best practices.",
              materialType: "PDF",
              materialLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              order: 2,
            },
          ],
          quiz: {
            title: "Server Components & Architecture Assessment",
            description: "Test your knowledge of Next.js 14 App Router concepts.",
            duration: 15,
            passingScore: 80,
            questions: [
              {
                type: "MCQ",
                text: "What is the default component type in Next.js App Router?",
                order: 1,
                options: [
                  { text: "Server Component", isCorrect: true, order: 1 },
                  { text: "Client Component", isCorrect: false, order: 2 },
                  { text: "Static Component", isCorrect: false, order: 3 },
                ],
              },
              {
                type: "TRUE_FALSE",
                text: "React Server Components increase the JavaScript bundle sent to the client browser.",
                order: 2,
                options: [
                  { text: "True", isCorrect: false, order: 1 },
                  { text: "False", isCorrect: true, order: 2 },
                ],
              },
            ],
          },
        },
        {
          name: "Section 2: Database Modeling with Prisma & Postgres",
          order: 2,
          items: [
            {
              title: "Designing Scalable Relational Schemas",
              description: "Prisma schema relations, indexes, migrations, and pooling.",
              materialType: "VIDEO",
              materialLink: "https://www.youtube.com/watch?v=Oe421EPjeBE",
              order: 1,
            },
          ],
        },
      ],
      enrollments: [
        { student: youssef, progress: 90.0, status: "ACTIVE", paid: 349.99 },
        { student: nour, progress: 40.0, status: "ACTIVE", paid: 349.99 },
      ],
      reviews: [
        {
          student: youssef,
          rating: 5,
          comment: "كورس ممتاز جداً وشرح المعمارية و Server Actions واضح وعملي للغاية.",
        },
      ],
    },
    {
      teacherId: ahmedTeacher.id,
      categoryId: webCat?.id ?? null,
      level: "INTERMEDIATE",
      language: "arabic",
      previewVideoUrl: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
      name: "Modern TypeScript & Microservices with NestJS",
      description: "Build robust, scalable enterprise microservices using TypeScript, NestJS, RabbitMQ, and Redis.",
      price: 299.99,
      totalHours: 35,
      status: "APPROVED",
      wallPaper: "uploads/teacherCourse/nestjs-microservices.jpg",
      sections: [
        {
          name: "Section 1: NestJS Architecture & Dependency Injection",
          order: 1,
          items: [
            {
              title: "NestJS Modules, Providers, and Controllers Deep Dive",
              description: "Dependency injection container mechanics, lifecycle hooks, and scoping.",
              materialType: "VIDEO",
              materialLink: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
              order: 1,
            },
          ],
        },
      ],
    },

    // ── Sara Ibrahim (Data Science & AI) ────────────────────────
    {
      teacherId: saraTeacher.id,
      categoryId: dataCat?.id ?? null,
      level: "INTERMEDIATE",
      language: "arabic",
      previewVideoUrl: "https://www.youtube.com/watch?v=VPvVD8t02U8",
      name: "Machine Learning with Python & Scikit-Learn: Practical Guide",
      description: "End-to-end hands-on machine learning guide covering data preprocessing, model selection, tuning, and evaluation.",
      price: 399.99,
      totalHours: 42,
      status: "APPROVED",
      wallPaper: "uploads/teacherCourse/ml-python-practical.jpg",
      sections: [
        {
          name: "Section 1: Exploratory Data Analysis & Feature Engineering",
          order: 1,
          items: [
            {
              title: "Data Cleaning, Handling Missing Values, and Outliers",
              description: "Pandas and NumPy advanced techniques for preparing raw tabular data.",
              materialType: "VIDEO",
              materialLink: "https://www.youtube.com/watch?v=VPvVD8t02U8",
              order: 1,
            },
          ],
        },
      ],
    },

    // ── Omar Ali (Mobile Development) ───────────────────────────
    {
      teacherId: omarTeacher.id,
      categoryId: mobileCat?.id ?? null,
      level: "BEGINNER",
      language: "arabic",
      previewVideoUrl: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
      name: "Flutter & Dart: Zero to App Store Production",
      description: "Build clean, reactive cross-platform mobile apps with Flutter, Bloc state management, Firebase, and REST APIs.",
      price: 279.99,
      totalHours: 38,
      status: "APPROVED",
      wallPaper: "uploads/teacherCourse/flutter-masterclass.jpg",
      sections: [
        {
          name: "Section 1: Dart Fundamentals & OOP",
          order: 1,
          items: [
            {
              title: "Dart Asynchronous Programming (Futures & Streams)",
              description: "Mastering async/await, isolates, and stream controllers.",
              materialType: "VIDEO",
              materialLink: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
              order: 1,
            },
          ],
        },
      ],
    },

    // ── MR Sayed (Elsayed Atef) ──────────────────────────────────
    ...(sayedTeacher
      ? [
          // Course 1: Flutter Clean Architecture
          {
            teacherId: sayedTeacher.id,
            categoryId: mobileCat?.id ?? null,
            level: "INTERMEDIATE",
            language: "arabic",
            name: "Flutter 3 & Clean Architecture Masterclass: From Zero to Production",
            description: "الدورة التطبيقية الأقوى لبناء تطبيقات فلاتر عملاقة بمعمارية Clean Architecture ونمط BLoC مع أفضل ممارسات اختبار وتجهيز ونشر التطبيقات للمتاجر العالمية.",
            price: 399.00,
            totalHours: 48,
            status: "APPROVED",
            previewVideoUrl: "https://www.youtube.com/watch?v=VPvVD8t02U8",
            wallPaper: "uploads/teacherCourse/clean-architecture-flutter.jpg",
            sections: [
              {
                name: "Section 1: هندسة وتصميم المعمارية النظيفة (Clean Architecture)",
                order: 1,
                items: [
                  {
                    title: "مقدمة المعمارية النظيفة وفصل الاهتمامات (Separation of Concerns)",
                    description: "فهم فلسفة روبرت مارتن وفصل قواعد العمل عن واجهة المستخدم وأطر العمل.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=VPvVD8t02U8",
                    order: 1,
                  },
                  {
                    title: "هندسة الطبقات الثلاث: Domain و Data و Presentation بالتفصيل",
                    description: "شرح الـ Entities, UseCases, Repositories, DataSources, Models بالتفصيل العملي.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
                    order: 2,
                  },
                  {
                    title: "دليل مخطط المعمارية وحقن التبعيات (GetIt Cheatsheet)",
                    description: "ملف PDF مرجعي لهيكل الملفات وخريطة التبعيات والـ Dependency Injection.",
                    materialType: "PDF",
                    materialLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    order: 3,
                  },
                ],
                quiz: {
                  title: "اختبار معمارية البرمجيات النظيفة",
                  description: "تقييم استيعابك لحدود الطبقات واستقلالية الـ Domain Layer.",
                  duration: 20,
                  passingScore: 80,
                  questions: [
                    {
                      type: "MCQ",
                      text: "في Clean Architecture، أي طبقة يجب ألا تعتمد نهائياً على أي مكتبات أو أطر عمل خارجية؟",
                      order: 1,
                      options: [
                        { text: "Domain Layer", isCorrect: true, order: 1 },
                        { text: "Data Layer", isCorrect: false, order: 2 },
                        { text: "Presentation Layer", isCorrect: false, order: 3 },
                      ],
                    },
                    {
                      type: "TRUE_FALSE",
                      text: "تعتمد طبقة Presentation مباشرة على DataSource دون المرور بالـ Repository.",
                      order: 2,
                      options: [
                        { text: "صحيح", isCorrect: false, order: 1 },
                        { text: "خطأ", isCorrect: true, order: 2 },
                      ],
                    },
                    {
                      type: "WRITTEN",
                      text: "وضح أهمية استخدام DTOs (Data Transfer Objects) وكيفية تحويلها إلى Entities في طبقة Domain.",
                      order: 3,
                      options: [],
                    },
                  ],
                },
              },
              {
                name: "Section 2: إدارة الحالة المتقدمة ونمط BLoC & Hive Caching",
                order: 2,
                items: [
                  {
                    title: "تطبيق BLoC مع Equatable والتعامل مع التدفقات Streams",
                    description: "بناء Bloc متكامل ومعالجة الـ Events والـ States المعقدة بكفاءة عالية.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=Oe421EPjeBE",
                    order: 1,
                  },
                  {
                    title: "إدارة الكاش المحلي ومزامنة البيانات في وضع Offline باستخدام Hive",
                    description: "تخزين البيانات والـ Tokens والتعامل مع وضع عدم الاتصال بالإنترنت بسلاسة.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=FL6r37wXqE4",
                    order: 2,
                  },
                  {
                    title: "دليل إدارة الحالة وتجنب الأخطاء الشائعة (PDF Guide)",
                    description: "ملخص شامل لأفضل ممارسات Bloc وتجنب تسريب الذاكرة وعمليات إعادة البناء الزائدة.",
                    materialType: "PDF",
                    materialLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    order: 3,
                  },
                ],
              },
              {
                name: "Section 3: إدارة الشبكات واختبارات الوحدة والنشر للمتاجر",
                order: 3,
                items: [
                  {
                    title: "اتصالات الشبكة الاحترافية عبر Dio و Interceptors وتجديد التوكن",
                    description: "إعداد DioClient، معالجة الأخطاء Network Exceptions، وتجديد التوكن التلقائي.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=VPvVD8t02U8",
                    order: 1,
                  },
                  {
                    title: "كتابة اختبارات الوحدة Unit Tests مع Mockito للـ UseCases والـ Bloc",
                    description: "تغطية الأكواد بالاختبارات وضمان جودة واستقرار النظام قبل الإطلاق.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
                    order: 2,
                  },
                ],
              },
            ],
            enrollments: [
              { student: youssef, progress: 85.0, status: "ACTIVE", paid: 399.00 },
              { student: karim, progress: 100.0, status: "COMPLETED", paid: 399.00 },
              { student: aya, progress: 55.0, status: "ACTIVE", paid: 399.00 },
              { student: nour, progress: 30.0, status: "ACTIVE", paid: 399.00 },
            ],
            reviews: [
              {
                student: karim,
                rating: 5,
                comment: "أفضل كورس فلاتر ومعمارية نظيفة درسته على الإطلاق! الشرح باللغة العربية احترافي للغاية ومستوى المشاريع يضاهي متطلبات الشركات العالمية.",
              },
              {
                student: youssef,
                rating: 5,
                comment: "كورس جبار ومستر سيد مهندس قدير ويوصل المعلومة بسلاسة فائقة، الفيديوهات ممتازة ومباشرة والتطبيقات واقعية جداً.",
              },
              {
                student: aya,
                rating: 5,
                comment: "شرح الـ BLoC وطبقات Clean Architecture غير طريقة تفكيري في كتابة الكود للأفضل بكثير، شكراً مستر سيد!",
              },
            ],
          },

          // Course 2: Node.js Microservices
          {
            teacherId: sayedTeacher.id,
            categoryId: webCat?.id ?? null,
            level: "ADVANCED",
            language: "arabic",
            name: "Node.js Enterprise Microservices & Cloud Backend Architecture",
            description: "دورة معمارية السيرفرات المتطورة: تصميم وبناء الخدمات المصغرة Microservices بـ NestJS، التخزين المؤقت بـ Redis، الحاويات بـ Docker، وأفضل ممارسات التوسع السحابي.",
            price: 499.00,
            totalHours: 52,
            status: "APPROVED",
            previewVideoUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE",
            wallPaper: "uploads/teacherCourse/nodejs-microservices.jpg",
            sections: [
              {
                name: "Section 1: تصميم الخدمات المصغرة ومشاركة الأحداث (Microservices & Events)",
                order: 1,
                items: [
                  {
                    title: "هندسة الأنظمة الموزعة والتواصل بين الخدمات (Event-Driven Architecture)",
                    description: "تصميم الـ Microservices باستخدام NestJS و RabbitMQ لنقل الرسائل الموثوقة.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=Oe421EPjeBE",
                    order: 1,
                  },
                  {
                    title: "تسريع الاستجابة والتخزين المؤقت مع Redis & BullMQ Queues",
                    description: "تطبيق التخزين المؤقت للبيانات الساخنة ومعالجة المهام الثقيلة في الخلفية.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=FL6r37wXqE4",
                    order: 2,
                  },
                  {
                    title: "مخطط الخدمات المصغرة وتأمين بوابات الـ API Gateway (PDF)",
                    description: "دليل تأمين الاتصال ومصادقة المستخدمين وتوزيع الأحمال.",
                    materialType: "PDF",
                    materialLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    order: 3,
                  },
                ],
                quiz: {
                  title: "اختبار معمارية السيرفرات والخدمات المصغرة",
                  description: "تقييم المعرفة بأنماط الـ Microservices وتوزيع البيانات.",
                  duration: 25,
                  passingScore: 75,
                  questions: [
                    {
                      type: "MCQ",
                      text: "ما هو النمط الأنسب للتعامل مع العمليات المالية الموزعة عبر خدمات مصغرة متعددة؟",
                      order: 1,
                      options: [
                        { text: "Saga Pattern", isCorrect: true, order: 1 },
                        { text: "Monolithic Transaction", isCorrect: false, order: 2 },
                        { text: "Direct Database Query", isCorrect: false, order: 3 },
                      ],
                    },
                  ],
                },
              },
              {
                name: "Section 2: الحاويات والنشر السحابي (Docker & Cloud Deployment)",
                order: 2,
                items: [
                  {
                    title: "إنشاء حاويات Docker متعددة المراحل وضبط بيئة الإنتاج",
                    description: "Multi-stage builds وتقليل حجم الصور وتأمين الحاويات ضد الثغرات.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=VPvVD8t02U8",
                    order: 1,
                  },
                  {
                    title: "ملف تشغيل Docker Compose وتوصيل قواعد البيانات (PDF)",
                    description: "ملف شامل لتهيئة بيئات العمل والإنتاج السحابي.",
                    materialType: "PDF",
                    materialLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    order: 2,
                  },
                ],
              },
            ],
            enrollments: [
              { student: youssef, progress: 60.0, status: "ACTIVE", paid: 499.00 },
              { student: hassan, progress: 95.0, status: "ACTIVE", paid: 499.00 },
              { student: karim, progress: 40.0, status: "ACTIVE", paid: 499.00 },
            ],
            reviews: [
              {
                student: hassan,
                rating: 5,
                comment: "محتوى نادر وعميق جداً باللغة العربية! شرح الـ Saga Pattern والخدمات المصغرة مع NestJS ممتاز ومنظم لأقصى درجة.",
              },
              {
                student: youssef,
                rating: 5,
                comment: "استفدت جداً من قسم الـ Docker والـ Caching، الكورس ده نقل مستوى الـ Backend عندي نقلة نوعية.",
              },
            ],
          },

          // Course 3: Mobile UI/UX & Flutter Animations
          {
            teacherId: sayedTeacher.id,
            categoryId: designCat?.id ?? null,
            level: "BEGINNER",
            language: "arabic",
            name: "Mobile UI/UX Masterclass & Advanced Flutter Animations",
            description: "تعلم أسرار تحويل تصاميم Figma التفاعلية إلى شاشات فلاتر مذهلة مع أنيميشن سلس 60fps وتحسين تجربة وأداء المستخدم.",
            price: 249.00,
            totalHours: 32,
            status: "APPROVED",
            previewVideoUrl: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
            wallPaper: "uploads/teacherCourse/flutter-ui-animations.jpg",
            sections: [
              {
                name: "Section 1: تحويل تصاميم Figma إلى عناصر فلاتر تفاعلية",
                order: 1,
                items: [
                  {
                    title: "فنون الرسم المخصص واستخدام CustomPainter لبناء واجهات فريدة",
                    description: "رسم أشكال هندسية ورسوم بيانية مخصصة بدقة وكفاءة عالية.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
                    order: 1,
                  },
                  {
                    title: "التحريك المتقدم والأنيميشن التفاعلي Implicit & Explicit Animations",
                    description: "استخدام AnimationController و CurvedAnimation والـ Hero Transitions.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=VPvVD8t02U8",
                    order: 2,
                  },
                  {
                    title: "دليل التصميم المتجاوب Responsive UI لكافة مقاسات الشاشات (PDF)",
                    description: "إرشادات عملية لبناء واجهات تعمل بكفاءة على الموبايل والتابلت والويب.",
                    materialType: "PDF",
                    materialLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    order: 3,
                  },
                ],
              },
              {
                name: "Section 2: تدقيق الأداء وضمان تجربة 60fps خالية من التقطيع",
                order: 2,
                items: [
                  {
                    title: "فحص تسريبات الذاكرة والـ Rebuilds باستخدام Flutter DevTools",
                    description: "اكتشاف مشاكل الأداء ومعالجة الـ Jank لضمان نعومة وسرعة التطبيق.",
                    materialType: "VIDEO",
                    materialLink: "https://www.youtube.com/watch?v=Oe421EPjeBE",
                    order: 1,
                  },
                ],
              },
            ],
            enrollments: [
              { student: aya, progress: 100.0, status: "COMPLETED", paid: 249.00 },
              { student: nour, progress: 75.0, status: "ACTIVE", paid: 249.00 },
              { student: karim, progress: 35.0, status: "ACTIVE", paid: 249.00 },
            ],
            reviews: [
              {
                student: aya,
                rating: 5,
                comment: "كورس ممتع جداً والتصاميم غاية في الروعة، مستر سيد يشرح تفاصيل الأنيميشن والـ CustomPainter بأسلوب مبهر وسهل.",
              },
              {
                student: nour,
                rating: 5,
                comment: "التطبيقات العملية والأمثلة ممتازة، اتعلمت ازاي أحول أي تصميم Figma لكود حقيقي بدون تعقيد.",
              },
            ],
          },
        ]
      : []),
  ];

  const createdCourses = [];

  for (const courseData of teacherCoursesData) {
    const { sections, enrollments, reviews, ...courseFields } = courseData;

    // Check if teacher course with same name already exists for this teacher
    let course = await prisma.teacherCourse.findFirst({
      where: {
        teacherId: courseFields.teacherId,
        name: courseFields.name,
      },
      include: {
        sections: {
          include: {
            items: true,
            quiz: true,
          },
        },
      },
    });

    if (!course) {
      course = await prisma.teacherCourse.create({
        data: {
          ...courseFields,
          sections: {
            create: sections.map((section) => ({
              name: section.name,
              order: section.order,
              items: section.items?.length
                ? {
                    create: section.items.map((item) => ({
                      title: item.title,
                      description: item.description,
                      materialType: item.materialType,
                      materialLink: item.materialLink,
                      order: item.order,
                    })),
                  }
                : undefined,
            })),
          },
        },
        include: {
          sections: {
            include: {
              items: true,
            },
          },
        },
      });

      // Create quizzes if supported by the database
      for (const sectionData of sections) {
        if (sectionData.quiz) {
          const createdSection = course.sections?.find((s) => s.name === sectionData.name);
          if (createdSection) {
            try {
              const existingQuiz = await prisma.teacherCourseQuiz?.findUnique({
                where: { sectionId: createdSection.id },
              }).catch(() => null);

              if (!existingQuiz && prisma.teacherCourseQuiz) {
                await prisma.teacherCourseQuiz.create({
                  data: {
                    sectionId: createdSection.id,
                    title: sectionData.quiz.title,
                    description: sectionData.quiz.description,
                    duration: sectionData.quiz.duration,
                    passingScore: sectionData.quiz.passingScore,
                    questions: {
                      create: sectionData.quiz.questions.map((q) => ({
                        type: q.type,
                        text: q.text,
                        order: q.order,
                        options: q.options?.length
                          ? {
                              create: q.options.map((opt) => ({
                                text: opt.text,
                                isCorrect: opt.isCorrect,
                                order: opt.order,
                              })),
                            }
                          : undefined,
                      })),
                    },
                  },
                }).catch(() => {});
              }
            } catch (e) {
              // Quiz table might not exist in db, skip gracefully
            }
          }
        }
      }
    } else {
      // Update existing course fields (category, preview video, level, etc.)
      course = await prisma.teacherCourse.update({
        where: { id: course.id },
        data: {
          categoryId: courseFields.categoryId,
          previewVideoUrl: courseFields.previewVideoUrl,
          level: courseFields.level,
          language: courseFields.language,
          wallPaper: courseFields.wallPaper,
          description: courseFields.description,
          price: courseFields.price,
          totalHours: courseFields.totalHours,
          status: courseFields.status,
        },
        include: {
          sections: {
            include: { items: true },
          },
        },
      });
    }

    // Seed enrollments for this course if provided
    if (enrollments?.length && prisma.teacherCourseEnrollment) {
      for (const enr of enrollments) {
        if (!enr.student?.id) continue;
        try {
          await prisma.teacherCourseEnrollment.upsert({
            where: {
              studentId_courseId: {
                studentId: enr.student.id,
                courseId: course.id,
              },
            },
            update: {
              status: enr.status,
              progressPercent: enr.progress,
              paidAmount: enr.paid,
            },
            create: {
              studentId: enr.student.id,
              courseId: course.id,
              status: enr.status,
              progressPercent: enr.progress,
              paidAmount: enr.paid,
            },
          });
        } catch (err) {
          // Skip enrollment error gracefully
        }
      }
    }

    // Seed course reviews for this course if provided
    if (reviews?.length && prisma.teacherCourseReview) {
      for (const rev of reviews) {
        if (!rev.student?.id) continue;
        try {
          await prisma.teacherCourseReview.upsert({
            where: {
              studentId_courseId: {
                studentId: rev.student.id,
                courseId: course.id,
              },
            },
            update: {
              rating: rev.rating,
              comment: rev.comment,
              isHidden: false,
            },
            create: {
              studentId: rev.student.id,
              courseId: course.id,
              rating: rev.rating,
              comment: rev.comment,
              isHidden: false,
            },
          });
        } catch (err) {
          // Skip review error gracefully
        }
      }
    }

    // Recalculate stats for the course
    try {
      const enrollmentsCount = await prisma.teacherCourseEnrollment.count({
        where: { courseId: course.id },
      });
      const dbReviews = await prisma.teacherCourseReview.findMany({
        where: { courseId: course.id, isHidden: false },
        select: { rating: true },
      });
      const reviewsCount = dbReviews.length;
      const avgRating = reviewsCount
        ? Number((dbReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(2))
        : 0;

      const paidEnrollments = await prisma.teacherCourseEnrollment.findMany({
        where: { courseId: course.id },
        select: { paidAmount: true },
      });
      const totalRevenue = paidEnrollments.reduce((sum, e) => sum + Number(e.paidAmount || 0), 0);

      await prisma.teacherCourse.update({
        where: { id: course.id },
        data: {
          totalStudentsCount: enrollmentsCount,
          reviewsCount,
          avgRating,
          totalRevenue,
        },
      });
    } catch (e) {
      // Ignore if columns missing
    }

    createdCourses.push(course);
  }

  // Update totalCoursesCount & totalStudentsCount on teacher profiles
  for (const t of [ahmedTeacher, saraTeacher, omarTeacher, sayedTeacher].filter(Boolean)) {
    try {
      const count = await prisma.teacherCourse.count({
        where: { teacherId: t.id },
      });

      const teacherCourseIds = (
        await prisma.teacherCourse.findMany({
          where: { teacherId: t.id },
          select: { id: true },
        })
      ).map((c) => c.id);

      let uniqueStudents = 0;
      if (prisma.teacherCourseEnrollment && teacherCourseIds.length > 0) {
        const enrList = await prisma.teacherCourseEnrollment.findMany({
          where: { courseId: { in: teacherCourseIds } },
          distinct: ["studentId"],
          select: { studentId: true },
        });
        uniqueStudents = enrList.length;
      }

      await prisma.teacher.update({
        where: { id: t.id },
        data: {
          totalCoursesCount: count,
          totalStudentsCount: Math.max(uniqueStudents, 4),
        },
      });
    } catch (e) {}
  }

  console.log(`✅ Seeded ${createdCourses.length} teacher courses with sections, items & quizzes!`);
  return createdCourses;
}
