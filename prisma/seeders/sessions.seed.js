import { requestStatus } from "../../src/utils/Enums/session-request.enum.js";
import { sessionStatus } from "../../src/utils/Enums/sessions.enum.js";
import { nanoid } from "nanoid";

const DEFAULT_WORK_HOURS = [
  { day: "mon", slots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "tue", slots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "wed", slots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "thu", slots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "fri", slots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "sat", slots: [{ startTime: "10:00", endTime: "15:00" }] },
  { day: "sun", slots: [{ startTime: "10:00", endTime: "15:00" }] },
];

export async function seedSessions(prisma, teachers = [], students = []) {
  console.log("🌱 Seeding teacher work hours, session requests, and sessions...");

  // Resolve teachers
  let teacherList = teachers;
  if (!teacherList || teacherList.length === 0) {
    teacherList = await prisma.teacher.findMany({
      include: { user: true },
    });
  }

  // Resolve students
  let studentList = students;
  if (!studentList || studentList.length === 0) {
    studentList = await prisma.student.findMany({
      include: { user: true },
    });
  }

  if (teacherList.length === 0 || studentList.length === 0) {
    console.warn("⚠️ Cannot seed sessions: teachers or students missing.");
    return { sessionRequests: [], sessions: [] };
  }

  const resolveTeacherId = (t) => t.teacher?.id || t.id;
  const resolveStudentId = (s) => s.student?.id || s.id;

  const teacherIds = teacherList.map(resolveTeacherId);
  const studentIds = studentList.map(resolveStudentId);

  // 1. Seed Teacher Work Hours & ensure isAvailable = true
  console.log("🌱 Seeding teacher work hours...");
  for (const tId of teacherIds) {
    await prisma.teacher.update({
      where: { id: tId },
      data: { isAvailable: true },
    });

    const existingHours = await prisma.teacherWorkHours.findFirst({
      where: { teacherId: tId },
    });

    if (existingHours) {
      await prisma.teacherWorkHours.update({
        where: { id: existingHours.id },
        data: { workHours: DEFAULT_WORK_HOURS },
      });
    } else {
      await prisma.teacherWorkHours.create({
        data: {
          teacherId: tId,
          workHours: DEFAULT_WORK_HOURS,
        },
      });
    }
  }
  console.log(`✅ Teacher work hours configured for ${teacherIds.length} teachers`);

  // 2. Ensure each teacher has a sessionPrice50Min if null or 0
  for (const tId of teacherIds) {
    const t = await prisma.teacher.findUnique({ where: { id: tId }, select: { sessionPrice50Min: true } });
    if (!t?.sessionPrice50Min || Number(t.sessionPrice50Min) <= 0) {
      await prisma.teacher.update({
        where: { id: tId },
        data: { sessionPrice50Min: 25.00 },
      });
    }
  }

  // 3. Prepare sample Session Requests & Sessions
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // Helper to create date relative to now
  const addDays = (days, hour = 10, minute = 0) => {
    const d = new Date(now.getTime() + days * dayMs);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const t1 = teacherIds[0];
  const t2 = teacherIds[1] || teacherIds[0];
  const s1 = studentIds[0];
  const s2 = studentIds[1] || studentIds[0];
  const s3 = studentIds[2] || studentIds[0];

  // 4. Seed active teacherSubscriptions so students have session balance
  console.log("🌱 Seeding active teacher subscriptions for students...");
  const sampleSubscriptions = [
    { teacherId: t1, studentId: s1, sessionsCount: 10, sessionLeft: 8, sessionUsed: 2, amount: 200, type: "PLAN" },
    { teacherId: t1, studentId: s2, sessionsCount: 5, sessionLeft: 4, sessionUsed: 1, amount: 100, type: "CUSTOM" },
    { teacherId: t1, studentId: s3, sessionsCount: 3, sessionLeft: 3, sessionUsed: 0, amount: 75, type: "CUSTOM" },
    { teacherId: t2, studentId: s1, sessionsCount: 8, sessionLeft: 7, sessionUsed: 1, amount: 160, type: "PLAN" },
    { teacherId: t2, studentId: s3, sessionsCount: 5, sessionLeft: 4, sessionUsed: 1, amount: 125, type: "CUSTOM" },
  ];

  for (const sub of sampleSubscriptions) {
    const existing = await prisma.teacherSubscription.findFirst({
      where: { teacherId: sub.teacherId, studentId: sub.studentId, status: "ACTIVE" },
    });
    if (!existing) {
      await prisma.teacherSubscription.create({
        data: {
          teacherId: sub.teacherId,
          studentId: sub.studentId,
          status: "ACTIVE",
          sessionsCount: sub.sessionsCount,
          sessionLeft: sub.sessionLeft,
          sessionUsed: sub.sessionUsed,
          amount: sub.amount,
          type: sub.type,
          expiresAt: new Date(now.getTime() + 60 * dayMs),
        },
      });
    }
  }

  // Also update student legacy session balances
  for (const sId of [s1, s2, s3]) {
    await prisma.student.update({
      where: { id: sId },
      data: { sessionCount: 15, sessionLeft: 12, sessionUsed: 3 },
    });
  }
  console.log("✅ Active teacher subscriptions configured");

  const requestsToSeed = [
    // 1. PENDING request (upcoming tomorrow)
    {
      teacherId: t1,
      studentId: s1,
      title: "React Performance Optimization & Memoization",
      startAt: addDays(1, 10, 0),
      endAt: addDays(1, 10, 50),
      note: "Need guidance on optimizing React re-renders and useMemo/useCallback.",
      status: requestStatus.PENDING,
    },
    // 2. PENDING request 2 (in 2 days)
    {
      teacherId: t1,
      studentId: s2,
      title: "Node.js Microservices Architecture",
      startAt: addDays(2, 11, 0),
      endAt: addDays(2, 11, 50),
      note: "Discussing message brokers and Docker orchestration.",
      status: requestStatus.PENDING,
    },
    // 3. ACCEPTED request with SCHEDULED session (in 3 days)
    {
      teacherId: t1,
      studentId: s1,
      title: "Full-Stack TypeScript Mentoring",
      startAt: addDays(3, 14, 0),
      endAt: addDays(3, 14, 50),
      note: "Reviewing generic types and Prisma schema design.",
      status: requestStatus.ACCEPTED,
      respondedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      session: {
        title: "Full-Stack TypeScript Mentoring",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(3, 14, 0),
        endAt: addDays(3, 14, 50),
        roomName: `session_${nanoid(10)}`,
      },
    },
    // 4. ACCEPTED request with COMPLETED session (yesterday)
    {
      teacherId: t1,
      studentId: s2,
      title: "JavaScript Async/Await & Event Loop",
      startAt: addDays(-1, 15, 0),
      endAt: addDays(-1, 15, 50),
      note: "Clarifying macrotasks vs microtasks in Node.js.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-2, 10, 0),
      session: {
        title: "JavaScript Async/Await & Event Loop",
        status: sessionStatus.COMPLETED,
        startAt: addDays(-1, 15, 0),
        endAt: addDays(-1, 15, 50),
        actualEndAt: addDays(-1, 15, 48),
        roomName: `session_${nanoid(10)}`,
      },
    },
    // 5. REJECTED request (yesterday)
    {
      teacherId: t1,
      studentId: s3,
      title: "Database Indexing & PostgreSQL tuning",
      startAt: addDays(-1, 9, 0),
      endAt: addDays(-1, 9, 50),
      note: "Looking into B-Tree vs GIN indexes.",
      status: requestStatus.REJECTED,
      rejectedReason: "Unavailable due to an overlapping academic faculty meeting.",
      respondedAt: addDays(-2, 12, 0),
    },
    // 6. CANCELLED request (by student)
    {
      teacherId: t2,
      studentId: s1,
      title: "Python Data Science Exploration",
      startAt: addDays(-3, 13, 0),
      endAt: addDays(-3, 13, 50),
      note: "Need to reschedule to next month.",
      status: requestStatus.CANCELLED,
    },
    // 7. SCHEDULED session for teacher 2 (in 4 days)
    {
      teacherId: t2,
      studentId: s3,
      title: "Machine Learning Model Deployment",
      startAt: addDays(4, 16, 0),
      endAt: addDays(4, 16, 50),
      note: "Deploying PyTorch models via FastAPI.",
      status: requestStatus.ACCEPTED,
      respondedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      session: {
        title: "Machine Learning Model Deployment",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(4, 16, 0),
        endAt: addDays(4, 16, 50),
        roomName: `session_${nanoid(10)}`,
      },
    },
  ];

  const seededRequests = [];
  const seededSessions = [];

  for (const item of requestsToSeed) {
    const { session, ...reqData } = item;

    // Check if duplicate request exists for this student, teacher, and startAt
    let requestRecord = await prisma.sessionRequest.findFirst({
      where: {
        teacherId: reqData.teacherId,
        studentId: reqData.studentId,
        startAt: reqData.startAt,
      },
      include: { session: true },
    });

    if (!requestRecord) {
      requestRecord = await prisma.sessionRequest.create({
        data: reqData,
      });
    }

    seededRequests.push(requestRecord);

    if (session && !requestRecord.session) {
      const activeSub = await prisma.teacherSubscription.findFirst({
        where: {
          teacherId: reqData.teacherId,
          studentId: reqData.studentId,
          status: "ACTIVE",
        },
      });

      const createdSession = await prisma.session.create({
        data: {
          requestId: requestRecord.id,
          teacherId: reqData.teacherId,
          studentId: reqData.studentId,
          teacherSubscriptionId: activeSub?.id || null,
          title: session.title,
          status: session.status,
          startAt: session.startAt,
          endAt: session.endAt,
          actualEndAt: session.actualEndAt || null,
          roomName: session.roomName,
        },
      });
      seededSessions.push(createdSession);
    } else if (requestRecord.session) {
      seededSessions.push(requestRecord.session);
    }
  }

  console.log(`✅ Seeded ${seededRequests.length} session requests`);
  console.log(`✅ Seeded ${seededSessions.length} live/scheduled sessions`);

  // 5. Seed sample CustomSessionRequests (Cycle 2)
  console.log("🌱 Seeding custom session requests...");
  const customRequestsToSeed = [
    {
      teacherId: t1,
      studentId: s1,
      sessionsCount: 4,
      pricePerSession: 25.00,
      totalPrice: 100.00,
      status: "PENDING",
      validityDays: 30,
    },
    {
      teacherId: t1,
      studentId: s2,
      sessionsCount: 6,
      pricePerSession: 25.00,
      totalPrice: 150.00,
      status: "ACCEPTED",
      validityDays: 45,
      respondedAt: new Date(now.getTime() - 1 * dayMs),
    },
    {
      teacherId: t2,
      studentId: s3,
      sessionsCount: 8,
      pricePerSession: 25.00,
      totalPrice: 200.00,
      status: "REJECTED",
      rejectedReason: "My schedule is currently at full capacity for the next month.",
      validityDays: 30,
      respondedAt: new Date(now.getTime() - 2 * dayMs),
    },
  ];

  for (const cr of customRequestsToSeed) {
    const existingCr = await prisma.customSessionRequest.findFirst({
      where: { teacherId: cr.teacherId, studentId: cr.studentId, sessionsCount: cr.sessionsCount, status: cr.status },
    });
    if (!existingCr) {
      await prisma.customSessionRequest.create({ data: cr });
    }
  }
  console.log(`✅ Seeded ${customRequestsToSeed.length} custom session requests`);

  return {
    sessionRequests: seededRequests,
    sessions: seededSessions,
  };
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
    console.log("🚀 Starting standalone sessions seeder...\n");
    await seedSessions(prisma);
    console.log("\n🎉 Sessions seeding completed successfully!");
  } catch (err) {
    console.error("❌ Sessions seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("sessions.seed.js")) {
  standalone();
}
