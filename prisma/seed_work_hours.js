import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_WORK_HOURS = [
  {
    day: "sat",
    slots: [
      { startTime: "10:00", endTime: "14:00" },
      { startTime: "16:00", endTime: "21:00" },
    ],
  },
  {
    day: "sun",
    slots: [
      { startTime: "09:00", endTime: "13:00" },
      { startTime: "16:00", endTime: "21:00" },
    ],
  },
  {
    day: "mon",
    slots: [
      { startTime: "09:00", endTime: "13:00" },
      { startTime: "16:00", endTime: "21:00" },
    ],
  },
  {
    day: "tue",
    slots: [
      { startTime: "10:00", endTime: "14:00" },
      { startTime: "17:00", endTime: "22:00" },
    ],
  },
  {
    day: "wed",
    slots: [
      { startTime: "09:00", endTime: "13:00" },
      { startTime: "16:00", endTime: "21:00" },
    ],
  },
  {
    day: "thu",
    slots: [
      { startTime: "10:00", endTime: "14:00" },
      { startTime: "17:00", endTime: "22:00" },
    ],
  },
  {
    day: "fri",
    slots: [
      { startTime: "14:00", endTime: "20:00" },
    ],
  },
];

async function seed() {
  console.log("Checking teachers in database...");
  const teachers = await prisma.teacher.findMany({
    include: { user: true },
  });
  console.log(`Found ${teachers.length} teachers.`);

  for (const t of teachers) {
    // 1. Ensure teacher isAvailable is true and has sessionPrice50Min
    await prisma.teacher.update({
      where: { id: t.id },
      data: {
        isAvailable: true,
        sessionPrice50Min: t.sessionPrice50Min && Number(t.sessionPrice50Min) > 0 ? t.sessionPrice50Min : 60.0,
        currency: t.currency || "EGP",
      },
    });

    // 2. Upsert teacher work hours
    const existing = await prisma.teacherWorkHours.findFirst({
      where: { teacherId: t.id },
    });

    if (existing) {
      await prisma.teacherWorkHours.update({
        where: { id: existing.id },
        data: {
          workHours: DEFAULT_WORK_HOURS,
          timezone: "Africa/Cairo",
        },
      });
    } else {
      await prisma.teacherWorkHours.create({
        data: {
          teacherId: t.id,
          workHours: DEFAULT_WORK_HOURS,
          timezone: "Africa/Cairo",
        },
      });
    }
    console.log(`Updated work hours for teacher: ${t.user?.fullName || t.id}`);
  }

  // 3. Also ensure students have active session subscriptions/balance for testing
  const students = await prisma.student.findMany();
  for (const s of students) {
    await prisma.student.update({
      where: { id: s.id },
      data: {
        sessionCount: s.sessionCount > 0 ? s.sessionCount : 10,
        sessionLeft: s.sessionLeft > 0 ? s.sessionLeft : 8,
      },
    });
    for (const t of teachers) {
      const activeSub = await prisma.teacherSubscription.findFirst({
        where: { studentId: s.id, teacherId: t.id, status: "ACTIVE" },
      });
      if (!activeSub) {
        await prisma.teacherSubscription.create({
          data: {
            teacherId: t.id,
            studentId: s.id,
            status: "ACTIVE",
            sessionsCount: 5,
            sessionLeft: 5,
            sessionUsed: 0,
            amount: 300,
            type: "PLAN",
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  console.log("Seeding work hours and balances completed successfully!");
  await prisma.$disconnect();
  await pool.end();
}

seed().catch(err => {
  console.error("Error seeding work hours:", err);
  process.exit(1);
});
