
import { nanoid } from "nanoid";
import dbService from "../../../db/db.service.js";
import { requestStatus } from "../../../utils/Enums/session-request.enum.js";
import { sessionStatus } from "../../../utils/Enums/sessions.enum.js";
import { generateJitsiToken } from "../../../utils/security/jitsiToken.js";
import { isSlotAvailable } from "../../student/session/avialbilty/avilability.service.js";

const throwError = (message, status = 400) => {
  const error = new Error(message);
  error.cause = status;
  throw error;
};
const getTeacherId = async (userId) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });
  if (!teacher) throwError("TEACHER_NOT_FOUND", 404);
  return teacher.id;
};


const ACTIVE_SESSIONS = [sessionStatus.SCHEDULED,sessionStatus.LIVE]
const JOIN_EARLY_MS = 10 * 60 * 1000; // 10 دقايق قبل الميعاد
const JOIN_LATE_MS = 15 * 60 * 1000;  // 15 دقيقة بعد الميعاد

export const getTeacherSessionRequests = async ({
  userId,
  status = requestStatus.PENDING,
  page = 1,
  limit = 20,
}) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });

  if (!teacher) throwError("TEACHER_NOT_FOUND", 404);

  return dbService.findManyWithPaginationAndCount({
    model: "sessionRequest",
    where: {
      teacherId: teacher.id,
      ...(status ? { status } : {}),
    },
    page,
    limit,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      },
    },
  });
};

export const acceptRequest = async ({ userId, requestId }) => {
  const teacherId = await getTeacherId(userId);

  return dbService.transaction(async (tx) => {
    const request = await tx.findFirst({
      model: "sessionRequest",
      where: { id: requestId, teacherId },
    });

    if (!request) throwError("REQUEST_NOT_FOUND", 404);
    if (request.status !== requestStatus.PENDING) {
      throwError("REQUEST_NOT_PENDING", 409);
    }
    if (request.startAt <= new Date()) {
      throwError("REQUEST_EXPIRED", 409);
    }

    const slotAvailable = await isSlotAvailable({
      teacherId,
      startAt: request.startAt,
    });
    if (!slotAvailable) throwError("SLOT_NOT_AVAILABLE", 409);

    const overlap = {
      status: { in: ACTIVE_SESSIONS },
      startAt: { lt: request.endAt },
      endAt: { gt: request.startAt },
    };

    const teacherConflict = await tx.findFirst({
      model: "session",
      where: { teacherId, ...overlap },
      select: { id: true },
    });
    if (teacherConflict) throwError("TEACHER_TIME_CONFLICT", 409);

    const studentConflict = await tx.findFirst({
      model: "session",
      where: { studentId: request.studentId, ...overlap },
      select: { id: true },
    });
    if (studentConflict) throwError("STUDENT_TIME_CONFLICT", 409);

    const now = new Date();
    const activeSub = await tx.findFirst({
      model: "teacherSubscription",
      where: {
        studentId: request.studentId,
        teacherId,
        status: "ACTIVE",
        sessionLeft: { gt: 0 },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: [
        { expiresAt: "asc" },
        { createdAt: "asc" },
      ],
      select: { id: true },
    });

    if (!activeSub) {
      throwError("ACTIVE_SUBSCRIPTION_NOT_FOUND", 409);
    }

    const { count } = await tx.updateMany({
      model: "sessionRequest",
      where: { id: request.id, status: requestStatus.PENDING },
      data: {
        status: requestStatus.ACCEPTED,
        respondedAt: new Date(),
      },
    });
    if (count === 0) throwError("REQUEST_NOT_PENDING", 409);

    const session = await tx.create({
      model: "session",
      data: {
        requestId: request.id,
        teacherId,
        studentId: request.studentId,
        teacherSubscriptionId: activeSub.id,
        title: request.title || "Private Session",
        roomName: `session_${nanoid(10)}`,
        startAt: request.startAt,
        endAt: request.endAt,
        status: sessionStatus.SCHEDULED,
      },
    });

    return { requestId: request.id, session };
  });
};

export const rejectRequest = async ({
  userId,
  requestId,
  rejectedReason,
}) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });

  if (!teacher) throwError("TEACHER_NOT_FOUND", 404);

  const request = await dbService.findFirst({
    model: "sessionRequest",
    where: {
      id: requestId,
      teacherId: teacher.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!request) throwError("REQUEST_NOT_FOUND", 404);

  if (request.status !== requestStatus.PENDING) {
    throwError("REQUEST_NOT_PENDING", 409);
  }

  try {
    return await dbService.updateOne({
      model: "sessionRequest",
      where: {
        id: request.id,
        status: requestStatus.PENDING,
      },
      data: {
        status: requestStatus.REJECTED,
        rejectedReason: rejectedReason?.trim() || null,
        respondedAt: new Date(),
      },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      throwError("REQUEST_NOT_PENDING", 409);
    }
    throw error;
  }
};

export const getMySessions = async ({
  userId,
  status,
  page = 1,
  limit = 20,
}) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });

  if (!teacher) throwError("TEACHER_NOT_FOUND", 404);

  const where = {
    teacherId:teacher.id,
    ...(status
      ?{status}
      :{status:{in:ACTIVE_SESSIONS},endAt:{gte:new Date()}}
    )
  }

  return dbService.findManyWithPaginationAndCount({
    model: "session",
    where,
    page,
    limit,
    orderBy: { startAt: status === sessionStatus.COMPLETED ? "desc" : "asc" },
    include: {
      request: {
        select: {
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
      student: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      },
    },
  });
};


export const startSession = async({userId,sessionId})=>{
  const teacher = await dbService.findFirst({
    model:"teacher",
    where:{userId},
    select:{id:true}
  });

  if(!teacher){
    throwError("TEACHER_NOT_FOUND", 404);

  }
  const session = await dbService.findFirst({
    model:"session",
    where:{
      id:sessionId,
      teacherId:teacher.id
    }

  })
  if(!session){
    throwError("SESSION_NOT_FOUND", 404)
  }
  

  if(session.status !== sessionStatus.SCHEDULED){
    throwError("SESSION_NOT_SCHEDULED", 409)
  }
  const now = new Date();

  const earliestStart = new Date(
    session.startAt.getTime() - JOIN_EARLY_MS
  );
  const latestStart = new Date(
    session.startAt.getTime() + JOIN_LATE_MS
  );

  if (now < earliestStart) {
    throwError("SESSION_START_TOO_EARLY", 400);
  }

  if (now > latestStart) {
    throwError("SESSION_START_TIME_EXPIRED", 409);
  }

  try {
    return await dbService.updateOne({
      model: "session",
      where: {
        id: session.id,
        status: sessionStatus.SCHEDULED,
      },
      data: {
        status: sessionStatus.LIVE,
        actualStartAt: new Date(),
        ...(!session.roomName ? { roomName: `session_${nanoid(10)}` } : {}),
      },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      throwError("SESSION_NOT_SCHEDULED", 409);
    }

    throw error;
  }
}

export const endSession = async ({ userId, sessionId }) => {
  const teacherId = await getTeacherId(userId);

  return dbService.transaction(async (tx) => {
    // 1. Verify that the session belongs to this teacher
    const session = await tx.findFirst({
      model: "session",
      where: {
        id: sessionId,
        teacherId,
      },
    });

    if (!session) {
      throwError("SESSION_NOT_FOUND", 404);
    }

    if (session.status !== sessionStatus.LIVE) {
      throwError("SESSION_NOT_LIVE", 409);
    }

    // 2. Verify the exact subscription assigned to this session (or fallback to active subscription)
    let subscription = null;
    if (session.teacherSubscriptionId) {
      subscription = await tx.findFirst({
        model: "teacherSubscription",
        where: {
          id: session.teacherSubscriptionId,
          studentId: session.studentId,
          teacherId,
          status: "ACTIVE",
          sessionLeft: { gt: 0 },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        select: {
          id: true,
        },
      });
    }

    if (!subscription) {
      subscription = await tx.findFirst({
        model: "teacherSubscription",
        where: {
          studentId: session.studentId,
          teacherId,
          status: "ACTIVE",
          sessionLeft: { gt: 0 },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        orderBy: [
          { expiresAt: "asc" },
          { createdAt: "asc" },
        ],
        select: {
          id: true,
        },
      });
    }

    if (!subscription) {
      throwError("ACTIVE_SUBSCRIPTION_NOT_FOUND", 409);
    }

    // 3. Complete the session exactly once
    const { count: completed } = await tx.updateMany({
      model: "session",
      where: {
        id: sessionId,
        teacherId,
        status: sessionStatus.LIVE,
      },
      data: {
        status: sessionStatus.COMPLETED,
        actualEndAt: new Date(),
        teacherSubscriptionId: subscription.id,
      },
    });

    if (completed !== 1) {
      throwError("SESSION_NOT_LIVE", 409);
    }

    // 4. Deduct one session atomically from teacherSubscription
    const { count: deducted } = await tx.updateMany({
      model: "teacherSubscription",
      where: {
        id: subscription.id,
        status: "ACTIVE",
        sessionLeft: { gt: 0 },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      data: {
        sessionLeft: { decrement: 1 },
        sessionUsed: { increment: 1 },
      },
    });

    if (deducted !== 1) {
      throwError("SUBSCRIPTION_BALANCE_CHANGED", 409);
    }

    // 5. Complete the subscription when its balance reaches zero
    await tx.updateMany({
      model: "teacherSubscription",
      where: {
        id: subscription.id,
        status: "ACTIVE",
        sessionLeft: 0,
      },
      data: {
        status: "COMPLETED",
      },
    });

    // 6. Keep student legacy session counts in sync
    await tx.updateMany({
      model: "student",
      where: {
        id: session.studentId,
        sessionLeft: { gt: 0 },
      },
      data: {
        sessionLeft: { decrement: 1 },
        sessionUsed: { increment: 1 },
      },
    });

    return tx.findFirst({
      model: "session",
      where: { id: sessionId },
      include: {
        teacherSubscription: {
          select: {
            id: true,
            type: true,
            status: true,
            sessionLeft: true,
            sessionUsed: true,
          },
        },
      },
    });
  });
};

export const getTeacherCustomSessionRequests = async ({
  userId,
  status = "PENDING",
  page = 1,
  limit = 20,
}) => {
  const teacherId = await getTeacherId(userId);

  return dbService.findManyWithPaginationAndCount({
    model: "customSessionRequest",
    where: {
      teacherId,
      ...(status ? { status } : {}),
    },
    page,
    limit,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
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

export const acceptCustomSessionRequest = async ({ userId, requestId }) => {
  const teacherId = await getTeacherId(userId);

  return dbService.transaction(async (tx) => {
    const request = await tx.findFirst({
      model: "customSessionRequest",
      where: { id: requestId, teacherId },
    });

    if (!request) throwError("REQUEST_NOT_FOUND", 404);
    if (request.status !== "PENDING") {
      throwError("REQUEST_NOT_PENDING", 409);
    }

    // 1. Mark request as ACCEPTED
    const updatedRequest = await tx.updateOne({
      model: "customSessionRequest",
      where: { id: request.id, status: "PENDING" },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });

    const validityDays = request.validityDays || 30;
    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    // 2. Activate teacherSubscription for the student
    const subscription = await tx.create({
      model: "teacherSubscription",
      data: {
        teacherId,
        studentId: request.studentId,
        status: "ACTIVE",
        amount: request.totalPrice,
        type: "CUSTOM",
        sessionsCount: request.sessionsCount,
        sessionLeft: request.sessionsCount,
        sessionUsed: 0,
        expiresAt,
      },
    });

    // 3. Keep student legacy session counts in sync
    const studentRecord = await tx.findFirst({
      model: "student",
      where: { id: request.studentId },
      select: { id: true, sessionCount: true, sessionLeft: true },
    });

    if (studentRecord) {
      await tx.updateOne({
        model: "student",
        where: { id: studentRecord.id },
        data: {
          sessionCount: (studentRecord.sessionCount || 0) + request.sessionsCount,
          sessionLeft: (studentRecord.sessionLeft || 0) + request.sessionsCount,
        },
      });
    }

    return { request: updatedRequest, subscription };
  });
};

export const rejectCustomSessionRequest = async ({
  userId,
  requestId,
  rejectedReason,
}) => {
  const teacherId = await getTeacherId(userId);

  const request = await dbService.findFirst({
    model: "customSessionRequest",
    where: { id: requestId, teacherId },
  });

  if (!request) throwError("REQUEST_NOT_FOUND", 404);
  if (request.status !== "PENDING") {
    throwError("REQUEST_NOT_PENDING", 409);
  }

  return await dbService.updateOne({
    model: "customSessionRequest",
    where: { id: request.id, status: "PENDING" },
    data: {
      status: "REJECTED",
      rejectedReason: rejectedReason?.trim() || null,
      respondedAt: new Date(),
    },
  });
};

export const joinSession = async({userId,sessionId})=>{
  const teacherId = await getTeacherId(userId);
  const session = await dbService.findFirst({
    model:"session",
    where:{id:sessionId,teacherId},
    select:{
      id:true,
      status:true,
      endAt:true,
      roomName:true,
      teacher: { select: { user: { select: { fullName: true } } } },
    }
  })
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



  const token = generateJitsiToken({
    userId,
    roomName:session.roomName,
    userName:session.teacher.user.fullName,
    isModerator:true,
    ttlSeconds,
  })
  return {
    sessionId:session.id,
    roomName:session.roomName,
    token,
  }
  
}

