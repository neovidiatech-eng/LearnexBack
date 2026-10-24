import * as db from "../../../db/db.service.js";
import { baseRoleEnum } from "../../../utils/Enums/role.enum.js";
import {
  SupportTicketStatus,
  SupportTicketPriority,
} from "../../../utils/Enums/tickets.enum.js";
import { throwError } from "../../../utils/response.js";

export const getAllTicketsService = async ({ user, query = {} }) => {
  const { page, limit, sort, status, priority, assignedStaffId, search } =
    query;

  const where = {};

  if (status) where.status = status;
  if (priority) where.priority = priority;

  if (assignedStaffId !== undefined) {
    if (assignedStaffId === null || assignedStaffId === "null") {
      where.assignedStaffId = null;
    } else {
      where.assignedStaffId = assignedStaffId;
    }
  }

  if (search && search.trim()) {
    const trimmed = search.trim();
    const parsedTicketNumber = Number(trimmed);
    const orConditions = [
      { subject: { contains: trimmed, mode: "insensitive" } },
      { user: { fullName: { contains: trimmed, mode: "insensitive" } } },
      { user: { email: { contains: trimmed, mode: "insensitive" } } },
    ];

    if (!isNaN(parsedTicketNumber) && Number.isInteger(parsedTicketNumber)) {
      orConditions.unshift({ ticketNumber: parsedTicketNumber });
    }

    where.OR = orConditions;
  }

  const { items, pagination } = await db.findManyWithPaginationAndCount({
    model: "supportTicket",
    where,
    page,
    limit,
    orderBy: {
      createdAt: sort || "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
      staff: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  return { data: items, pagination };
};

export const getTicketByIdService = async ({ ticketId }) => {
  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profilePhoto: true,
          role: {
            select: {
              slug: true,
              roleTranslations: {
                select: {
                  name: true,
                  lang: true,
                },
              },
            },
          },
        },
      },
      staff: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profilePhoto: true,
        },
      },
      supportMessages: {
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              email: true,
            },
          },
          attachments: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!ticket) {
    throwError({
      message: "TICKET_NOT_FOUND",
      status: 404,
    });
  }

  return ticket;
};

export const sendMessage = async ({ user, body, file, ticketId }) => {
  const { message } = body;

  const isAdmin =
    user?.role?.name === baseRoleEnum.ADMIN ||
    user?.role?.name === baseRoleEnum.SUPER_ADMIN;

    console.log(!isAdmin);
    

  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
  });

  console.log(!isAdmin && ticket.assignedStaffId !== user.id);
  

  if (!isAdmin && ticket.assignedStaffId !== user.id) {
    throwError({
      message: "UNAUTHORIZED",
      status: 401,
    });
  }

  if (!ticket) {
    throwError({
      message: "TICKET_NOT_FOUND",
      status: 404,
    });
  }

  if (ticket.status === SupportTicketStatus.CLOSED) {
    throwError({
      message: "TICKET_IS_CLOSED",
      status: 400,
    });
  }

  const result = await db.transaction(async (tx) => {
    return await tx.updateOne({
      model: "supportTicket",
      where: {
        id: ticketId,
      },
      data: {
        lastMessageAt: new Date(),
        status: SupportTicketStatus.IN_PROGRESS,
        ...(!isAdmin &&
          !ticket.assignedStaffId && {
            assignedStaffId: user.id,
          }),
        supportMessages: {
          create: {
            adminSenderId: user.id,
            body: message,
            ...(file
              ? {
                  attachments: {
                    create: {
                      fileName: file.originalname,
                      storageKey: file.relativeDestination || file.path,
                      mimeType: file.mimetype,
                      size: file.size,
                    },
                  },
                }
              : {}),
          },
        },
      },
      include: {
        supportMessages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            attachments: true,
            admin: {
              select: {
                id: true,
                fullName: true,
                email:true
              },
            },
          },
        },
      },
    });
  });

  return result;
};

export const closeTicketService = async ({ ticketId }) => {
  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throwError({
      message: "TICKET_NOT_FOUND",
      status: 404,
    });
  }

  if (ticket.status === SupportTicketStatus.CLOSED) {
    throwError({
      message: "TICKET_ALREADY_CLOSED",
      status: 400,
    });
  }

  const result = await db.updateOne({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
    data: {
      status: SupportTicketStatus.CLOSED,
      closedAt: new Date(),
      resolvedAt: ticket.resolvedAt || new Date(),
    },
  });

  return result;
};

export const reopenTicketService = async ({ user, body = {}, ticketId }) => {
  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throwError({
      message: "TICKET_NOT_FOUND",
      status: 404,
    });
  }

  if (
    ticket.status !== SupportTicketStatus.CLOSED &&
    ticket.status !== SupportTicketStatus.RESOLVED
  ) {
    throwError({
      message: "TICKET_IS_NOT_CLOSED",
      status: 400,
    });
  }

  const updateData = {
    status: SupportTicketStatus.IN_PROGRESS,
    closedAt: null,
    resolvedAt: null,
  };

  if (body?.message) {
    updateData.lastMessageAt = new Date();
    updateData.supportMessages = {
      create: {
        senderId: user,
        body: body.message,
      },
    };
  }

  const result = await db.updateOne({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
    data: updateData,
  });

  return result;
};

export const changeStatusService = async ({ status, ticketId }) => {
  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throwError({
      message: "TICKET_NOT_FOUND",
      status: 404,
    });
  }

  if (ticket.status === status) {
    throwError({
      message: "TICKET_ALREADY_IN_THIS_STATUS",
      status: 400,
    });
  }

  if(status === SupportTicketStatus.CLOSED){
    throwError({
      message: "CANT_CLOSE_TICKET",
      status: 400,
    });
  }

  const isResolving = status === SupportTicketStatus.RESOLVED;
  const result = await db.updateOne({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
    data: {
      status,
      resolvedAt: isResolving
        ? new Date()
        : isReopening
          ? null
          : ticket.resolvedAt,
    },
  });

  return result;
};

export const assignTicketService = async ({ staffId, ticketId }) => {
  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throwError({
      message: "TICKET_NOT_FOUND",
      status: 404,
    });
  }

  if (staffId) {
    const staffUser = await db.findFirst({
      model: "user",
      where: {
        id: staffId,
      },
    });

    if (!staffUser) {
      throwError({
        message: "STAFF_NOT_FOUND",
        status: 404,
      });
    }
  }

  const result = await db.updateOne({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
    data: {
      assignedStaffId: staffId || null,
    },
    include: {
      staff: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  return result;
};

export const getMessagesService = async ({
  id,
  createdAt,
  limit,
  ticketId,
}) => {
  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throwError({
      message: "TICKET_NOT_FOUND",
      status: 404,
    });
  }

  const result = await db.paginationWithCursor({
    model: "supportMessage",
    where: {
      ticketId,
    },
    cursor: id && createdAt ? { id, createdAt } : null,
    limit,
    cursorField: "id",
    timestampField: "createdAt",
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          profilePhoto: true,
        },
      },
      attachments: true,
    },
  });

  return result;
};
