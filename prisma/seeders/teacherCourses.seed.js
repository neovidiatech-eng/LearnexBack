export async function seedTeacherCourses(prisma, teachers, categories = []) {
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

  let catList = categories;
  if (!catList || catList.length === 0) {
    catList = await prisma.category.findMany().catch(() => []);
  }

  const webCat = catList.find((c) => c.slug === "web-development") || catList[0];
  const mobileCat = catList.find((c) => c.slug === "mobile-development") || catList[1] || catList[0];
  const dataCat = catList.find((c) => c.slug === "data-science") || catList[2] || catList[0];

  const teacherCoursesData = [
    // ── Ahmed Hassan (Web Development) ──────────────────────────
    {
      teacherId: ahmedTeacher.id,
      categoryId: webCat?.id || null,
      name: "Advanced Full-Stack Next.js 14 & Node.js",
      description: "Master full-stack modern web development with Next.js 14 App Router, Server Actions, Prisma, and PostgreSQL.",
      price: 349.99,
      totalHours: 45,
      level: "ADVANCED",
      language: "english",
      provider: "TEACHER",
      previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      avgRating: 4.8,
      reviewsCount: 18,
      totalStudentsCount: 42,
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
              materialLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
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
              {
                type: "WRITTEN",
                text: "Explain the difference between Server Actions and API Route handlers in Next.js 14.",
                order: 3,
                options: [],
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
              materialLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              order: 1,
            },
          ],
        },
      ],
    },
    {
      teacherId: ahmedTeacher.id,
      categoryId: webCat?.id || null,
      name: "Modern TypeScript & Microservices with NestJS",
      description: "Build robust, scalable enterprise microservices using TypeScript, NestJS, RabbitMQ, and Redis.",
      price: 299.99,
      totalHours: 35,
      level: "INTERMEDIATE",
      language: "english",
      provider: "TEACHER",
      previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      avgRating: 4.7,
      reviewsCount: 12,
      totalStudentsCount: 29,
      status: "APPROVED",
      wallPaper: "uploads/teacherCourse/nestjs-microservices.jpg",
      sections: [
        {
          name: "Section 1: Advanced TypeScript Generics & Types",
          order: 1,
          items: [
            {
              title: "TypeScript Type Narrowing & Utility Types",
              description: "Deep dive into conditional types, mapped types, and inference.",
              materialType: "VIDEO",
              materialLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              order: 1,
            },
          ],
        },
      ],
    },

    // ── Sara Ibrahim (Data Science) ─────────────────────────────
    {
      teacherId: saraTeacher.id,
      categoryId: dataCat?.id || null,
      name: "Applied Machine Learning with Python & PyTorch",
      description: "From data preprocessing to training deep neural networks and deploying machine learning models in production.",
      price: 499.99,
      totalHours: 50,
      level: "ADVANCED",
      language: "english",
      provider: "TEACHER",
      previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      avgRating: 4.9,
      reviewsCount: 25,
      totalStudentsCount: 68,
      status: "APPROVED",
      wallPaper: "uploads/teacherCourse/pytorch-ml.jpg",
      sections: [
        {
          name: "Section 1: Supervised Learning & Model Evaluation",
          order: 1,
          items: [
            {
              title: "Linear & Logistic Regression Deep Dive",
              description: "Mathematical intuition and Python Scikit-learn implementation.",
              materialType: "VIDEO",
              materialLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              order: 1,
            },
            {
              title: "Machine Learning Math & Formula Handbook",
              description: "Reference PDF with all algorithms and optimization techniques.",
              materialType: "PDF",
              materialLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              order: 2,
            },
          ],
          quiz: {
            title: "Supervised Learning Fundamentals Quiz",
            description: "Assess your understanding of regression and classification models.",
            duration: 20,
            passingScore: 75,
            questions: [
              {
                type: "MCQ",
                text: "Which loss function is commonly used for binary classification?",
                order: 1,
                options: [
                  { text: "Binary Cross-Entropy (Log Loss)", isCorrect: true, order: 1 },
                  { text: "Mean Squared Error (MSE)", isCorrect: false, order: 2 },
                  { text: "Mean Absolute Error (MAE)", isCorrect: false, order: 3 },
                ],
              },
              {
                type: "TRUE_FALSE",
                text: "Overfitting occurs when a model performs well on training data but poorly on unseen test data.",
                order: 2,
                options: [
                  { text: "True", isCorrect: true, order: 1 },
                  { text: "False", isCorrect: false, order: 2 },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      teacherId: saraTeacher.id,
      categoryId: dataCat?.id || null,
      name: "Generative AI & LLM Fine-Tuning Bootcamp",
      description: "Learn how to build RAG systems, fine-tune open source LLMs with LoRA, and deploy AI agents using LangChain.",
      price: 599.99,
      totalHours: 40,
      level: "INTERMEDIATE",
      language: "english",
      provider: "TEACHER",
      previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      avgRating: 0.0,
      reviewsCount: 0,
      totalStudentsCount: 0,
      status: "PENDING",
      wallPaper: "uploads/teacherCourse/genai-llm.jpg",
      sections: [
        {
          name: "Section 1: Transformers & Attention Mechanisms",
          order: 1,
          items: [
            {
              title: "Understanding Self-Attention and Transformer Architecture",
              description: "Visual explanation of the paper 'Attention Is All You Need'.",
              materialType: "VIDEO",
              materialLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
              order: 1,
            },
          ],
        },
      ],
    },

    // ── Omar Ali (Mobile Development) ───────────────────────────
    {
      teacherId: omarTeacher.id,
      categoryId: mobileCat?.id || null,
      name: "Flutter & Dart: Zero to App Store Production",
      description: "Build clean, reactive cross-platform mobile apps with Flutter, Bloc state management, Firebase, and REST APIs.",
      price: 279.99,
      totalHours: 38,
      level: "BEGINNER",
      language: "arabic",
      provider: "TEACHER",
      previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      avgRating: 4.6,
      reviewsCount: 14,
      totalStudentsCount: 31,
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
              materialLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
              order: 1,
            },
            {
              title: "Dart Syntax Cheat Sheet",
              description: "Quick reference PDF for Dart 3 syntax and records.",
              materialType: "PDF",
              materialLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              order: 2,
            },
          ],
          quiz: {
            title: "Dart Core Concepts Quiz",
            description: "Validate your Dart 3 and OOP comprehension.",
            duration: 15,
            passingScore: 70,
            questions: [
              {
                type: "MCQ",
                text: "What return type is used for async single-value functions in Dart?",
                order: 1,
                options: [
                  { text: "Future<T>", isCorrect: true, order: 1 },
                  { text: "Stream<T>", isCorrect: false, order: 2 },
                  { text: "Promise<T>", isCorrect: false, order: 3 },
                ],
              },
              {
                type: "TRUE_FALSE",
                text: "In Flutter, StatelessWidget can rebuild itself dynamically when internal state variables change.",
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
          name: "Section 2: Clean Architecture & Bloc State Management",
          order: 2,
          items: [
            {
              title: "Implementing BLoC with Equatable",
              description: "Separation of business logic from UI presentation layer.",
              materialType: "VIDEO",
              materialLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
              order: 1,
            },
          ],
        },
      ],
    },
    ...(sayedTeacher
      ? [
          {
            teacherId: sayedTeacher.id,
            categoryId: mobileCat?.id || null,
            name: "Mastering Clean Architecture in Flutter & Node.js",
            description: "A production-grade guide to building scalable, enterprise mobile applications with Flutter, Bloc, and scalable Node.js microservices.",
            price: 499.99,
            totalHours: 50,
            level: "ADVANCED",
            language: "arabic",
            provider: "TEACHER",
            previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
            avgRating: 4.9,
            reviewsCount: 30,
            totalStudentsCount: 85,
            status: "APPROVED",
            wallPaper: "uploads/teacherCourse/clean-architecture-flutter.jpg",
            sections: [
              {
                name: "Section 1: Enterprise System Design & Clean Architecture",
                order: 1,
                items: [
                  {
                    title: "Clean Architecture Principles & Layers",
                    description: "Separation of concerns: Domain, Data, and Presentation layers in Flutter.",
                    materialType: "VIDEO",
                    materialLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    order: 1,
                  },
                  {
                    title: "Architecture Blueprint & Cheatsheet (PDF)",
                    description: "Downloadable PDF guide with folder structures and dependency injection maps.",
                    materialType: "PDF",
                    materialLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    order: 2,
                  },
                ],
                quiz: {
                  title: "Architecture Fundamentals Assessment",
                  description: "Validate your understanding of Clean Architecture boundaries.",
                  duration: 20,
                  passingScore: 80,
                  questions: [
                    {
                      type: "MCQ",
                      text: "In Clean Architecture, which layer should NEVER depend on external frameworks?",
                      order: 1,
                      options: [
                        { text: "Domain Layer", isCorrect: true, order: 1 },
                        { text: "Data Layer", isCorrect: false, order: 2 },
                        { text: "Presentation Layer", isCorrect: false, order: 3 },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ]
      : []),
  ];

  const createdCourses = [];

  for (const courseData of teacherCoursesData) {
    const { sections, ...courseFields } = courseData;

    // Check if teacher course with same name already exists for this teacher
    let course = await prisma.teacherCourse.findFirst({
      where: {
        teacherId: courseFields.teacherId,
        name: courseFields.name,
      },
      include: {
        sections: true,
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
      // Update existing course with categories and filters metadata
      course = await prisma.teacherCourse.update({
        where: { id: course.id },
        data: {
          categoryId: courseFields.categoryId,
          level: courseFields.level,
          language: courseFields.language,
          previewVideoUrl: courseFields.previewVideoUrl,
          provider: courseFields.provider,
          avgRating: courseFields.avgRating,
          reviewsCount: courseFields.reviewsCount,
          totalStudentsCount: courseFields.totalStudentsCount,
        },
        include: {
          sections: {
            include: {
              items: true,
            },
          },
        },
      });
    }

    createdCourses.push(course);
  }

  // Update totalCoursesCount on teacher profile
  for (const t of [ahmedTeacher, saraTeacher, omarTeacher, sayedTeacher].filter(Boolean)) {
    const count = await prisma.teacherCourse.count({
      where: { teacherId: t.id },
    });
    await prisma.teacher.update({
      where: { id: t.id },
      data: { totalCoursesCount: count },
    });
  }

  console.log(`✅ Seeded ${createdCourses.length} teacher courses with sections, items & quizzes!`);
  return createdCourses;
}
