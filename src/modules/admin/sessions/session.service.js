import dbService from "../../../db/db.service.js";
import { sessionStatus } from "../../../utils/Enums/sessions.enum.js";
import { throwError } from "../../../utils/response.js";

export const getSessionsService = async ({
  tab = "today",
  search,
  page = 1,
  limit = 20,
}) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  let where = {};
  let orderBy = { startAt: "asc" };

  if (tab === "today") {
    where = {
      startAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    };
    orderBy = { startAt: "asc" };
  } else if (tab === "upcoming") {
    where = {
      startAt: {
        gt: endOfToday,
      },
      status: {
        notIn: [sessionStatus.CANCELLED, sessionStatus.COMPLETED],
      },
    };
    orderBy = { startAt: "asc" };
  } else if (tab === "history") {
    where = {
      OR: [
        { startAt: { lt: startOfToday } },
        { status: { in: [sessionStatus.COMPLETED, sessionStatus.CANCELLED, sessionStatus.MISSED] } },
      ],
    };
    orderBy = { startAt: "desc" };
  }

  if (search && search.trim()) {
    const term = search.trim();
    const searchFilter = {
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { teacher: { user: { fullName: { contains: term, mode: "insensitive" } } } },
        { student: { user: { fullName: { contains: term, mode: "insensitive" } } } },
      ],
    };
    where = { AND: [where, searchFilter] };
  }

  const result = await dbService.findManyWithPaginationAndCount({
    model: "session",
    where,
    page,
    limit,
    orderBy,
    include: {
      teacher: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      },
      student: {
        select: {
          id: true,
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

  const formattedItems = result.items.map((session) => ({
    id: session.id,
    title: session.title,
    status: session.status,
    startAt: session.startAt,
    endAt: session.endAt,
    createdAt: session.createdAt,
    teacher: {
      id: session.teacher?.id,
      fullName: session.teacher?.user?.fullName || null,
      profilePhoto: session.teacher?.user?.profilePhoto || null,
    },
    student: {
      id: session.student?.id,
      fullName: session.student?.user?.fullName || null,
      profilePhoto: session.student?.user?.profilePhoto || null,
    },
  }));

  return {
    sessions: formattedItems,
    pagination: result.pagination,
  };
};

export const getSessionByIdService = async (sessionId) => {
  const session = await dbService.findOne({
    model: "session",
    where: { id: sessionId },
    include: {
      teacher: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    throwError({ message: "SESSION_NOT_FOUND", status: 404 });
  }

  return {
    id: session.id,
    title: session.title,
    status: session.status,
    startAt: session.startAt,
    endAt: session.endAt,
    actualStartAt: session.actualStartAt,
    actualEndAt: session.actualEndAt,
    createdAt: session.createdAt,
    teacher: {
      id: session.teacher?.id,
      fullName: session.teacher?.user?.fullName || null,
      profilePhoto: session.teacher?.user?.profilePhoto || null,
      email: session.teacher?.user?.email || null,
      phone: session.teacher?.user?.phone || null,
    },
    student: {
      id: session.student?.id,
      fullName: session.student?.user?.fullName || null,
      profilePhoto: session.student?.user?.profilePhoto || null,
      email: session.student?.user?.email || null,
      phone: session.student?.user?.phone || null,
    },
  };
};
