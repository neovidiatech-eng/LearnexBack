import { randomUUID } from "crypto";
import * as db from "../../db/db.service.js";
import { sessionType, sessionStatus } from "../../utils/Enums/sessions.enum.js";
import { generateJitsiToken } from "../../utils/security/jitsiToken.js";

// ─── constants ────────────────────────────────────────────────────────────────

const SESSION_DURATION_MS = 50 * 60 * 1000; // 50 minutes
const JOIN_EARLY_MS = 10 * 60 * 1000; // يقدر يدخل قبل البداية بـ 10 دقايق
const JOIN_LATE_MS = 10 * 60 * 1000;  // ويقدر يدخل بعد النهاية بـ 10 دقايق

// ─── helpers ──────────────────────────────────────────────────────────────────

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.cause = status;
  throw err;
};

// ─── createLiveSession ────────────────────────────────────────────────────────

export const createLiveSession = async ({
  userId,
  title,
  startAt,
  type = sessionType.GROUP,
  studentIds = [],
}) => {
  // التحقق إن اليوزر عنده teacher profile
  const teacher = await db.findFirst({ model: "teacher", where: { userId } });
  if (!teacher) throwError("TEACHER_NOT_FOUND", 404);

  // التحقق من وقت البداية
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    throwError("INVALID_START_TIME", 400);
  }
  const end = new Date(start.getTime() + SESSION_DURATION_MS);

  // التحقق من الطلاب
  const uniqueStudentIds = [...new Set(studentIds)];
  if (type === sessionType.ONE_TO_ONE && uniqueStudentIds.length !== 1) {
    throwError("ONE_TO_ONE_REQUIRES_ONE_STUDENT", 400);
  }

  let students = [];
  if (uniqueStudentIds.length > 0) {
    students = await db.findMany({
      model: "student",
      where: { id: { in: uniqueStudentIds } },
      select: { id: true, userId: true },
    });
    if (students.length !== uniqueStudentIds.length) {
      throwError("STUDENT_NOT_FOUND", 404);
    }
    // TODO: لما PlanSubscription يتضاف: اتأكد إن كل طالب عنده اشتراك شغال وفاضله رصيد
  }

  // التحقق من التعارض في الجدول
  const conflict = await db.findFirst({
    model: "session",
    where: {
      teacherId: teacher.id,
      status: { in: [sessionStatus.SCHEDULED, sessionStatus.LIVE] },
      startAt: { lt: end },
      endAt: { gt: start },
    },
  });
  if (conflict) throwError("SESSION_TIME_CONFLICT", 409);

  // إنشاء الـ session
  const session = await db.create({
    model: "session",
    data: {
      teacherId: teacher.id,
      title,
      type,
      startAt: start,
      endAt: end,
      roomName: `session-${randomUUID()}`,
      status: sessionStatus.SCHEDULED,
      participants: {
        create: students.map((s) => ({ studentId: s.id })),
      },
    },
    include: { participants: true },
  });

  // TODO: إشعار للطلاب المضافين

  return session;
};


export const joinLiveSession = async ({ liveSessionId, userId }) => {
  const session = await db.findFirst({
    model: "session",
    where: { id: liveSessionId },
    include: { teacher: { select: { userId: true } } },
  });
  if (!session) throwError("SESSION_NOT_FOUND", 404);

  if (
    session.status === sessionStatus.COMPLETED ||
    session.status === sessionStatus.CANCELLED
  ) {
    throwError("SESSION_ENDED", 400);
  }

  const now = Date.now();

  if (now < session.startAt.getTime() - JOIN_EARLY_MS) {
    throwError("SESSION_NOT_STARTED_YET", 400);
  }
  if (now > session.endAt.getTime() + JOIN_LATE_MS) {
    throwError("SESSION_JOIN_WINDOW_CLOSED", 400);
  }

  const requester = await db.findFirst({
    model: "user",
    where: { id: userId },
  });
  if (!requester) throwError("USER_NOT_FOUND", 404);

  const isModerator = session.teacher.userId === userId;

  if (isModerator) {
    // دخول المدرس هو اللي بيبدأ الـ session
    if (session.status === sessionStatus.SCHEDULED) {
      await db.updateOne({
        model: "session",
        where: { id: session.id },
        data: { status: sessionStatus.LIVE },
      });
    }
  } else {
    const student = await db.findFirst({
      model: "student",
      where: { userId },
    });
    if (!student) throwError("NOT_AUTHORIZED_TO_JOIN_SESSION", 403);

    const participant = await db.findFirst({
      model: "sessionParticipant",
      where: { sessionId: session.id, studentId: student.id },
    });
    
    if (!participant || participant.status === "CANCELLED") {
      throwError("NOT_AUTHORIZED_TO_JOIN_SESSION", 403);
    }

    // أول دخول بس هو اللي بيتسجل، وإعادة الدخول ما بتغيّرش joinedAt
    if (!participant.joinedAt) {
      await db.updateOne({
        model: "sessionParticipant",
        where: { id: participant.id },
        data: { status: "ATTENDED", joinedAt: new Date() },
      });
    }
  }

  const token = generateJitsiToken({
    userId: requester.id,
    roomName: session.roomName,
    userName: requester.fullName,
    userEmail: requester.email,
    isModerator,
  });

  return { token, roomName: session.roomName };
};

// ─── getLiveSession ───────────────────────────────────────────────────────────

export const getLiveSession = async ({ liveSessionId }) => {
  const session = await db.findFirst({
    model: "session",
    where: { id: liveSessionId },
    include: {
      teacher: {
        select: {
          id: true,
          user: { select: { id: true, fullName: true, email: true, profilePhoto: true } },
        },
      },
      participants: {
        include: {
          student: {
            select: { id: true, user: { select: { id: true, fullName: true, email: true } } },
          },
        },
      },
    },
  });
  if (!session) throwError("SESSION_NOT_FOUND", 404);

  return session;
};

// ─── getAllLiveSessions ───────────────────────────────────────────────────────

export const getAllLiveSessions = async ({ page, limit, search }) => {
  const where = {};
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const result = await db.findManyWithPaginationAndCount({
    model: "session",
    where,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    orderBy: { startAt: "desc" },
    include: {
      teacher: {
        select: {
          id: true,
          user: { select: { id: true, fullName: true, email: true, profilePhoto: true } },
        },
      },
    },
  });

  return result;
};

// ─── deleteLiveSession ────────────────────────────────────────────────────────

export const deleteLiveSession = async ({ liveSessionId }) => {
  const session = await db.findFirst({
    model: "session",
    where: { id: liveSessionId },
  });
  if (!session) throwError("SESSION_NOT_FOUND", 404);

  if (session.status === sessionStatus.LIVE) {
    throwError("SESSION_CANNOT_BE_DELETED_WHILE_LIVE", 409);
  }

  return await db.deleteOne({
    model: "session",
    where: { id: liveSessionId },
  });
};

// ─── startLiveSession ────────────────────────────────────────────────────────

export const startLiveSession = async ({ liveSessionId, userId }) => {
  const session = await db.findFirst({
    model: "session",
    where: { id: liveSessionId },
    include: { teacher: { select: { userId: true } } },
  });
  if (!session) throwError("SESSION_NOT_FOUND", 404);

  if (session.teacher.userId !== userId) {
    throwError("NOT_AUTHORIZED_TO_START_SESSION", 403);
  }

  if (session.status === sessionStatus.LIVE) {
    throwError("SESSION_ALREADY_LIVE", 409);
  }

  if (
    session.status === sessionStatus.COMPLETED ||
    session.status === sessionStatus.CANCELLED
  ) {
    throwError("SESSION_ALREADY_ENDED_OR_CANCELLED", 400);
  }

  const updatedSession = await db.updateOne({
    model: "session",
    where: { id: liveSessionId },
    data: { status: sessionStatus.LIVE },
  });

  // TODO: إشعار للمشتركين إن الـ session بدأت

  return updatedSession;
};

// ─── updateLiveSession ────────────────────────────────────────────────────────

export const updateLiveSession = async ({
  liveSessionId,
  userId,
  startAt,
  title,
  type,
}) => {
  const session = await db.findFirst({
    model: "session",
    where: { id: liveSessionId },
    include: { teacher: { select: { userId: true } } },
  });
  if (!session) throwError("SESSION_NOT_FOUND", 404);

  if (session.teacher.userId !== userId) {
    throwError("NOT_AUTHORIZED_TO_UPDATE_SESSION", 403);
  }

  // بنسمح بالتعديل فقط لو الـ session لسه SCHEDULED
  if (session.status !== sessionStatus.SCHEDULED) {
    throwError("SESSION_CANNOT_BE_UPDATED", 409);
  }

  // لو بيغير وقت البداية، نتحقق من التعارض
  let newStart = session.startAt;
  let newEnd = session.endAt;
  if (startAt) {
    newStart = new Date(startAt);
    if (Number.isNaN(newStart.getTime()) || newStart <= new Date()) {
      throwError("INVALID_START_TIME", 400);
    }
    newEnd = new Date(newStart.getTime() + SESSION_DURATION_MS);

    const conflict = await db.findFirst({
      model: "session",
      where: {
        id: { not: liveSessionId },
        teacherId: session.teacherId,
        status: { in: [sessionStatus.SCHEDULED, sessionStatus.LIVE] },
        startAt: { lt: newEnd },
        endAt: { gt: newStart },
      },
    });
    if (conflict) throwError("SESSION_TIME_CONFLICT", 409);
  }

  if (type && !Object.values(sessionType).includes(type)) {
    throwError("INVALID_SESSION_TYPE", 400);
  }

  const updatedSession = await db.updateOne({
    model: "session",
    where: { id: liveSessionId },
    data: {
      ...(title !== undefined && { title }),
      ...(startAt && { startAt: newStart, endAt: newEnd }),
      ...(type && { type }),
    },
  });

  return updatedSession;
};

// ─── endLiveSession ───────────────────────────────────────────────────────────

export const endLiveSession = async ({ liveSessionId, userId }) => {
  const session = await db.findFirst({
    model: "session",
    where: { id: liveSessionId },
    include: { teacher: { select: { userId: true } } },
  });
  if (!session) throwError("SESSION_NOT_FOUND", 404);

  if (session.teacher.userId !== userId) {
    throwError("NOT_AUTHORIZED_TO_END_SESSION", 403);
  }

  if (
    session.status === sessionStatus.COMPLETED ||
    session.status === sessionStatus.CANCELLED
  ) {
    throwError("SESSION_ALREADY_ENDED_OR_CANCELLED", 400);
  }

  const updatedSession = await db.updateOne({
    model: "session",
    where: { id: liveSessionId },
    data: {
      status: sessionStatus.COMPLETED,
      endAt: new Date(),
    },
  });

  // تحديث الطلاب الغايبين (اللي ما دخلوش)
  await db.updateMany({
    model: "sessionParticipant",
    where: {
      sessionId: liveSessionId,
      status: "BOOKED",
    },
    data: { status: "ABSENT" },
  });

  return updatedSession;
};

// ─── getStudentUpcomingLiveSessions ──────────────────────────────────────────

export const getStudentUpcomingLiveSessions = async ({
  userId,
  page,
  limit,
  search,
}) => {
  const student = await db.findFirst({
    model: "student",
    where: { userId },
  });
  if (!student) throwError("STUDENT_NOT_FOUND", 404);

  const now = new Date();

  const where = {
    participants: {
      some: {
        studentId: student.id,
        status: { not: "CANCELLED" },
      },
    },
    startAt: { gte: now },
    status: {
      notIn: [sessionStatus.CANCELLED, sessionStatus.COMPLETED],
    },
    ...(search && { title: { contains: search, mode: "insensitive" } }),
  };

  const result = await db.findManyWithPaginationAndCount({
    model: "session",
    where,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    orderBy: { startAt: "asc" },
    include: {
      teacher: {
        select: {
          id: true,
          user: {
            select: { id: true, fullName: true, email: true, phone: true, profilePhoto: true },
          },
        },
      },
    },
  });

  return result;
};

// ─── getStudentNextLiveSession ────────────────────────────────────────────────

export const getStudentNextLiveSession = async ({ userId }) => {
  const student = await db.findFirst({
    model: "student",
    where: { userId },
  });
  if (!student) throwError("STUDENT_NOT_FOUND", 404);

  const now = new Date();

  const nextSession = await db.findFirst({
    model: "session",
    where: {
      participants: {
        some: {
          studentId: student.id,
          status: { not: "CANCELLED" },
        },
      },
      startAt: { gte: now },
      status: {
        notIn: [sessionStatus.CANCELLED, sessionStatus.COMPLETED],
      },
    },
    orderBy: { startAt: "asc" },
    include: {
      teacher: {
        select: {
          id: true,
          user: {
            select: { id: true, fullName: true, email: true, phone: true, profilePhoto: true },
          },
        },
      },
    },
  });

  return nextSession;
};
