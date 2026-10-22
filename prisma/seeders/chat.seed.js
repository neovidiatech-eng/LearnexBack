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

  const youssefUser = allStudents.find((s) => s.fullName?.includes("Youssef")) || allStudents[0];
  const nourUser = allStudents.find((s) => s.fullName?.includes("Nour")) || allStudents[1];
  const karimUser = allStudents.find((s) => s.fullName?.includes("Karim")) || allStudents[2];
  const ahmedUser = allTeachers.find((t) => t.fullName?.includes("Ahmed")) || allTeachers[0];
  const saraUser = allTeachers.find((t) => t.fullName?.includes("Sara")) || allTeachers[1];

  const getStudentId = (u) => u?.student?.id || null;
  const getTeacherId = (u) => u?.teacher?.id || null;


  const sampleConversations = [
    {
      studentUser: youssefUser,
      teacherUser: ahmedUser,
      unreadStudentCount: 0,
      unreadTeacherCount: 0,
      messages: [
        {
          senderUser: youssefUser,
          content: "السلام عليكم يا بشمهندس أحمد، كنت حابب أسألك بخصوص كورس React و Next.js",
          minutesAgo: 120,
        },
        {
          senderUser: ahmedUser,
          content: "وعليكم السلام يا يوسف، أهلاً بيك! اتفضل اسألني في أي وقت وأنا معاك.",
          minutesAgo: 100,
        },
        {
          senderUser: youssefUser,
          content: "بخصوص الجلسة القادمة، هل هنشرح Server Actions مع Prisma؟",
          minutesAgo: 45,
        },
        {
          senderUser: ahmedUser,
          content: "أكيد إن شاء الله، ومجهزلكم مشروع عملي كامل هنبنيه سوا.",
          minutesAgo: 15,
        },
      ],
    },
    {
      studentUser: nourUser,
      teacherUser: ahmedUser,
      unreadStudentCount: 0,
      unreadTeacherCount: 1,
      messages: [
        {
          senderUser: nourUser,
          content: "مساء الخير يا بشمهندس، محتاجة استفسر عن ميعاد سيشن مراجعة قواعد البيانات.",
          minutesAgo: 30,
        },
      ],
    },
    {
      studentUser: karimUser,
      teacherUser: saraUser,
      unreadStudentCount: 0,
      unreadTeacherCount: 0,
      messages: [
        {
          senderUser: karimUser,
          content: "دكتورة سارة، هل سيشن الماشين ليرنينج القادمة محتاجة تسطيب مكتبات معينة مسبقاً؟",
          minutesAgo: 180,
        },
        {
          senderUser: saraUser,
          content: "أهلاً يا كريم، ياريت تكون مجهز بيئة Python ومسطب PyTorch و FastAPI.",
          minutesAgo: 90,
        },
        {
          senderUser: karimUser,
          content: "تمام جداً تم التسطيب، شكراً جزيلاً لحضرتك.",
          minutesAgo: 60,
        },
      ],
    },
    {
      studentUser: youssefUser,
      teacherUser: saraUser,
      unreadStudentCount: 1,
      unreadTeacherCount: 0,
      messages: [
        {
          senderUser: saraUser,
          content: "مرحباً يا يوسف، تم قبول طلب الجلسة الخاصة بنجاح ومستنياك في الموعد المحدد.",
          minutesAgo: 20,
        },
      ],
    },
  ];

  const seededConversations = [];

  for (const item of sampleConversations) {
    const studentId = getStudentId(item.studentUser);
    const teacherId = getTeacherId(item.teacherUser);

    if (!studentId || !teacherId) continue;

    const now = new Date();
    const lastMsg = item.messages[item.messages.length - 1];
    const lastMessageDate = new Date(now.getTime() - (lastMsg?.minutesAgo || 10) * 60000);

    // Upsert conversation by unique compound [studentId, teacherId]
    const conversation = await prisma.conversation.upsert({
      where: {
        studentId_teacherId: {
          studentId,
          teacherId,
        },
      },
      update: {
        lastMessage: lastMsg?.content || null,
        lastMessageAt: lastMessageDate,
        unreadStudentCount: item.unreadStudentCount,
        unreadTeacherCount: item.unreadTeacherCount,
      },
      create: {
        studentId,
        teacherId,
        lastMessage: lastMsg?.content || null,
        lastMessageAt: lastMessageDate,
        unreadStudentCount: item.unreadStudentCount,
        unreadTeacherCount: item.unreadTeacherCount,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    });

    // Seed messages if none exist yet for this conversation
    const existingMessagesCount = await prisma.message.count({
      where: { conversationId: conversation.id },
    });

    if (existingMessagesCount === 0) {
      for (const msg of item.messages) {
        const msgDate = new Date(now.getTime() - msg.minutesAgo * 60000);
        await prisma.message.create({
          data: {
            content: msg.content,
            conversationId: conversation.id,
            senderId: msg.senderUser.id,
            createdAt: msgDate,
            updatedAt: msgDate,
          },
        });
      }
    }

    seededConversations.push(conversation);
  }

  console.log(`✅ Seeded ${seededConversations.length} student-teacher conversations with initial messages`);
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
