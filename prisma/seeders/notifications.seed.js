export async function seedNotifications(prisma, students = [], teachers = [], admin = null) {
  console.log("🌱 Seeding notifications...");

  // Fetch students, teachers, admin if not supplied
  if (!students.length) {
    students = await prisma.user.findMany({
      where: { student: { isNot: null } },
      take: 5,
    });
  }
  if (!teachers.length) {
    teachers = await prisma.user.findMany({
      where: { teacher: { isNot: null } },
      take: 5,
    });
  }
  if (!admin) {
    admin = await prisma.admin.findFirst();
  }

  // Clear existing notifications & translations to allow clean re-seeding
  await prisma.notificationTranslation.deleteMany({});
  await prisma.notification.deleteMany({});

  const student1Id = students[0]?.id || "student-1-id";
  const student2Id = students[1]?.id || "student-2-id";
  const teacher1Id = teachers[0]?.id || "teacher-1-id";
  const teacher2Id = teachers[1]?.id || "teacher-2-id";
  const adminId = admin?.id || "admin-id";

  const notificationsData = [
    // Global System Announcements (receiverId = "GLOBAL", receiverType = "SYSTEM")
    {
      receiverId: "GLOBAL",
      receiverType: "SYSTEM",
      type: "SYSTEM",
      priority: "HIGH",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      translations: [
        {
          locale: "en",
          title: "Scheduled System Maintenance",
          message: "The platform will undergo scheduled maintenance this Sunday from 2 AM to 4 AM UTC.",
        },
        {
          locale: "ar",
          title: "صيانة دورية للمنصة",
          message: "ستخضع المنصة لصيانة مبرمجة يوم الأحد القادم من الساعة 2 صباحاً حتى 4 صباحاً بتوقيت UTC.",
        },
      ],
    },
    {
      receiverId: "GLOBAL",
      receiverType: "SYSTEM",
      type: "PROMOTION",
      priority: "MEDIUM",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      translations: [
        {
          locale: "en",
          title: "New Learning Path Available!",
          message: "Explore our latest Full-Stack & AI learning paths with a 20% discount on enrollment.",
        },
        {
          locale: "ar",
          title: "مسار تعليمي جديد متوفر الآن!",
          message: "استكشف أحدث المسارات التعليمية للويب والذكاء الاصطناعي مع خصم 20% عند التسجيل.",
        },
      ],
    },

    // Admin Notifications
    ...(adminId
      ? [
          {
            receiverId: adminId,
            receiverType: "ADMIN",
            type: "SYSTEM",
            priority: "HIGH",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            translations: [
              {
                locale: "en",
                title: "New Teacher Registration Pending Approval",
                message: "A new teacher account has registered and requires admin review.",
              },
              {
                locale: "ar",
                title: "طلب انضمام معلم جديد بانتظار الموافقة",
                message: "قام معلم جديد بالتسجيل وينتظر مراجعة الأدمن.",
              },
            ],
          },
        ]
      : []),

    // Student 1 Notifications
    ...(student1Id
      ? [
          {
            receiverId: student1Id,
            receiverType: "USER",
            type: "ENROLLMENT",
            priority: "HIGH",
            isRead: true,
            readAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
            translations: [
              {
                locale: "en",
                title: "Welcome to Full-Stack Web Development",
                message: "Your enrollment is complete! You can now start watching lectures and working on projects.",
              },
              {
                locale: "ar",
                title: "مرحباً بك في دبلومة تطوير المواقع الكاملة",
                message: "تم اكتمال تسجيلك بنجاح! يمكنك الآن البدء في مشاهدة المحاضرات والعمل على المشاريع.",
              },
            ],
          },
          {
            receiverId: student1Id,
            receiverType: "USER",
            type: "COURSE_UPDATE",
            priority: "MEDIUM",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            translations: [
              {
                locale: "en",
                title: "New Quiz Released",
                message: "A new quiz on React Hooks has been added to Module 3.",
              },
              {
                locale: "ar",
                title: "تم نشر اختبار جديد",
                message: "تم إضافة اختبار جديد حول React Hooks في الوحدة الثالثة.",
              },
            ],
          },
        ]
      : []),

    // Student 2 Notifications
    ...(student2Id
      ? [
          {
            receiverId: student2Id,
            receiverType: "USER",
            type: "COURSE_UPDATE",
            priority: "HIGH",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            translations: [
              {
                locale: "en",
                title: "Assignment Deadline Reminder",
                message: "Your Data Science Project assignment is due in 24 hours.",
              },
              {
                locale: "ar",
                title: "تذكير بموعد تسليم المشروع",
                message: "الموعد النهائي لتسليم مشروع علوم البيانات ينتهي خلال 24 ساعة.",
              },
            ],
          },
        ]
      : []),

    // Teacher 1 Notifications
    ...(teacher1Id
      ? [
          {
            receiverId: teacher1Id,
            receiverType: "USER",
            type: "SYSTEM",
            priority: "HIGH",
            isRead: true,
            readAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            translations: [
              {
                locale: "en",
                title: "New Student Enrolled in Your Course",
                message: "A new student has enrolled in 'Full-Stack Web Development'.",
              },
              {
                locale: "ar",
                title: "طالب جديد انضم لدورتك التدريبية",
                message: "انضم طالب جديد إلى دورتك 'دبلومة تطوير المواقع الكاملة'.",
              },
            ],
          },
          {
            receiverId: teacher1Id,
            receiverType: "USER",
            type: "INFO",
            priority: "LOW",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
            translations: [
              {
                locale: "en",
                title: "New Course Review Received",
                message: "You received a 5-star rating on React & Next.js Masterclass.",
              },
              {
                locale: "ar",
                title: "تم استلام تقييم جديد للدورة",
                message: "حصلت على تقييم 5 نجوم على دورة احتراف React و Next.js.",
              },
            ],
          },
        ]
      : []),

    // Teacher 2 Notifications
    ...(teacher2Id
      ? [
          {
            receiverId: teacher2Id,
            receiverType: "USER",
            type: "SECURITY",
            priority: "HIGH",
            isRead: true,
            readAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
            translations: [
              {
                locale: "en",
                title: "Password Changed Successfully",
                message: "Your account password was updated successfully.",
              },
              {
                locale: "ar",
                title: "تم تغيير كلمة المرور بنجاح",
                message: "تم تحديث كلمة مرور حسابك بنجاح.",
              },
            ],
          },
        ]
      : []),
  ];

  const seededNotifications = [];
  for (const item of notificationsData) {
    const created = await prisma.notification.create({
      data: {
        receiverId: item.receiverId,
        receiverType: item.receiverType,
        type: item.type,
        priority: item.priority,
        isRead: item.isRead,
        readAt: item.readAt || null,
        createdAt: item.createdAt,
        notificationTranslations: {
          create: item.translations,
        },
      },
      include: {
        notificationTranslations: true,
      },
    });
    seededNotifications.push(created);
  }

  console.log(`✅ Seeded ${seededNotifications.length} notifications with translations`);
  return seededNotifications;
}
