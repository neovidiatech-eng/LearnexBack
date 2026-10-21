import dbService from "../../../db/db.service.js";
import { SESSION_DURATION_MS } from "../../../utils/constants/session.constant.js";
import { requestStatus } from "../../../utils/Enums/session-request.enum.js";
import { sessionStatus } from "../../../utils/Enums/sessions.enum.js";
import { generateJitsiToken } from "../../../utils/security/jitsiToken.js";
import { isSlotAvailable } from "../session/avialbilty/avilability.service.js";

const ACTIVE_SESSION = [sessionStatus.LIVE, sessionStatus.SCHEDULED];
const JOIN_LATE_MS = 15 * 60 * 1000;

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.cause = status;
  throw err;
};

const getStudentByUser = async (userId) => {
  const student = await dbService.findFirst({
    model: "student",
    where: { userId },
    select: { id: true, sessionLeft: true, sessionCount: true },
  });
  if (!student) throwError("STUDENT_NOT_FOUND", 404);
  return student;
};

const hasStudentConflict = async ({ studentId, startAt, endAt }) => {
  const conflict = await dbService.findFirst({
    model: "session",
    where: {
      studentId,
      status: { in: ACTIVE_SESSION },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  });
  return Boolean(conflict);
};

export const createSessionRequest = async ({ userId, teacherId, startAt, note, title }) => {
  const student = await getStudentByUser(userId);

  const teacher = await dbService.findFirst({
    model: "teacher",
    where: { id: teacherId },
    select: { id: true, isAvailable: true },
  });
  if (!teacher) throwError("TEACHER_NOT_FOUND", 404);

  // 1. Check student's active session balance with this teacher
  const now = new Date();
  const activeSubs = await dbService.findMany({
    model: "teacherSubscription",
    where: {
      studentId: student.id,
      teacherId: teacher.id,
      status: "ACTIVE",
      sessionLeft: { gt: 0 },
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
    select: { id: true, sessionLeft: true },
  });

  const totalSubLeft = activeSubs.reduce((acc, sub) => acc + sub.sessionLeft, 0);
  const availableBalance = totalSubLeft > 0 ? totalSubLeft : (student.sessionLeft || 0);

  if (availableBalance <= 0) {
    throwError("INSUFFICIENT_SESSION_BALANCE", 400);
  }

  // 2. Count active pending requests and scheduled sessions with this teacher
  const bookedOrPendingCount = await dbService.count({
    model: "sessionRequest",
    where: {
      studentId: student.id,
      teacherId: teacher.id,
      OR: [
        { status: requestStatus.PENDING },
        {
          status: requestStatus.ACCEPTED,
          session: { status: { in: ACTIVE_SESSION } },
        },
      ],
    },
  });

  if (availableBalance <= bookedOrPendingCount) {
    throwError("INSUFFICIENT_AVAILABLE_SESSIONS", 400);
  }

  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) throwError("INVALID_START_DATE", 400);
  const end = new Date(start.getTime() + SESSION_DURATION_MS);

  if (!(await isSlotAvailable({ teacherId: teacher.id, startAt: start }))) {
    throwError("SLOT_NOT_AVAILABLE", 409);
  }

  if (await hasStudentConflict({ studentId: student.id, startAt: start, endAt: end })) {
    throwError("STUDENT_TIME_CONFLICT", 409);
  }

  const pending = await dbService.findFirst({
    model: "sessionRequest",
    where: {
      studentId: student.id,
      status: requestStatus.PENDING,
      startAt: { lt: end },
      endAt: { gt: start },
    },
    select: { id: true },
  });
  if (pending) throwError("STUDENT_HAS_PENDING_REQUEST_AT_THIS_TIME", 409);

  const request = await dbService.create({
    model: "sessionRequest",
    data: {
      studentId: student.id,
      teacherId: teacher.id,
      title: title?.trim() || null,
      startAt: start,
      endAt: end,
      note: note?.trim() || null,
      status: requestStatus.PENDING,
    },
  });

  return request;
};

export const cancelSessionRequest = async ({ userId, requestId }) => {
  const student = await getStudentByUser(userId);
  const request = await dbService.findFirst({
    model: "sessionRequest",
    where: { id: requestId },
  });

  if (!request) throwError("REQUEST_NOT_FOUND", 404);

  if (request.studentId !== student.id) throwError("UNAUTHORIZED", 403);
  if (request.status !== requestStatus.PENDING) {
    throwError("REQUEST_NOT_PENDING", 400);
  }

  try {
    return await dbService.updateOne({
      model: "sessionRequest",
      where: { id: requestId, status: requestStatus.PENDING },
      data: { status: requestStatus.CANCELLED },
    });
  } catch (err) {
    if (err?.code === "P2025") throwError("REQUEST_NOT_PENDING", 409);
    throw err;
  }
};

export const createCustomSessionRequest = async ({
  userId,
  teacherId,
  sessionsCount,
  validityDays = 30,
}) => {
  const student = await getStudentByUser(userId);

  const teacher = await dbService.findFirst({
    model: "teacher",
    where: { id: teacherId },
    select: { id: true, sessionPrice50Min: true, isAvailable: true },
  });

  if (!teacher) throwError("TEACHER_NOT_FOUND", 404);

  const pricePerSession = Number(teacher.sessionPrice50Min || 0);
  if (pricePerSession <= 0) {
    throwError("TEACHER_HAS_NO_SESSION_PRICE", 400);
  }

  const count = Number(sessionsCount);
  if (!count || count < 1) {
    throwError("INVALID_SESSIONS_COUNT", 400);
  }

  const totalPrice = Number((count * pricePerSession).toFixed(2));

  return await dbService.create({
    model: "customSessionRequest",
    data: {
      studentId: student.id,
      teacherId: teacher.id,
      sessionsCount: count,
      pricePerSession,
      totalPrice,
      validityDays: Number(validityDays) || 30,
      status: "PENDING",
    },
  });
};

export const getStudentCustomSessionRequests = async ({
  userId,
  status,
  page = 1,
  limit = 20,
}) => {
  const student = await getStudentByUser(userId);

  return dbService.findManyWithPaginationAndCount({
    model: "customSessionRequest",
    where: {
      studentId: student.id,
      ...(status ? { status } : {}),
    },
    page,
    limit,
    orderBy: { createdAt: "desc" },
    include: {
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

export const cancelCustomSessionRequest = async ({ userId, requestId }) => {
  const student = await getStudentByUser(userId);

  const request = await dbService.findFirst({
    model: "customSessionRequest",
    where: { id: requestId },
  });

  if (!request) throwError("REQUEST_NOT_FOUND", 404);
  if (request.studentId !== student.id) throwError("UNAUTHORIZED", 403);
  if (request.status !== "PENDING") {
    throwError("REQUEST_NOT_PENDING", 400);
  }

  return await dbService.updateOne({
    model: "customSessionRequest",
    where: { id: requestId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
};

export const joinSession = async ({ userId, sessionId }) => {
  const student = await dbService.findFirst({
    model: "student",
    where: { userId },
    select: {
      id: true,
      user: { select: { fullName: true } },
    },
  });

  if (!student) {
    throwError("STUDENT_NOT_FOUND", 404);
  }

  const session = await dbService.findFirst({
    model: "session",
    where: {
      id: sessionId,
      studentId: student.id,
    },
    select: {
      id: true,
      status: true,
      endAt: true,
      roomName: true,
      studentJoinedAt: true,
    },
  });

  if (!session) {
    throwError("SESSION_NOT_FOUND", 404);
  }

  if (session.status !== sessionStatus.LIVE) {
    throwError("SESSION_NOT_JOINABLE", 409);
  }

  if (!session.roomName) {
    throwError("ROOM_NOT_READY", 409);
  }

  const now = Date.now();

  if (now > session.endAt.getTime() + JOIN_LATE_MS) {
    throwError("SESSION_JOIN_EXPIRED", 409);
  }

  const ttlSeconds = Math.ceil(
    (session.endAt.getTime() + JOIN_LATE_MS - now) / 1000,
  );

  if (ttlSeconds <= 0) {
    throwError("SESSION_JOIN_EXPIRED", 409);
  }

  if (!session.studentJoinedAt) {
    await dbService.updateOne({
      model: "session",
      where: { id: session.id },
      data: { studentJoinedAt: new Date() },
    });
  }

  const token = generateJitsiToken({
    userId,
    roomName: session.roomName,
    userName: student.user?.fullName || "Student",
    isModerator: false,
    ttlSeconds,
  });

  return {
    sessionId: session.id,
    roomName: session.roomName,
    token,
  };
};

export const getStudentSessions = async ({
  userId,
  status,
  page = 1,
  limit = 20,
}) => {
  const student = await getStudentByUser(userId);

  const where = {
    studentId: student.id,
    ...(status
      ? { status }
      : { status: { in: ACTIVE_SESSION }, endAt: { gte: new Date() } }
    ),
  };

  return dbService.findManyWithPaginationAndCount({
    model: "session",
    where,
    page,
    limit,
    orderBy: { startAt: status === sessionStatus.COMPLETED ? "desc" : "asc" },
    include: {
      request: {
        select: {
          id: true,
          title: true,
          note: true,
        },
      },
      teacherSubscription: {
        select: {
          id: true,
          type: true,
          status: true,
          sessionLeft: true,
          sessionUsed: true,
        },
      },
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

export const getStudentSessionRequests = async ({
  userId,
  status,
  page = 1,
  limit = 20,
}) => {
  const student = await getStudentByUser(userId);

  return dbService.findManyWithPaginationAndCount({
    model: "sessionRequest",
    where: {
      studentId: student.id,
      ...(status ? { status } : {}),
    },
    page,
    limit,
    orderBy: { createdAt: "desc" },
    include: {
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              email: true,
            },
          },
        },
      },
      session: {
        select: {
          id: true,
          status: true,
          startAt: true,
          endAt: true,
          roomName: true,
        },
      },
    },
  });
};