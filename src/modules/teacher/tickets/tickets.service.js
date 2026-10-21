import * as db from "../../../db/db.service.js";
import { SupportTicketStatus } from "../../../utils/Enums/tickets.enum.js";
import { throwError } from "../../../utils/response.js";

export const getAllTicketsService = async ({ user, query }) => {
  const { page, limit, sort, status, priority } = query;


  const where = { userId: user };

  if (status) where.status = status;
  if (priority) where.priority = priority;

  const { items, pagination } = await db.findManyWithPaginationAndCount({
    model: "supportTicket",
    where,
    page,
    limit,
    orderBy: {
      createdAt: sort || "desc",
    },
  });

  return { data: items, pagination };
};

export const getTicketByIdService = async ({ user, ticketId }) => {


  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
      userId: user,
    },
    include: {
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
      staff: {
        select: {
          id: true,
          fullName: true,
          profilePhoto: true,
          email: true,
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

export const createTicketService = async ({ user, body, file }) => {
  const { subject, message, priority } = body;


  const openTicketsCount = await db.count({
    model: "supportTicket",
    where: {
      userId: user,
      status: {
        in:[
          SupportTicketStatus.OPEN,
          SupportTicketStatus.IN_PROGRESS,
        ]
      }
    },
  });

  if (openTicketsCount >= 2) {
    throwError({
      message: "TEACHER_OPEN_TICKET",
      status: 400,
    });
  }

  const ticket = await db.create({
    model: "supportTicket",
    data: {
      subject,
      priority,
      status: SupportTicketStatus.OPEN,
      userId: user,
      lastMessageAt: new Date(),
      supportMessages: {
        create: {
          senderId: user,
          body: message,
          ...(file
            ? {
                attachments: {
                  create: {
                    fileName: file.originalname,
                    storageKey: file.path,
                    mimeType: file.mimetype,
                    size: file.size,
                  },
                },
              }
            : {}),
        },
      },
    },
  });

  return ticket;
};

export const sendMessage = async ({ user, body, file, ticketId }) => {
  const { message } = body;

  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
      userId: user,
    },
  });

  if (!ticket) {
    throwError({
      message: "TICKET_NOT_FOUND",
      status: 404,
    });
  }

  if (
    ticket.status === SupportTicketStatus.CLOSED ||
    ticket.status === SupportTicketStatus.RESOLVED
  ) {
    throwError({
      message: "TICKET_NOT_FOUND",
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
        supportMessages: {
          create: {
            senderId: user,
            body: message,
            ...(file
              ? {
                  attachments: {
                    create: {
                      fileName: file.originalname,
                      storageKey: file.path,
                      mimeType: file.mimetype,
                      size: file.size,
                    },
                  },
                }
              : {}),
          },
        },
      },
    });
  });

  return result;
};

export const reopenTicket = async ({ user, body, file, ticketId }) => {
  const { message } = body;


  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
      userId: user,
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
      message: "TICKET_NOT_FOUND",
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
        closedAt: null,
        resolvedAt: null,
        supportMessages: {
          create: {
            senderId: user,
            body: message,
            ...(file
              ? {
                  attachments: {
                    create: {
                      fileName: file.originalname,
                      storageKey: file.path,
                      mimeType: file.mimetype,
                      size: file.size,
                    },
                  },
                }
              : {}),
          },
        },
      },
    });
  });

  return result;
};
export const getMessagesService = async ({ user,id,createdAt,limit, ticketId }) => {

  const ticket = await db.findFirst({
    model: "supportTicket",
    where: {
      id: ticketId,
      userId: user,
    },
  });

  if (!ticket) {
    throwError({
      message: "TICKET_NOT_FOUND",
      status: 404,
    });
  }

  console.log(ticket.status);
  
  if (
    ticket.status === SupportTicketStatus.CLOSED ||
    ticket.status === SupportTicketStatus.RESOLVED
  ) {
    throwError({
      message: "INVALID_TICKET_STATUS",
      status: 400,
    });
  }

  const result = await db.paginationWithCursor({
    model: "supportMessage",
    where: {
      ticketId,
    },
    cursor: {id,createdAt} || null,
    limit,
    cursorField: "id",
    timestampField: "createdAt",
    orderBy: [
      { createdAt: "asc" },
      { id: "asc" },
    ],
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
