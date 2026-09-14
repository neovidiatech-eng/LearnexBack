import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS_V2 } from "../src/Constants/permissions.constants.js";
import { ROLES } from "../src/utils/Permissions/permissions.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Full Database Seeding with Translations, Student & Teacher Models...");

  const saltRounds = Number(process.env.SALT) || 10;
  const defaultPasswordHash = bcrypt.hashSync("Password@123!", saltRounds);

  // ==========================================
  // 1. SEED PERMISSIONS
  // ==========================================
  console.log("📌 Step 1: Seeding Permissions...");
  const permissionsList = [];
  for (const [resourceKey, actions] of Object.entries(PERMISSIONS_V2)) {
    if (typeof actions === "object" && actions !== null) {
      for (const [actionKey, code] of Object.entries(actions)) {
        if (typeof code === "string" && code.includes(":")) {
          const [resource, action] = code.split(":");
          permissionsList.push({
            code,
            name: `${actionKey.toLowerCase().replace(/_/g, " ")} ${resourceKey.toLowerCase().replace(/_/g, " ")}`,
            resource: resource || resourceKey.toLowerCase(),
            action: action || actionKey.toLowerCase(),
          });
        }
      }
    }
  }

  const seededPermissions = [];
  for (const perm of permissionsList) {
    const record = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
      },
      create: {
        code: perm.code,
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
      },
    });
    seededPermissions.push(record);
  }
  console.log(`✅ Upserted ${seededPermissions.length} permissions.`);

  // ==========================================
  // 2. SEED ROLES
  // ==========================================
  console.log("📌 Step 2: Seeding Roles...");
  const rolesToCreate = [
    { name: ROLES.SUPER_ADMIN, description: "Super Administrator with full unrestricted access", isSystem: true },
    { name: ROLES.ADMIN, description: "Standard Administrator", isSystem: true },
    { name: ROLES.TEACHER, description: "Teacher / Instructor", isSystem: true },
    { name: ROLES.STUDENT, description: "Enrolled Student", isSystem: true },
    { name: "staff", description: "Support / Staff Member", isSystem: true },
    { name: "parent", description: "Parent / Guardian", isSystem: true },
  ];

  const seededRoles = {};
  for (const r of rolesToCreate) {
    const roleRecord = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description, isSystem: r.isSystem },
    });
    seededRoles[r.name] = roleRecord;
  }
  console.log("✅ Roles created:", Object.keys(seededRoles).join(", "));

  // ==========================================
  // 3. LINK PERMISSIONS TO SUPER_ADMIN & ADMIN
  // ==========================================
  console.log("📌 Step 3: Linking Role Permissions...");
  for (const perm of seededPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: seededRoles[ROLES.SUPER_ADMIN].id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: seededRoles[ROLES.SUPER_ADMIN].id,
        permissionId: perm.id,
      },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: seededRoles[ROLES.ADMIN].id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: seededRoles[ROLES.ADMIN].id,
        permissionId: perm.id,
      },
    });
  }
  console.log("✅ Linked all permissions to super_admin and admin.");

  // ==========================================
  // 4. SEED ADMIN ACCOUNT
  // ==========================================
  console.log("📌 Step 4: Seeding Default Admin...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@learnx.com";
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      fullName: "Super Admin",
      password: defaultPasswordHash,
    },
    create: {
      email: adminEmail,
      fullName: "Super Admin",
      password: defaultPasswordHash,
    },
  });
  console.log(`✅ Default admin synced: ${adminEmail}`);

  // ==========================================
  // 5. SEED CATEGORIES (WITH TRANSLATIONS & IMAGES)
  // ==========================================
  console.log("📌 Step 5: Seeding Categories with Translations...");
  const categoriesData = [
    {
      slug: "web-development",
      image: "uploads/categories/web-dev.png",
      translations: [
        { locale: "en", name: "Web Development", description: "Learn frontend, backend, fullstack and modern web technologies." },
        { locale: "ar", name: "تطوير الويب", description: "تعلم الواجهات الأمامية والخلفية وتطوير الويب الشامل بأحدث التقنيات." },
      ],
    },
    {
      slug: "computer-science",
      image: "uploads/categories/cs.png",
      translations: [
        { locale: "en", name: "Computer Science", description: "Algorithms, data structures, architectures and core computing concepts." },
        { locale: "ar", name: "علوم الحاسب", description: "الخوارزميات وهياكل البيانات والبنية المعمارية والمفاهيم الأساسية للحاسوب." },
      ],
    },
    {
      slug: "data-science-ai",
      image: "uploads/categories/ai.png",
      translations: [
        { locale: "en", name: "Data Science & AI", description: "Machine learning, deep learning, Python, data analysis and visualization." },
        { locale: "ar", name: "علم البيانات والذكاء الاصطناعي", description: "تعلم الآلة والتعلم العميق وبايثون وتحليل البيانات وتصورها." },
      ],
    },
    {
      slug: "mobile-development",
      image: "uploads/categories/mobile.png",
      translations: [
        { locale: "en", name: "Mobile Development", description: "iOS and Android apps using Flutter, React Native, Swift and Kotlin." },
        { locale: "ar", name: "تطوير تطبيقات الموبايل", description: "تطبيقات أندرويد و iOS باستخدام فلاتر ورياكت نيتف وسويفت وكوتلن." },
      ],
    },
    {
      slug: "ui-ux-design",
      image: "uploads/categories/uiux.png",
      translations: [
        { locale: "en", name: "UI/UX Design", description: "Design systems, Figma, user research, wireframing and prototyping." },
        { locale: "ar", name: "تصميم واجهات وتجربة المستخدم", description: "أنظمة التصميم وفيجما وأبحاث المستخدم وبناء النماذج التفاعلية." },
      ],
    },
    {
      slug: "business-marketing",
      image: "uploads/categories/business.png",
      translations: [
        { locale: "en", name: "Business & Marketing", description: "Digital marketing, SEO, project management and tech leadership." },
        { locale: "ar", name: "إدارة الأعمال والتسويق", description: "التسويق الرقمي والسيو وإدارة المشاريع والقيادة التقنية." },
      ],
    },
  ];

  const seededCategories = {};
  for (const cat of categoriesData) {
    let categoryRecord = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          slug: cat.slug,
          image: cat.image,
          translations: {
            create: cat.translations,
          },
        },
      });
    } else {
      categoryRecord = await prisma.category.update({
        where: { id: categoryRecord.id },
        data: {
          image: cat.image,
        },
      });
      // Upsert translations
      for (const t of cat.translations) {
        await prisma.categoryTranslation.upsert({
          where: {
            categoryId_locale: {
              categoryId: categoryRecord.id,
              locale: t.locale,
            },
          },
          update: {
            name: t.name,
            description: t.description,
          },
          create: {
            categoryId: categoryRecord.id,
            locale: t.locale,
            name: t.name,
            description: t.description,
          },
        });
      }
    }
    seededCategories[cat.slug] = categoryRecord;
  }
  console.log(`✅ Upserted ${Object.keys(seededCategories).length} Categories with Translations.`);

  // ==========================================
  // 6. SEED TEACHERS
  // ==========================================
  console.log("📌 Step 6: Seeding Teachers with separate Teacher model...");
  const teachersData = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@learnx.com",
      phone: "+1 (555) 123-4567",
      country: "United States",
      subject: "Computer Science",
      experienceYears: 8,
      bio: "Senior Computer Science Professor & Algorithms Specialist with a passion for teaching.",
      linkedinUrl: "https://www.linkedin.com/in/johndoe",
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
    {
      firstName: "Sarah",
      lastName: "Connor",
      email: "sarah.connor@learnx.com",
      phone: "+1 (555) 234-5678",
      country: "Canada",
      subject: "Web Development",
      experienceYears: 6,
      bio: "Full-Stack Engineer, React core enthusiast, and passionate mentor.",
      linkedinUrl: "https://www.linkedin.com/in/sarahconnor",
      profilePhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    },
    {
      firstName: "Michael",
      lastName: "Smith",
      email: "michael.smith@learnx.com",
      phone: "+1 (555) 345-6789",
      country: "United Kingdom",
      subject: "Data Science & AI",
      experienceYears: 10,
      bio: "Lead AI Researcher and Data Scientist specializing in Deep Learning & LLMs.",
      linkedinUrl: "https://www.linkedin.com/in/michaelsmith",
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    {
      firstName: "Emily",
      lastName: "Blunt",
      email: "emily.blunt@learnx.com",
      phone: "+1 (555) 456-7890",
      country: "Germany",
      subject: "UI/UX Design",
      experienceYears: 4,
      bio: "Product Designer and Design Systems Architect working with Fortune 500 companies.",
      linkedinUrl: "https://www.linkedin.com/in/emilyblunt",
      profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
    {
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex.johnson@learnx.com",
      phone: "+1 (555) 567-8901",
      country: "Australia",
      subject: "Mobile Development",
      experienceYears: 7,
      bio: "Mobile App Architect with 50+ published iOS and Android apps.",
      linkedinUrl: "https://www.linkedin.com/in/alexjohnson",
      profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
  ];

  const seededTeachers = [];
  for (const t of teachersData) {
    const teacherUser = await prisma.user.upsert({
      where: { email: t.email },
      update: {
        firstName: t.firstName,
        lastName: t.lastName,
        phone: t.phone,
        country: t.country,
        profilePhoto: t.profilePhoto,
        roleId: seededRoles[ROLES.TEACHER].id,
        status: "ACTIVE",
        confirmEmail: new Date(),
        teacher: {
          upsert: {
            create: {
              subject: t.subject,
              experienceYears: t.experienceYears,
              bio: t.bio,
              linkedinUrl: t.linkedinUrl,
            },
            update: {
              subject: t.subject,
              experienceYears: t.experienceYears,
              bio: t.bio,
              linkedinUrl: t.linkedinUrl,
            },
          },
        },
      },
      create: {
        email: t.email,
        password: defaultPasswordHash,
        firstName: t.firstName,
        lastName: t.lastName,
        phone: t.phone,
        country: t.country,
        profilePhoto: t.profilePhoto,
        roleId: seededRoles[ROLES.TEACHER].id,
        status: "ACTIVE",
        provider: "SYSTEM",
        confirmEmail: new Date(),
        teacher: {
          create: {
            subject: t.subject,
            experienceYears: t.experienceYears,
            bio: t.bio,
            linkedinUrl: t.linkedinUrl,
          },
        },
      },
    });
    seededTeachers.push(teacherUser);
  }
  console.log(`✅ Upserted ${seededTeachers.length} Teachers.`);

  // ==========================================
  // 7. SEED STUDENTS
  // ==========================================
  console.log("📌 Step 7: Seeding Students with separate Student model...");
  const studentsData = [
    { firstName: "Esraa", lastName: "Mohamed", email: "esraamatouq102@gmail.com", phone: "+20 155 104 9669", country: "Egypt", dateOfBirth: "2000-05-15", notes: "Top performing student" },
    { firstName: "Omar", lastName: "Farooq", email: "omar.farooq@example.com", phone: "+20 100 123 4567", country: "Egypt", dateOfBirth: "2001-08-20", notes: "Enrolled in computer science courses" },
    { firstName: "Youssef", lastName: "Ali", email: "youssef.ali@example.com", phone: "+966 50 123 4567", country: "Saudi Arabia", dateOfBirth: "1999-11-10", notes: "Fullstack enthusiast" },
    { firstName: "Mariam", lastName: "Hassan", email: "mariam.hassan@example.com", phone: "+971 50 234 5678", country: "UAE", dateOfBirth: "2002-02-25", notes: "Design and frontend learner" },
    { firstName: "Karim", lastName: "Adel", email: "karim.adel@example.com", phone: "+20 111 987 6543", country: "Egypt", dateOfBirth: "2000-09-30", notes: "Mobile development track" },
    { firstName: "Nour", lastName: "Ibrahim", email: "nour.ibrahim@example.com", phone: "+962 7 9123 4567", country: "Jordan", dateOfBirth: "2001-12-05", notes: "AI and Data Science track" },
    { firstName: "David", lastName: "Miller", email: "david.miller@example.com", phone: "+1 (555) 789-0123", country: "United States", dateOfBirth: "1998-04-18", notes: "Software Engineer student" },
    { firstName: "Sophia", lastName: "Taylor", email: "sophia.taylor@example.com", phone: "+44 20 7946 0912", country: "United Kingdom", dateOfBirth: "1999-07-22", notes: "UI UX student" },
  ];

  const seededStudents = [];
  for (const s of studentsData) {
    const studentUser = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        country: s.country,
        roleId: seededRoles[ROLES.STUDENT].id,
        status: "ACTIVE",
        confirmEmail: new Date(),
        student: {
          upsert: {
            create: {
              dateOfBirth: new Date(s.dateOfBirth),
              notes: s.notes,
            },
            update: {
              dateOfBirth: new Date(s.dateOfBirth),
              notes: s.notes,
            },
          },
        },
      },
      create: {
        email: s.email,
        password: defaultPasswordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        country: s.country,
        roleId: seededRoles[ROLES.STUDENT].id,
        status: "ACTIVE",
        provider: "SYSTEM",
        confirmEmail: new Date(),
        student: {
          create: {
            dateOfBirth: new Date(s.dateOfBirth),
            notes: s.notes,
          },
        },
      },
    });
    seededStudents.push(studentUser);
  }
  console.log(`✅ Upserted ${seededStudents.length} Students.`);

  // ==========================================
  // 8. SEED COURSES (WITH TRANSLATIONS)
  // ==========================================
  console.log("📌 Step 8: Seeding Courses with Translations...");
  const coursesData = [
    {
      slug: "complete-web-development-bootcamp",
      titleEn: "Complete Web Development Bootcamp 2026",
      titleAr: "المعسكر الشامل لتطوير الويب 2026",
      descEn: "Master HTML, CSS, JavaScript, Node.js, Express, MongoDB, and React with hands-on projects.",
      descAr: "احترف بناء المواقع والتطبيقات باستخدام أحدث تقنيات الويب والرياكت والنود مع مشاريع عملية.",
      categoryId: seededCategories["web-development"].id,
      instructorId: seededTeachers[1].id, // Sarah Connor
      level: "BEGINNER",
      status: "PUBLISHED",
      originalPrice: 99.99,
      salePrice: 49.99,
      durationHours: 42,
      totalLessonsCount: 28,
      avgRating: 4.8,
      reviewsCount: 15,
      totalStudentsCount: 32,
      tags: ["web", "fullstack", "react", "nodejs"],
      whatYouWillLearnEn: ["Build modern web apps", "Master JavaScript ES6+", "RESTful APIs", "Fullstack deployment"],
      whatYouWillLearnAr: ["بناء تطبيقات ويب حديثة", "إتقان الجافاسكريبت المتقدمة", "بناء RESTful APIs", "نشر المشاريع الكاملة"],
      requirementsEn: ["Basic computer skills", "No prior coding required"],
      requirementsAr: ["مهارات حاسوبية أساسية", "لا تتطلب خبرة برمجية سابقة"],
    },
    {
      slug: "data-structures-algorithms-javascript",
      titleEn: "Data Structures & Algorithms in JavaScript",
      titleAr: "هياكل البيانات والخوارزميات في جافاسكريبت",
      descEn: "Comprehensive guide to Arrays, Linked Lists, Trees, Graphs, Sorting, and Dynamic Programming.",
      descAr: "دليل شامل للمصفوفات والقوائم المترابطة والأشجار والرسومات البيانية والبرمجة الديناميكية.",
      categoryId: seededCategories["computer-science"].id,
      instructorId: seededTeachers[0].id, // John Doe
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      originalPrice: 79.99,
      salePrice: 39.99,
      durationHours: 35,
      totalLessonsCount: 22,
      avgRating: 4.9,
      reviewsCount: 20,
      totalStudentsCount: 45,
      tags: ["algorithms", "datastructures", "coding-interview"],
      whatYouWillLearnEn: ["Crack tech interviews", "Analyze Big O notation", "Tree & Graph traversals"],
      whatYouWillLearnAr: ["اجتياز المقابلات التقنية", "تحليل تعقيد الخوارزميات Big O", "التنقل في الأشجار والرسوم البيانية"],
      requirementsEn: ["Basic JavaScript knowledge"],
      requirementsAr: ["معرفة أساسية بلغة جافاسكريبت"],
    },
    {
      slug: "machine-learning-ai-masterclass",
      titleEn: "Machine Learning & AI Masterclass",
      titleAr: "دورة الذكاء الاصطناعي وتعلم الآلة الشاملة",
      descEn: "From Linear Regression to Transformers and LLMs. Practical AI engineering with Python & PyTorch.",
      descAr: "من الانحدار الخطي إلى نماذج المحولات والنماذج اللغوية الضخمة مع بايثون وباي تورش.",
      categoryId: seededCategories["data-science-ai"].id,
      instructorId: seededTeachers[2].id, // Michael Smith
      level: "ADVANCED",
      status: "PUBLISHED",
      originalPrice: 129.99,
      salePrice: 69.99,
      durationHours: 50,
      totalLessonsCount: 34,
      avgRating: 4.7,
      reviewsCount: 18,
      totalStudentsCount: 28,
      tags: ["ai", "machine-learning", "python", "pytorch"],
      whatYouWillLearnEn: ["Train ML models", "Deep Learning architectures", "Fine-tune LLMs"],
      whatYouWillLearnAr: ["تدريب نماذج تعلم الآلة", "معماريات التعلم العميق", "ضبط النماذج اللغوية الكبيرة"],
      requirementsEn: ["Python basics", "Calculus & Linear Algebra basics"],
      requirementsAr: ["أساسيات بايثون", "أساسيات الجبر الخطي والتفاضل"],
    },
    {
      slug: "modern-ui-ux-design-figma",
      titleEn: "Modern UI/UX Design with Figma",
      titleAr: "تصميم واجهات وتجربة المستخدم مع فيجما",
      descEn: "Design stunning mobile apps and web applications from wireframes to high-fidelity prototypes.",
      descAr: "صمم تطبيقات ويب وموبايل جذابة واحترافية من المخططات الأولية حتى النماذج التفاعلية النهائية.",
      categoryId: seededCategories["ui-ux-design"].id,
      instructorId: seededTeachers[3].id, // Emily Blunt
      level: "BEGINNER",
      status: "PUBLISHED",
      originalPrice: 59.99,
      salePrice: 29.99,
      durationHours: 24,
      totalLessonsCount: 16,
      avgRating: 4.6,
      reviewsCount: 12,
      totalStudentsCount: 23,
      tags: ["figma", "ui", "ux", "design"],
      whatYouWillLearnEn: ["Figma components & auto-layout", "Design systems", "User testing & prototyping"],
      whatYouWillLearnAr: ["مكونات فيجما والمحاذاة التلقائية", "أنظمة التصميم الاحترافية", "اختبار تجربة المستخدم"],
      requirementsEn: ["Figma account (free)"],
      requirementsAr: ["حساب فيجما مجاني"],
    },
    {
      slug: "flutter-dart-cross-platform",
      titleEn: "Flutter & Dart: Cross-Platform Mobile Apps",
      titleAr: "فلاتر ودارت: بناء تطبيقات الموبايل متعددة المنصات",
      descEn: "Build iOS and Android mobile apps using a single codebase with Flutter and Dart.",
      descAr: "ابنِ تطبيقات متكاملة تعمل على آيفون وأندرويد بكود واحد موحد باستخدام فلاتر ودارت.",
      categoryId: seededCategories["mobile-development"].id,
      instructorId: seededTeachers[4].id, // Alex Johnson
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      originalPrice: 89.99,
      salePrice: 44.99,
      durationHours: 38,
      totalLessonsCount: 25,
      avgRating: 4.8,
      reviewsCount: 14,
      totalStudentsCount: 30,
      tags: ["flutter", "dart", "mobile", "ios", "android"],
      whatYouWillLearnEn: ["State Management with Bloc/Provider", "Clean Architecture", "Publishing to App Stores"],
      whatYouWillLearnAr: ["إدارة الحالة مع Bloc و Provider", "المعمارية النظيفة Clean Architecture", "النشر على المتاجر"],
      requirementsEn: ["Basic programming logic"],
      requirementsAr: ["المفاهيم البرمجية الأساسية"],
    },
    {
      slug: "advanced-nodejs-microservices",
      titleEn: "Advanced Node.js & Microservices Architecture",
      titleAr: "نود جي إس المتقدم والمعمارية المصغرة Microservices",
      descEn: "Build scalable microservices, Docker containers, RabbitMQ queues, and Redis caching.",
      descAr: "بناء أنظمة خلفية ضخمة وقابلة للتوسع باستخدام دوكر، رابيت إم كيو، والتخزين المؤقت بريديس.",
      categoryId: seededCategories["web-development"].id,
      instructorId: seededTeachers[1].id, // Sarah Connor
      level: "ADVANCED",
      status: "PUBLISHED",
      originalPrice: 109.99,
      salePrice: 59.99,
      durationHours: 30,
      totalLessonsCount: 20,
      avgRating: 4.9,
      reviewsCount: 10,
      totalStudentsCount: 25,
      tags: ["nodejs", "microservices", "docker", "redis"],
      whatYouWillLearnEn: ["Event-driven architecture", "Microservices communication", "Distributed caching"],
      whatYouWillLearnAr: ["المعمارية الموجهة بالأحداث Event-Driven", "تواصل الخدمات المصغرة", "الكاش الموزع"],
      requirementsEn: ["Good knowledge of Node.js and Express"],
      requirementsAr: ["معرفة جيدة بلغة نود وإكسبريس"],
    },
  ];

  const seededCourses = [];
  for (const c of coursesData) {
    const existingTranslation = await prisma.courseTranslation.findFirst({
      where: { title: c.titleEn, locale: "en" },
      include: { course: true },
    });

    if (!existingTranslation) {
      const courseRecord = await prisma.course.create({
        data: {
          categoryId: c.categoryId,
          instructorId: c.instructorId,
          level: c.level,
          status: c.status,
          originalPrice: c.originalPrice,
          salePrice: c.salePrice,
          durationHours: c.durationHours,
          totalLessonsCount: c.totalLessonsCount,
          avgRating: c.avgRating,
          reviewsCount: c.reviewsCount,
          totalStudentsCount: c.totalStudentsCount,
          tags: c.tags,
          whatYouWillLearn: c.whatYouWillLearnEn,
          requirements: c.requirementsEn,
          translations: {
            create: [
              {
                locale: "en",
                title: c.titleEn,
                description: c.descEn,
                whatYouWillLearn: c.whatYouWillLearnEn,
                requirements: c.requirementsEn,
              },
              {
                locale: "ar",
                title: c.titleAr,
                description: c.descAr,
                whatYouWillLearn: c.whatYouWillLearnAr,
                requirements: c.requirementsAr,
              },
            ],
          },
          sections: {
            create: [
              {
                order: 1,
                translations: {
                  create: [
                    { locale: "en", title: "Introduction & Fundamentals" },
                    { locale: "ar", title: "المقدمة والأساسيات" },
                  ],
                },
                lessons: {
                  create: [
                    {
                      durationMinutes: 10,
                      order: 1,
                      isFreePreview: true,
                      translations: {
                        create: [
                          { locale: "en", title: "Course Overview & Roadmap", description: "Course overview" },
                          { locale: "ar", title: "نظرة عامة على الكورس وخارطة الطريق", description: "مقدمة شاملة" },
                        ],
                      },
                    },
                    {
                      durationMinutes: 25,
                      order: 2,
                      isFreePreview: true,
                      translations: {
                        create: [
                          { locale: "en", title: "Setting Up Development Environment", description: "Tools and IDE setup" },
                          { locale: "ar", title: "إعداد بيئة التطوير", description: "تثبيت الأدوات وبيئة العمل" },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                order: 2,
                translations: {
                  create: [
                    { locale: "en", title: "Hands-on Project Building" },
                    { locale: "ar", title: "بناء المشاريع العملية" },
                  ],
                },
                lessons: {
                  create: [
                    {
                      durationMinutes: 40,
                      order: 1,
                      isFreePreview: false,
                      translations: {
                        create: [
                          { locale: "en", title: "Designing the Architecture", description: "Architecture planning" },
                          { locale: "ar", title: "تصميم المعمارية البرمجية", description: "تخطيط المعمارية" },
                        ],
                      },
                    },
                    {
                      durationMinutes: 55,
                      order: 2,
                      isFreePreview: false,
                      translations: {
                        create: [
                          { locale: "en", title: "Implementing Core Features", description: "Core feature coding" },
                          { locale: "ar", title: "برمجة الميزات الأساسية", description: "تطبيق الخصائص" },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      });
      seededCourses.push(courseRecord);
    } else {
      seededCourses.push(existingTranslation.course);
    }
  }
  console.log(`✅ Upserted ${seededCourses.length} Courses with Sections, Lessons & Translations.`);

  // ==========================================
  // 9. SEED COURSE ENROLLMENTS & REVIEWS
  // ==========================================
  console.log("📌 Step 9: Seeding Enrollments & Reviews...");
  for (let i = 0; i < seededStudents.length; i++) {
    const studentUser = seededStudents[i];
    const enrolledCourses = [seededCourses[i % seededCourses.length], seededCourses[(i + 1) % seededCourses.length]];

    for (const course of enrolledCourses) {
      await prisma.courseEnrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: studentUser.id,
            courseId: course.id,
          },
        },
        update: {},
        create: {
          studentId: studentUser.id,
          courseId: course.id,
          status: "ACTIVE",
          progressPercent: (i + 1) * 15 > 100 ? 100 : (i + 1) * 15,
          paidAmount: course.salePrice || course.originalPrice,
        },
      });

      await prisma.courseReview.upsert({
        where: {
          studentId_courseId: {
            studentId: studentUser.id,
            courseId: course.id,
          },
        },
        update: {},
        create: {
          studentId: studentUser.id,
          courseId: course.id,
          rating: 5 - (i % 2),
          comment: "Excellent course! The explanations are clear, practical and multi-language support is great.",
        },
      });
    }
  }
  console.log("✅ Seeded Enrollments and Reviews for Students.");

  console.log("\n🎉 =========================================");
  console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("🎉 =========================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
