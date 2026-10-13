import { DateTime } from "luxon";
import * as db from "../../../../db/db.service.js";
import {
  DEFAULT_TIMEZONE,
  MAX_DAYS_AHEAD,
  MIN_LEAD_MS,
  SESSION_DURATION_MS,
  SLOT_STEP_MIN,
} from "../../../../utils/constants/session.constant.js";
import { sessionStatus } from "../../../../utils/Enums/sessions.enum.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]; // luxon: Monday = 1
const ACTIVE_SESSION = [sessionStatus.SCHEDULED, sessionStatus.LIVE];

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.cause = status;
  throw err;
};

const dayKey = (day) => String(day).slice(0, 3).toLowerCase();

const generateCandidates = (workHours, zone, rangeStartMs, rangeEndMs) => {
  const byDay = new Map(
    workHours.map((hour) => [dayKey(hour.day), hour.slots || []]),
  );

  const slots = [];

  let day = DateTime.fromMillis(rangeStartMs, { zone }).startOf("day");
  const lastDay = DateTime.fromMillis(rangeEndMs, { zone }).startOf("day");

  while (day.toMillis() <= lastDay.toMillis()) {
    const ranges = byDay.get(DAYS[day.weekday - 1]) || [];

    for (const { startTime, endTime } of ranges) {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      let cursor = day.set({
        hour: startHour,
        minute: startMinute,
        second: 0,
        millisecond: 0,
      });
      const rangeEnd = day.set({
        hour: endHour,
        minute: endMinute,
        second: 0,
        millisecond: 0,
      });

      if (rangeEnd.toMillis() <= cursor.toMillis()) continue;

      while (cursor.toMillis() + SESSION_DURATION_MS <= rangeEnd.toMillis()) {
        const startAtMs = cursor.toMillis();

        if (startAtMs >= rangeStartMs && startAtMs < rangeEndMs) {
          slots.push({
            startAt: new Date(startAtMs),
            endAt: new Date(startAtMs + SESSION_DURATION_MS),
          });
        }

        cursor = cursor.plus({ minutes: SLOT_STEP_MIN });
      }
    }

    day = day.plus({ days: 1 });
  }

  return slots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
};

export const getAvailableSlots = async ({ teacherId, from, to }) => {
  if (
    !(from instanceof Date) ||
    !(to instanceof Date) ||
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    from >= to
  ) {
    throwError("INVALID_DATE_RANGE", 400);
  }

  const teacher = await db.findFirst({
    model: "teacher",
    where: { id: teacherId },
    select: { id: true, isAvailable: true },
  });
  if (!teacher) throwError("TEACHER_NOT_FOUND", 404);

  const record = await db.findFirst({
    model: "teacherWorkHours",
    where: { teacherId },
  });

  const zone = record?.timezone || DEFAULT_TIMEZONE;
  if (!DateTime.now().setZone(zone).isValid) {
    throwError("INVALID_TEACHER_TIMEZONE", 400);
  }

  if (!teacher.isAvailable || !record?.workHours?.length) {
    return { timezone: zone, slots: [] };
  }

  const now = Date.now();
  const rangeStartMs = Math.max(from.getTime(), now + MIN_LEAD_MS);
  const rangeEndMs = Math.min(to.getTime(), now + MAX_DAYS_AHEAD * DAY_MS);

  if (rangeStartMs >= rangeEndMs) return { timezone: zone, slots: [] };

  const candidates = generateCandidates(
    record.workHours,
    zone,
    rangeStartMs,
    rangeEndMs,
  );
  if (candidates.length === 0) return { timezone: zone, slots: [] };

  const booked = await db.findMany({
    model: "session",
    where: {
      teacherId,
      status: { in: ACTIVE_SESSION },
      startAt: { lt: new Date(rangeEndMs + SESSION_DURATION_MS) },
      endAt: { gt: new Date(rangeStartMs) },
    },
    select: { startAt: true, endAt: true },
  });

  const slots = candidates.filter(
    (candidate) =>
      !booked.some(
        (session) =>
          session.startAt < candidate.endAt &&
          session.endAt > candidate.startAt,
      ),
  );

  return { timezone: zone, slots };
};

export const isSlotAvailable = async ({ teacherId, startAt }) => {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return false;

  const { slots } = await getAvailableSlots({
    teacherId,
    from: start,
    to: new Date(start.getTime() + 60 * 1000),
  });

  return slots.some((slot) => slot.startAt.getTime() === start.getTime());
};

export const hasSessionConflict = async ({ teacherId, startAt, endAt }) => {
  const conflict = await db.findFirst({
    model: "session",
    where: {
      teacherId,
      status: { in: ACTIVE_SESSION },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  });
  return Boolean(conflict);
};