import { requestStatus } from "../../src/utils/Enums/session-request.enum.js";
import { sessionStatus } from "../../src/utils/Enums/sessions.enum.js";
import { nanoid } from "nanoid";

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

  // 3. Prepare dates and identifiers
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const addDays = (days, hour = 10, minute = 0) => {
    const d = new Date(now.getTime() + days * dayMs);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const addMinutes = (mins) => new Date(now.getTime() + mins * 60 * 1000);

  const t1 = teacherIds[0];
  const t2 = teacherIds[1] || teacherIds[0];
  const t3 = teacherIds[2] || teacherIds[0];
  const t4 = teacherIds[3] || teacherIds[0];

  const s1 = studentIds[0];
  const s2 = studentIds[1] || studentIds[0];
  const s3 = studentIds[2] || studentIds[0];
  const s4 = studentIds[3] || studentIds[1] || studentIds[0];
  const s5 = studentIds[4] || studentIds[2] || studentIds[0];

  const activeTeachers = [...new Set([t1, t2, t3, t4].filter(Boolean))];
  const activeStudents = [...new Set([s1, s2, s3, s4, s5].filter(Boolean))];

  // 4. Seed active teacherSubscriptions so all students have active session balance with each teacher
  console.log("🌱 Seeding active teacher subscriptions for students...");
  for (const teacherId of activeTeachers) {
    for (let i = 0; i < activeStudents.length; i++) {
      const studentId = activeStudents[i];
      const existing = await prisma.teacherSubscription.findFirst({
        where: { teacherId, studentId, status: "ACTIVE" },
      });

      const subData = {
        sessionsCount: 15,
        sessionLeft: 12,
        sessionUsed: 3,
        amount: 300,
        type: i % 2 === 0 ? "PLAN" : "CUSTOM",
        expiresAt: new Date(now.getTime() + 90 * dayMs),
      };

      if (!existing) {
        await prisma.teacherSubscription.create({
          data: {
            teacherId,
            studentId,
            status: "ACTIVE",
            ...subData,
          },
        });
      } else {
        await prisma.teacherSubscription.update({
          where: { id: existing.id },
          data: {
            sessionLeft: Math.max(existing.sessionLeft, 8),
            expiresAt: new Date(now.getTime() + 90 * dayMs),
          },
        });
      }
    }
  }

  // Update student legacy session balances
  for (const sId of activeStudents) {
    await prisma.student.update({
      where: { id: sId },
      data: { sessionCount: 30, sessionLeft: 24, sessionUsed: 6 },
    });
  }
  console.log(`✅ Active teacher subscriptions configured for ${activeStudents.length} students across ${activeTeachers.length} teachers`);

  // 5. Rich set of Sessions and Session Requests covering all statuses:
  // - Session Statuses: LIVE, SCHEDULED, COMPLETED, CANCELLED
  // - Request Statuses: PENDING, ACCEPTED, REJECTED, CANCELLED
  const requestsToSeed = [
    // ── Sayed Atef (MR Sayed) Sessions ──
    {
      teacherId: t4,
      studentId: s2,
      title: "🔴 Live Mentoring: Clean Architecture & Flutter Performance Tuning",
      startAt: addMinutes(-25),
      endAt: addMinutes(25),
      note: "Live 1-on-1 session: Layer separation, BLoC pattern best practices, and memory profiling.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-200),
      session: {
        title: "🔴 Live Mentoring: Clean Architecture & Flutter Performance Tuning",
        status: sessionStatus.LIVE,
        startAt: addMinutes(-25),
        endAt: addMinutes(25),
        actualStartAt: addMinutes(-25),
        studentJoinedAt: addMinutes(-22),
        roomName: `session_live_${nanoid(8)}`,
      },
    },
    {
      teacherId: t4,
      studentId: s1,
      title: "📅 Upcoming: Flutter Clean Architecture Code Audit & DI Setup",
      startAt: addDays(1, 11, 0),
      endAt: addDays(1, 11, 50),
      note: "Reviewing presentation layer and GetIt dependency injection graph.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-300),
      session: {
        title: "📅 Upcoming: Flutter Clean Architecture Code Audit & DI Setup",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(1, 11, 0),
        endAt: addDays(1, 11, 50),
        roomName: `session_sched_${nanoid(8)}`,
      },
    },
    {
      teacherId: t4,
      studentId: s3,
      title: "📅 Upcoming: Senior Career Mentorship & System Design",
      startAt: addDays(3, 16, 0),
      endAt: addDays(3, 16, 50),
      note: "Distributed microservices design review and FAANG interview mock.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-400),
      session: {
        title: "📅 Upcoming: Senior Career Mentorship & System Design",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(3, 16, 0),
        endAt: addDays(3, 16, 50),
        roomName: `session_sched_${nanoid(8)}`,
      },
    },
    {
      teacherId: t4,
      studentId: s4,
      title: "✅ Completed: Mobile App Security & Token Refresh Interceptors",
      startAt: addDays(-2, 14, 0),
      endAt: addDays(-2, 14, 50),
      note: "Covered Dio interceptors and secure token storage.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-3, 10, 0),
      session: {
        title: "✅ Completed: Mobile App Security & Token Refresh Interceptors",
        status: sessionStatus.COMPLETED,
        startAt: addDays(-2, 14, 0),
        endAt: addDays(-2, 14, 50),
        actualStartAt: addDays(-2, 14, 0),
        actualEndAt: addDays(-2, 14, 50),
        roomName: `session_comp_${nanoid(8)}`,
      },
    },
    {
      teacherId: t4,
      studentId: s5,
      title: "⏳ Pending Request: Flutter Microservices Integration Consultation",
      startAt: addDays(2, 18, 0),
      endAt: addDays(2, 18, 50),
      note: "Student requested session for NestJS backend integration with Flutter app.",
      status: requestStatus.PENDING,
    },

    // ══════════════════════════════════════════════════════════════════
    // 1. LIVE SESSIONS (Happening RIGHT NOW)
    // ══════════════════════════════════════════════════════════════════
    {
      teacherId: t1,
      studentId: s1,
      title: "🔴 Live Mentoring: Next.js 15 App Router & Server Actions",
      startAt: addMinutes(-15),
      endAt: addMinutes(35),
      note: "Live hands-on review for production Next.js architecture.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-120),
      session: {
        title: "🔴 Live Mentoring: Next.js 15 App Router & Server Actions",
        status: sessionStatus.LIVE,
        startAt: addMinutes(-15),
        endAt: addMinutes(35),
        actualStartAt: addMinutes(-15),
        studentJoinedAt: addMinutes(-12),
        roomName: `session_live_${nanoid(8)}`,
      },
    },
    {
      teacherId: t2,
      studentId: s2,
      title: "🔴 Live Hands-on: Python Machine Learning Pipelines & Scikit-Learn",
      startAt: addMinutes(-10),
      endAt: addMinutes(40),
      note: "Feature engineering pipelines, column transformers, and model evaluation.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-150),
      session: {
        title: "🔴 Live Hands-on: Python Machine Learning Pipelines & Scikit-Learn",
        status: sessionStatus.LIVE,
        startAt: addMinutes(-10),
        endAt: addMinutes(40),
        actualStartAt: addMinutes(-10),
        studentJoinedAt: addMinutes(-8),
        roomName: `session_live_${nanoid(8)}`,
      },
    },
    {
      teacherId: t3,
      studentId: s3,
      title: "🔴 Live Coding: Flutter State Management with BLoC Architecture",
      startAt: addMinutes(-20),
      endAt: addMinutes(30),
      note: "Building reactive state management with BlocProvider, Cubits, and streams.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-180),
      session: {
        title: "🔴 Live Coding: Flutter State Management with BLoC Architecture",
        status: sessionStatus.LIVE,
        startAt: addMinutes(-20),
        endAt: addMinutes(30),
        actualStartAt: addMinutes(-20),
        studentJoinedAt: addMinutes(-18),
        roomName: `session_live_${nanoid(8)}`,
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // 2. SCHEDULED SESSIONS (Upcoming today & future)
    // ══════════════════════════════════════════════════════════════════
    {
      teacherId: t1,
      studentId: s2,
      title: "Advanced PostgreSQL Query Optimization & Indexes",
      startAt: addMinutes(25),
      endAt: addMinutes(75),
      note: "Deep dive into execution plans, EXPLAIN ANALYZE, and composite indexes.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-180),
      session: {
        title: "Advanced PostgreSQL Query Optimization & Indexes",
        status: sessionStatus.SCHEDULED,
        startAt: addMinutes(25),
        endAt: addMinutes(75),
        roomName: `session_today_soon_${nanoid(8)}`,
      },
    },
    {
      teacherId: t2,
      studentId: s1,
      title: "Building Real-Time WebSockets Architecture with Socket.IO",
      startAt: addMinutes(120),
      endAt: addMinutes(170),
      note: "Discussing room orchestration, authentication, and Redis adapter scaling.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-240),
      session: {
        title: "Building Real-Time WebSockets Architecture with Socket.IO",
        status: sessionStatus.SCHEDULED,
        startAt: addMinutes(120),
        endAt: addMinutes(170),
        roomName: `session_today_later_${nanoid(8)}`,
      },
    },
    {
      teacherId: t3,
      studentId: s4,
      title: "React Native Performance Optimization & Reanimated 3",
      startAt: addMinutes(240),
      endAt: addMinutes(290),
      note: "60 FPS gesture animations with React Native Gesture Handler and Reanimated.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-300),
      session: {
        title: "React Native Performance Optimization & Reanimated 3",
        status: sessionStatus.SCHEDULED,
        startAt: addMinutes(240),
        endAt: addMinutes(290),
        roomName: `session_today_evening_${nanoid(8)}`,
      },
    },
    {
      teacherId: t1,
      studentId: s3,
      title: "React 19 Hooks, Suspense & Server Components",
      startAt: addDays(1, 10, 0),
      endAt: addDays(1, 10, 50),
      note: "Need guidance on React 19 use() hook, Server Actions, and optimistic updates.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-360),
      session: {
        title: "React 19 Hooks, Suspense & Server Components",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(1, 10, 0),
        endAt: addDays(1, 10, 50),
        roomName: `session_tomorrow_1_${nanoid(8)}`,
      },
    },
    {
      teacherId: t2,
      studentId: s5,
      title: "Exploratory Data Analysis with Pandas & Seaborn",
      startAt: addDays(1, 14, 0),
      endAt: addDays(1, 14, 50),
      note: "Data cleaning, statistical distributions, and visualization strategies.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-400),
      session: {
        title: "Exploratory Data Analysis with Pandas & Seaborn",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(1, 14, 0),
        endAt: addDays(1, 14, 50),
        roomName: `session_tomorrow_2_${nanoid(8)}`,
      },
    },
    {
      teacherId: t3,
      studentId: s2,
      title: "Docker Containerization & Multi-Stage Builds for Mobile APIs",
      startAt: addDays(1, 18, 0),
      endAt: addDays(1, 18, 50),
      note: "Containerizing backend APIs, healthchecks, and environment configuration.",
      status: requestStatus.ACCEPTED,
      respondedAt: addMinutes(-450),
      session: {
        title: "Docker Containerization & Multi-Stage Builds for Mobile APIs",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(1, 18, 0),
        endAt: addDays(1, 18, 50),
        roomName: `session_tomorrow_3_${nanoid(8)}`,
      },
    },
    {
      teacherId: t1,
      studentId: s4,
      title: "Web Application Security & OWASP Top 10 Defenses",
      startAt: addDays(3, 14, 0),
      endAt: addDays(3, 14, 50),
      note: "Mitigating XSS, CSRF, SQL injection, and rate limiting architectures.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-1, 12, 0),
      session: {
        title: "Web Application Security & OWASP Top 10 Defenses",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(3, 14, 0),
        endAt: addDays(3, 14, 50),
        roomName: `session_future_1_${nanoid(8)}`,
      },
    },
    {
      teacherId: t2,
      studentId: s3,
      title: "Deep Learning Foundations with PyTorch & Neural Networks",
      startAt: addDays(4, 16, 0),
      endAt: addDays(4, 16, 50),
      note: "Backpropagation, gradient descent, and training custom MLP models in PyTorch.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-1, 14, 0),
      session: {
        title: "Deep Learning Foundations with PyTorch & Neural Networks",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(4, 16, 0),
        endAt: addDays(4, 16, 50),
        roomName: `session_future_2_${nanoid(8)}`,
      },
    },
    {
      teacherId: t3,
      studentId: s1,
      title: "Full-Stack TypeScript & Prisma Production Architecture",
      startAt: addDays(5, 11, 0),
      endAt: addDays(5, 11, 50),
      note: "Prisma schema best practices, migrations, and repository design pattern.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-1, 16, 0),
      session: {
        title: "Full-Stack TypeScript & Prisma Production Architecture",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(5, 11, 0),
        endAt: addDays(5, 11, 50),
        roomName: `session_future_3_${nanoid(8)}`,
      },
    },
    {
      teacherId: t1,
      studentId: s5,
      title: "Microservices Architecture with Docker & Node.js",
      startAt: addDays(6, 15, 0),
      endAt: addDays(6, 15, 50),
      note: "Service discovery, API gateways, and distributed logging patterns.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-2, 10, 0),
      session: {
        title: "Microservices Architecture with Docker & Node.js",
        status: sessionStatus.SCHEDULED,
        startAt: addDays(6, 15, 0),
        endAt: addDays(6, 15, 50),
        roomName: `session_future_4_${nanoid(8)}`,
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // 3. COMPLETED SESSIONS (Historical past sessions)
    // ══════════════════════════════════════════════════════════════════
    {
      teacherId: t1,
      studentId: s2,
      title: "JavaScript Async/Await & Event Loop Mechanics",
      startAt: addDays(-1, 15, 0),
      endAt: addDays(-1, 15, 50),
      note: "Clarifying macrotasks vs microtasks in Node.js event loop.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-2, 10, 0),
      session: {
        title: "JavaScript Async/Await & Event Loop Mechanics",
        status: sessionStatus.COMPLETED,
        startAt: addDays(-1, 15, 0),
        endAt: addDays(-1, 15, 50),
        actualStartAt: addDays(-1, 15, 1),
        actualEndAt: addDays(-1, 15, 49),
        studentJoinedAt: addDays(-1, 15, 2),
        roomName: `session_completed_1_${nanoid(8)}`,
      },
    },
    {
      teacherId: t2,
      studentId: s4,
      title: "Machine Learning Evaluation Metrics & Cross-Validation",
      startAt: addDays(-1, 17, 0),
      endAt: addDays(-1, 17, 50),
      note: "ROC-AUC curves, precision-recall trade-offs, and k-fold cross validation.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-2, 14, 0),
      session: {
        title: "Machine Learning Evaluation Metrics & Cross-Validation",
        status: sessionStatus.COMPLETED,
        startAt: addDays(-1, 17, 0),
        endAt: addDays(-1, 17, 50),
        actualStartAt: addDays(-1, 17, 0),
        actualEndAt: addDays(-1, 17, 48),
        studentJoinedAt: addDays(-1, 17, 1),
        roomName: `session_completed_2_${nanoid(8)}`,
      },
    },
    {
      teacherId: t2,
      studentId: s1,
      title: "REST vs GraphQL API Design in Modern Architectures",
      startAt: addDays(-2, 11, 0),
      endAt: addDays(-2, 11, 50),
      note: "Comparing REST endpoints with GraphQL query/mutation schemas and overfetching.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-3, 9, 0),
      session: {
        title: "REST vs GraphQL API Design in Modern Architectures",
        status: sessionStatus.COMPLETED,
        startAt: addDays(-2, 11, 0),
        endAt: addDays(-2, 11, 50),
        actualStartAt: addDays(-2, 11, 0),
        actualEndAt: addDays(-2, 11, 48),
        studentJoinedAt: addDays(-2, 11, 1),
        roomName: `session_completed_3_${nanoid(8)}`,
      },
    },
    {
      teacherId: t3,
      studentId: s1,
      title: "Mobile App CI/CD with Fastlane & GitHub Actions",
      startAt: addDays(-3, 13, 0),
      endAt: addDays(-3, 13, 50),
      note: "Automating iOS certificates, Android keystore signing, and deployment.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-4, 10, 0),
      session: {
        title: "Mobile App CI/CD with Fastlane & GitHub Actions",
        status: sessionStatus.COMPLETED,
        startAt: addDays(-3, 13, 0),
        endAt: addDays(-3, 13, 50),
        actualStartAt: addDays(-3, 13, 0),
        actualEndAt: addDays(-3, 13, 50),
        studentJoinedAt: addDays(-3, 13, 3),
        roomName: `session_completed_4_${nanoid(8)}`,
      },
    },
    {
      teacherId: t1,
      studentId: s5,
      title: "Redis Caching Strategies & Distributed Locks",
      startAt: addDays(-4, 16, 0),
      endAt: addDays(-4, 16, 50),
      note: "Cache-aside pattern, TTL invalidation, and Redlock distributed locking.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-5, 12, 0),
      session: {
        title: "Redis Caching Strategies & Distributed Locks",
        status: sessionStatus.COMPLETED,
        startAt: addDays(-4, 16, 0),
        endAt: addDays(-4, 16, 50),
        actualStartAt: addDays(-4, 16, 2),
        actualEndAt: addDays(-4, 16, 49),
        studentJoinedAt: addDays(-4, 16, 3),
        roomName: `session_completed_5_${nanoid(8)}`,
      },
    },
    {
      teacherId: t3,
      studentId: s3,
      title: "Cross-Platform Mobile UI Design System in Flutter",
      startAt: addDays(-5, 10, 0),
      endAt: addDays(-5, 10, 50),
      note: "Building reusable design tokens, typography, and atomic component libraries.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-6, 9, 0),
      session: {
        title: "Cross-Platform Mobile UI Design System in Flutter",
        status: sessionStatus.COMPLETED,
        startAt: addDays(-5, 10, 0),
        endAt: addDays(-5, 10, 50),
        actualStartAt: addDays(-5, 10, 0),
        actualEndAt: addDays(-5, 10, 50),
        studentJoinedAt: addDays(-5, 10, 1),
        roomName: `session_completed_6_${nanoid(8)}`,
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // 4. CANCELLED SESSIONS (Accepted and scheduled, then CANCELLED)
    // ══════════════════════════════════════════════════════════════════
    {
      teacherId: t1,
      studentId: s3,
      title: "GraphQL Schema Stitching & Apollo Federation",
      startAt: addDays(-1, 11, 0),
      endAt: addDays(-1, 11, 50),
      note: "Session was accepted and scheduled, but cancelled due to scheduling conflict.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-2, 10, 0),
      session: {
        title: "GraphQL Schema Stitching & Apollo Federation",
        status: sessionStatus.CANCELLED,
        startAt: addDays(-1, 11, 0),
        endAt: addDays(-1, 11, 50),
        roomName: `session_cancelled_1_${nanoid(8)}`,
      },
    },
    {
      teacherId: t2,
      studentId: s5,
      title: "Time Series Analysis & Forecasting with Prophet",
      startAt: addDays(-2, 14, 0),
      endAt: addDays(-2, 14, 50),
      note: "Session was accepted, then cancelled by mutual agreement.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-3, 11, 0),
      session: {
        title: "Time Series Analysis & Forecasting with Prophet",
        status: sessionStatus.CANCELLED,
        startAt: addDays(-2, 14, 0),
        endAt: addDays(-2, 14, 50),
        roomName: `session_cancelled_2_${nanoid(8)}`,
      },
    },
    {
      teacherId: t3,
      studentId: s4,
      title: "App Store & Play Store Publishing & Compliance",
      startAt: addDays(-3, 16, 0),
      endAt: addDays(-3, 16, 50),
      note: "Session cancelled prior to starting time.",
      status: requestStatus.ACCEPTED,
      respondedAt: addDays(-4, 12, 0),
      session: {
        title: "App Store & Play Store Publishing & Compliance",
        status: sessionStatus.CANCELLED,
        startAt: addDays(-3, 16, 0),
        endAt: addDays(-3, 16, 50),
        roomName: `session_cancelled_3_${nanoid(8)}`,
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // 5. PENDING SESSION REQUESTS (Awaiting teacher review)
    // ══════════════════════════════════════════════════════════════════
    {
      teacherId: t1,
      studentId: s1,
      title: "Node.js Event-Driven Architecture with Apache Kafka",
      startAt: addDays(1, 16, 0),
      endAt: addDays(1, 16, 50),
      note: "Want to discuss event-driven patterns with Apache Kafka and partition consumers.",
      status: requestStatus.PENDING,
    },
    {
      teacherId: t2,
      studentId: s3,
      title: "MLOps Deployment Pipelines with Docker & FastAPI",
      startAt: addDays(2, 13, 0),
      endAt: addDays(2, 13, 50),
      note: "Questions about continuous model validation and inference latency monitoring.",
      status: requestStatus.PENDING,
    },
    {
      teacherId: t3,
      studentId: s2,
      title: "Flutter Animations, Canvas & Custom Painters",
      startAt: addDays(3, 11, 0),
      endAt: addDays(3, 11, 50),
      note: "Need guidance on building custom charting widgets and 2D canvas drawing.",
      status: requestStatus.PENDING,
    },
    {
      teacherId: t1,
      studentId: s4,
      title: "Next.js Authentication with NextAuth & JWT",
      startAt: addDays(3, 15, 0),
      endAt: addDays(3, 15, 50),
      note: "Setting up OAuth providers, refresh token rotation, and role-based middleware.",
      status: requestStatus.PENDING,
    },
    {
      teacherId: t2,
      studentId: s5,
      title: "Computer Vision with OpenCV & PyTorch",
      startAt: addDays(4, 14, 0),
      endAt: addDays(4, 14, 50),
      note: "Convolutional neural networks, image augmentations, and transfer learning.",
      status: requestStatus.PENDING,
    },
    {
      teacherId: t3,
      studentId: s5,
      title: "Kotlin Multiplatform (KMM) Architecture",
      startAt: addDays(5, 12, 0),
      endAt: addDays(5, 12, 50),
      note: "Sharing business logic across Android and iOS with Ktor and SQLDelight.",
      status: requestStatus.PENDING,
    },

    // ══════════════════════════════════════════════════════════════════
    // 6. REJECTED SESSION REQUESTS
    // ══════════════════════════════════════════════════════════════════
    {
      teacherId: t1,
      studentId: s3,
      title: "Database Indexing & PostgreSQL B-Tree Tuning",
      startAt: addDays(-1, 9, 0),
      endAt: addDays(-1, 9, 50),
      note: "Looking into B-Tree vs GIN indexes for JSONB columns.",
      status: requestStatus.REJECTED,
      rejectedReason: "Unavailable due to an overlapping academic faculty meeting.",
      respondedAt: addDays(-2, 12, 0),
    },
    {
      teacherId: t2,
      studentId: s1,
      title: "Advanced Large Language Model Fine-Tuning",
      startAt: addDays(-2, 10, 0),
      endAt: addDays(-2, 10, 50),
      note: "Want guidance on LoRA and QLoRA fine-tuning with HuggingFace.",
      status: requestStatus.REJECTED,
      rejectedReason: "Please complete the prerequisites in deep learning foundations first.",
      respondedAt: addDays(-3, 11, 0),
    },
    {
      teacherId: t3,
      studentId: s4,
      title: "Swift Concurrency & Actor Model Deep Dive",
      startAt: addDays(-3, 14, 0),
      endAt: addDays(-3, 14, 50),
      note: "Async sequences, tasks groups, and actors in Swift 6.",
      status: requestStatus.REJECTED,
      rejectedReason: "Currently fully booked for this week; please re-request next week.",
      respondedAt: addDays(-4, 10, 0),
    },

    // ══════════════════════════════════════════════════════════════════
    // 7. CANCELLED SESSION REQUESTS (Cancelled by student)
    // ══════════════════════════════════════════════════════════════════
    {
      teacherId: t1,
      studentId: s5,
      title: "Docker Swarm Clustering & Swarmkit",
      startAt: addDays(-2, 13, 0),
      endAt: addDays(-2, 13, 50),
      note: "Need to reschedule to next month after midterms.",
      status: requestStatus.CANCELLED,
    },
    {
      teacherId: t2,
      studentId: s4,
      title: "Applied Statistics for Data Science",
      startAt: addDays(-3, 15, 0),
      endAt: addDays(-3, 15, 50),
      note: "Decided to take the foundational statistics module first.",
      status: requestStatus.CANCELLED,
    },
    {
      teacherId: t3,
      studentId: s1,
      title: "React Native Turbo Modules with C++",
      startAt: addDays(-4, 11, 0),
      endAt: addDays(-4, 11, 50),
      note: "Postponed until next sprint.",
      status: requestStatus.CANCELLED,
    },
  ];

  const seededRequests = [];
  const seededSessions = [];

  for (const item of requestsToSeed) {
    const { session, ...reqData } = item;

    // Check if request exists for this teacher, student, and title
    let requestRecord = await prisma.sessionRequest.findFirst({
      where: {
        teacherId: reqData.teacherId,
        studentId: reqData.studentId,
        title: reqData.title,
      },
      include: { session: true },
    });

    if (!requestRecord) {
      requestRecord = await prisma.sessionRequest.create({
        data: reqData,
      });
    } else {
      requestRecord = await prisma.sessionRequest.update({
        where: { id: requestRecord.id },
        data: {
          startAt: reqData.startAt,
          endAt: reqData.endAt,
          status: reqData.status,
          note: reqData.note,
          rejectedReason: reqData.rejectedReason || null,
          respondedAt: reqData.respondedAt || null,
        },
        include: { session: true },
      });
    }

    seededRequests.push(requestRecord);

    if (session) {
      const activeSub = await prisma.teacherSubscription.findFirst({
        where: {
          teacherId: reqData.teacherId,
          studentId: reqData.studentId,
          status: "ACTIVE",
        },
      });

      if (!requestRecord.session) {
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
            actualStartAt: session.actualStartAt || null,
            actualEndAt: session.actualEndAt || null,
            studentJoinedAt: session.studentJoinedAt || null,
            roomName: session.roomName,
          },
        });
        seededSessions.push(createdSession);
      } else {
        const updatedSession = await prisma.session.update({
          where: { id: requestRecord.session.id },
          data: {
            title: session.title,
            status: session.status,
            startAt: session.startAt,
            endAt: session.endAt,
            actualStartAt: session.actualStartAt || null,
            actualEndAt: session.actualEndAt || null,
            studentJoinedAt: session.studentJoinedAt || null,
            teacherSubscriptionId: activeSub?.id || requestRecord.session.teacherSubscriptionId,
          },
        });
        seededSessions.push(updatedSession);
      }
    }
  }

  console.log(`✅ Seeded/Updated ${seededRequests.length} session requests`);
  console.log(`✅ Seeded/Updated ${seededSessions.length} live/scheduled/completed/cancelled sessions`);

  // 6. Seed sample CustomSessionRequests (Cycle 2) across all statuses
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
      teacherId: t2,
      studentId: s3,
      sessionsCount: 5,
      pricePerSession: 30.00,
      totalPrice: 150.00,
      status: "PENDING",
      validityDays: 30,
    },
    {
      teacherId: t3,
      studentId: s2,
      sessionsCount: 6,
      pricePerSession: 25.00,
      totalPrice: 150.00,
      status: "PENDING",
      validityDays: 30,
    },
    {
      teacherId: t1,
      studentId: s5,
      sessionsCount: 8,
      pricePerSession: 25.00,
      totalPrice: 200.00,
      status: "PENDING",
      validityDays: 45,
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
      studentId: s4,
      sessionsCount: 8,
      pricePerSession: 30.00,
      totalPrice: 240.00,
      status: "ACCEPTED",
      validityDays: 60,
      respondedAt: new Date(now.getTime() - 2 * dayMs),
    },
    {
      teacherId: t3,
      studentId: s5,
      sessionsCount: 5,
      pricePerSession: 25.00,
      totalPrice: 125.00,
      status: "ACCEPTED",
      validityDays: 30,
      respondedAt: new Date(now.getTime() - 1 * dayMs),
    },
    {
      teacherId: t2,
      studentId: s1,
      sessionsCount: 8,
      pricePerSession: 30.00,
      totalPrice: 240.00,
      status: "REJECTED",
      rejectedReason: "My schedule is currently at full capacity for private bundles.",
      validityDays: 30,
      respondedAt: new Date(now.getTime() - 2 * dayMs),
    },
    {
      teacherId: t3,
      studentId: s3,
      sessionsCount: 10,
      pricePerSession: 25.00,
      totalPrice: 250.00,
      status: "REJECTED",
      rejectedReason: "Unable to commit to 10 sessions within the requested validity period.",
      validityDays: 30,
      respondedAt: new Date(now.getTime() - 3 * dayMs),
    },
    {
      teacherId: t1,
      studentId: s4,
      sessionsCount: 4,
      pricePerSession: 25.00,
      totalPrice: 100.00,
      status: "CANCELLED",
      validityDays: 30,
    },
    {
      teacherId: t3,
      studentId: s1,
      sessionsCount: 6,
      pricePerSession: 25.00,
      totalPrice: 150.00,
      status: "CANCELLED",
      validityDays: 30,
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
