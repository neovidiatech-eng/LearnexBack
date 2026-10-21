import dayjs from "dayjs";
import * as db from "../../../db/db.service.js";
import { sessionStatus } from "../../../utils/Enums/session.enum.js";
import { throwError } from "../../../utils/response.js";

const user = { select: { id: true, fullName: true, profilePhoto: true } };
export const getCalendarService = async (query = {}) => {
  const now = dayjs();
  const year = Number(query.year) || now.year();
  const month = Number(query.month) || now.month() + 1;
  const startDate = dayjs(new Date(year, month - 1, 1));
  const endDate = startDate.add(1, "month");

  const [totalSessions, scheduled, completed, cancelled, sessions] =
    await Promise.all([
      db.count({ model: "session" }),
      db.count({
        model: "session",
        where: { status: sessionStatus.SCHEDULED },
      }),
      db.count({
        model: "session",
        where: { status: sessionStatus.COMPLETED },
      }),
      db.count({
        model: "session",
        where: { status: sessionStatus.CANCELLED },
      }),
      db.findMany({
        model: "session",
        where: { startAt: { gte: startDate.toDate(), lt: endDate.toDate() } },
        select: {
          id: true,
          title: true,
          status: true,
          startAt: true,
          endAt: true,
          teacher: { select: { id: true, user } },
          student: { select: { id: true, user } },
        },
        orderBy: { startAt: "asc" },
      }),
    ]);

  const sessionsByDay = sessions.reduce((acc, session) => {
    const key = dayjs(session.startAt).format("YYYY-MM-DD");
    (acc[key] ||= []).push(session);
    return acc;
  }, {});

  return {
    stats: {
      totalSessions,
      scheduled,
      completed,
      cancelled,
    },
    calendar: {
      month,
      year,
      sessionsByDay,
    },
  };
};

export const getCalendarByIdService = async (id) => {
  const calendar = await db.findOne({
    model: "session",
    where: { id },
    include: {
      teacher: {
        select: { id: true, headline: true, subject: true, user },
      },
      student: { select: { id: true, user } },
      request: true,
      teacherSubscription: { include: { plan: true } },
    },
  });
  if (!calendar) {
    throwError({
      message: "CALENDAR_NOT_FOUND",
      status: 404,
    });
  }
  return calendar;
};
