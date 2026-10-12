import dbService from "../../../db/db.service.js";
import { SESSION_DURATION_MS } from "../../../utils/constants/session.constant.js";
import { requestStatus } from "../../../utils/Enums/session-request.enum.js";
import { sessionStatus } from "../../../utils/Enums/sessions.enum.js";
import { isSlotAvailable } from "../session/avialbilty/avilability.service.js";

const ACTIVE_SESSION = [sessionStatus.LIVE, sessionStatus.SCHEDULED];

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.cause = status;
  throw err;
};

const getStudentByUser = async (userId) => {
  const student = await dbService.findFirst({
    model: "student",
    where: { userId },
    select: { id: true },
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

export const createSessionRequest = async ({ userId, teacherId, startAt, note }) => {
  const student = await getStudentByUser(userId);

  const teacher = await dbService.findFirst({
    model: "teacher",
    where: { id: teacherId },
    select: { id: true },
  });
  if (!teacher) throwError("TEACHER_NOT_FOUND", 404);

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
      startAt: start,
      endAt: end,
      note: note?.trim() || null,
      status: requestStatus.PENDING,
    },
  });

  // TODO: إشعار للمدرس بطلب جديد
  return request;
};

export const cancelSessionRequest = async({userId,requestId})=>{
  const student = await getStudentByUser(userId);
  const request = await dbService.findFirst({
    model:"sessionRequest",
    where:{id:requestId}
  })

  if(!request) throwError("REQUEST_NOT_FOUND",404);

  if(request.studentId !== student.id) throwError("UNAUTHORIZED",403);
  if(request.status !== requestStatus.PENDING){
    throwError("REQUEST_NOT_PENDING",400)
  }

  try {
    // شرط status في الـ where بيمنع الإلغاء لو المدرس قبل أو رفض في نفس اللحظة
    return await dbService.updateOne({
      model: "sessionRequest",
      where: { id: requestId, status: requestStatus.PENDING },
      data: { status: requestStatus.CANCELLED },
    });
  } catch (err) {
    if (err?.code === "P2025") throwError("REQUEST_NOT_PENDING", 409);
    throw err;
  }

  // TODO: إشعار للمدرس إن الطلب اتلغى
  
}