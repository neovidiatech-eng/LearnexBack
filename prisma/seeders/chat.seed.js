export async function seedChat(prisma, students = [], teachers = []) {
  console.log("🌱 Seeding chat conversations & messages...");

  // If students/teachers arrays are empty, fetch from database
  let allStudents = students;
  if (!allStudents.length) {
    allStudents = await prisma.user.findMany({
      where: { student: { isNot: null } },
      include: { student: true, role: true },
      take: 5,
    });
  }

  let allTeachers = teachers;
  if (!allTeachers.length) {
    allTeachers = await prisma.user.findMany({
      where: { teacher: { isNot: null } },
      include: { teacher: true, role: true },
      take: 5,
    });
  }

  const youssef = allStudents.find((s) => s.fullName?.includes("Youssef")) || allStudents[0];
  const nour = allStudents.find((s) => s.fullName?.includes("Nour")) || allStudents[1];
  const karim = allStudents.find((s) => s.fullName?.includes("Karim")) || allStudents[2];
  const ahmed = allTeachers.find((t) => t.fullName?.includes("Ahmed")) || allTeachers[0];
  const sara = allTeachers.find((t) => t.fullName?.includes("Sara")) || allTeachers[1];

  const sampleConversations = [
    {
      user: youssef,

      lastMessage: "السلام عليكم، هل يمكن تقسيط الدبلومة الشاملة؟",
      unreadAdminCount: 1,
      unreadUserCount: 0,
      messages: [
        {
          content: "السلام عليكم ورحمة الله، كنت بستفسر عن تفاصيل الدبلومة",
          minutesAgo: 120,
        },
        {
          content: "السلام عليكم، هل يمكن تقسيط الدبلومة الشاملة؟",
          minutesAgo: 30,
        },
      ],
    },
    {
      user: nour,
      lastMessage: "شكراً جزيلاً للدعم الفني، تم تفعيل الكورس بنجاح.",
      unreadAdminCount: 0,
      unreadUserCount: 0,
      messages: [
        {
          content: "واجهت مشكلة في الدفع عبر البطاقة الائتمانية",
          minutesAgo: 300,
        },
        {
          content: "شكراً جزيلاً للدعم الفني، تم تفعيل الكورس بنجاح.",
          minutesAgo: 60,
        },
      ],
    },
    {
      user: karim,
      lastMessage: "ميعاد الجلسة المباشرة القادمة متى سيكون بالضبط؟",
      unreadAdminCount: 2,
      unreadUserCount: 0,
      messages: [
        {
          content: "ميعاد الجلسة المباشرة القادمة متى سيكون بالضبط؟",
          minutesAgo: 15,
        },
      ],
    },
    {
      user: ahmed,
      lastMessage: "تم رفع محتوى القسم الثالث من كورس Node.js بانتظار المراجعة والاعتماد.",
      unreadAdminCount: 1,
      unreadUserCount: 0,
      messages: [
        {
          content: "مرحباً إدارة المنصة، انتهيت من تسجيل الفيديوهات الجديدة",
          minutesAgo: 180,
        },
        {
          content: "تم رفع محتوى القسم الثالث من كورس Node.js بانتظار المراجعة والاعتماد.",
          minutesAgo: 45,
        },
      ],
    },
    {
      user: sara,
      lastMessage: "أريد تحديث خطة الأسعار وساعات العمل للجلسات الفردية.",
      unreadAdminCount: 0,
      unreadUserCount: 1,
      messages: [
        {
          content: "أريد تحديث خطة الأسعار وساعات العمل للجلسات الفردية.",
          minutesAgo: 90,
        },
      ],
    },
  ];

  const seededConversations = [];

  for (const item of sampleConversations) {
    if (!item.user?.id) continue;

    const now = new Date();
    const lastMessageDate = new Date(now.getTime() - (item.messages[item.messages.length - 1]?.minutesAgo || 10) * 60000);

    // Upsert conversation by userId
    const conversation = await prisma.conversation.upsert({
      where: { userId: item.user.id },
      update: {
        lastMessage: item.lastMessage,
        lastMessageAt: lastMessageDate,
        unreadAdminCount: item.unreadAdminCount,
        unreadUserCount: item.unreadUserCount,
      },
      create: {
        userId: item.user.id,
        lastMessage: item.lastMessage,
        lastMessageAt: lastMessageDate,
        unreadAdminCount: item.unreadAdminCount,
        unreadUserCount: item.unreadUserCount,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    });

    // Seed messages
    for (const msg of item.messages) {
      const msgDate = new Date(now.getTime() - msg.minutesAgo * 60000);
      await prisma.message.create({
        data: {
          content: msg.content,
          conversationId: conversation.id,
          senderId: item.user.id,
          createdAt: msgDate,
          updatedAt: msgDate,
        },
      });
    }

    seededConversations.push(conversation);
  }

  console.log(`✅ Seeded ${seededConversations.length} conversations with initial messages`);
  return seededConversations;
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
    const students = await prisma.user.findMany({
      where: { student: { isNot: null } },
      include: { student: true, role: true },
    });
    const teachers = await prisma.user.findMany({
      where: { teacher: { isNot: null } },
      include: { teacher: true, role: true },
    });
    await seedChat(prisma, students, teachers);
  } catch (error) {
    console.error("❌ Chat seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("chat.seed.js")) {
  standalone();
}
