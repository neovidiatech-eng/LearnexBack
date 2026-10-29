import dbService from "../../db/db.service.js";
import { throwError } from "../../utils/response.js";

const otherUserSelect = {
  id: true,
  user: { select: { id: true, fullName: true, profilePhoto: true } },
};

export const getConversations = async ({
  user,
  search,
  page = 1,
  limit = 20,
}) => {
  const studentId = user.student?.id;
  const teacherId = user.teacher?.id;

  if (!studentId && !teacherId) {
    throwError({ message: "UNAUTHORIZED", status: 403 });
  }

  const isStudent = Boolean(studentId);

  let where = isStudent ? { studentId } : { teacherId };

  if (search && search.trim()) {
    const term = search.trim();
    const otherSide = isStudent ? "teacher" : "student";
    where = {
      AND: [
        where,
        { [otherSide]: { user: { fullName: { contains: term, mode: "insensitive" } } } },
      ],
    };
  }

  const result = await dbService.findManyWithPaginationAndCount({
    model: "conversation",
    where,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
    include: isStudent
      ? { teacher: { select: otherUserSelect } }
      : { student: { select: otherUserSelect } },
  });

  const conversations = result.items.map((conversation) => {
    const other = isStudent ? conversation.teacher : conversation.student;

    return {
      id: conversation.id,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: isStudent
        ? conversation.unreadStudentCount
        : conversation.unreadTeacherCount,
      participant: {
        id: other?.id,
        userId: other?.user?.id,
        fullName: other?.user?.fullName || null,
        profilePhoto: other?.user?.profilePhoto || null,
      },
    };
  });

  return {
    conversations,
    pagination: result.pagination,
  };
};

export const getMessagesService = async ({
  user,
  conversationId,
  cursor,
  limit = 30,
}) => {
  const studentId = user.student?.id;
  const teacherId = user.teacher?.id;

  if (!studentId && !teacherId) {
    throwError({ message: "UNAUTHORIZED", status: 403 });
  }

  const conversation = await dbService.findFirst({
    model: "conversation",
    where: {
      id: conversationId,
      ...(studentId ? { studentId } : { teacherId }),
    },
    select: { id: true },
  });

  if (!conversation) {
    throwError({ message: "CONVERSATION_NOT_FOUND", status: 404 });
  }

  const parsedLimit = Number(limit) || 30;

  const rows = await dbService.findMany({
    model: "message",
    where: { conversationId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: parsedLimit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      content: true,
      senderId: true,
      createdAt: true,
      sender: { select: { id: true, fullName: true, profilePhoto: true } },
    },
  });

  const hasMore = rows.length > parsedLimit;
  const messages = hasMore ? rows.slice(0, parsedLimit) : rows;

  return {
    messages: messages.map((m) => ({ ...m, isMine: m.senderId === user.id })),
    nextCursor: hasMore ? messages[messages.length - 1]?.id || null : null,
    hasMore,
  };
};

export const startConversationService = async ({
  user,
  teacherId,
  studentId,
}) => {
  let pair;

  if (studentId) {
    if (!user.teacher?.id) {
      throwError({ message: "TEACHER_NOT_FOUND", status: 403 });
    }
    pair = {
      studentId: studentId,
      teacherId: user.teacher.id,
    };
  } else if (teacherId) {
    if (!user.student?.id) {
      throwError({ message: "STUDENT_NOT_FOUND", status: 403 });
    }
    pair = {
      studentId: user.student.id,
      teacherId: teacherId,
    };
  } else {
    throwError({ message: "INVALID_PARTICIPANT", status: 400 });
  }

  if (!pair.studentId || !pair.teacherId) {
    throwError({ message: "INVALID_PARTICIPANT", status: 400 });
  }

  const select = {
    id: true,
    lastMessage: true,
    lastMessageAt: true,
    unreadStudentCount: true,
    unreadTeacherCount: true,
    teacher: { select: otherUserSelect },
    student: { select: otherUserSelect },
  };

  const findExisting = () =>
    dbService.findFirst({ model: "conversation", where: pair, select });

  let conversation = await findExisting();

  if (!conversation) {
    const subscription = await dbService.findFirst({
      model: "teacherSubscription",
      where: {
        ...pair,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    });

    let hasAccess = !!subscription;

    if (!hasAccess && Boolean(user.student?.id)) {
      const teacherCourseEnrollment = await dbService.findFirst({
        model: "teacherCourseEnrollment",
        where: {
          studentId: user.id,
          status: { in: ["ACTIVE", "COMPLETED"] },
          course: { teacherId: pair.teacherId },
        },
        select: { id: true },
      });

      if (teacherCourseEnrollment) {
        hasAccess = true;
      } else {
        const teacherRec = await dbService.findFirst({
          model: "teacher",
          where: { id: pair.teacherId },
          select: { userId: true },
        });

        if (teacherRec?.userId) {
          const platformEnrollment = await dbService.findFirst({
            model: "courseEnrollment",
            where: {
              studentId: user.id,
              status: { in: ["ACTIVE", "COMPLETED"] },
              course: { instructorId: teacherRec.userId },
            },
            select: { id: true },
          });

          if (platformEnrollment) {
            hasAccess = true;
          }
        }
      }
    }

    if (!hasAccess) {
      throwError({ message: "NO_ACTIVE_SUBSCRIPTION", status: 403 });
    }

    try {
      conversation = await dbService.create({
        model: "conversation",
        data: pair,
        select,
      });
    } catch (error) {
      if (error.code !== "P2002") throw error;
      conversation = await findExisting();
    }
  }

  const other = isStudent ? conversation.teacher : conversation.student;

  return {
    id: conversation.id,
    lastMessage: conversation.lastMessage,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount: isStudent
      ? conversation.unreadStudentCount
      : conversation.unreadTeacherCount,
    participant: {
      id: other?.id,
      userId: other?.user?.id,
      fullName: other?.user?.fullName || null,
      profilePhoto: other?.user?.profilePhoto || null,
    },
  };
};

export const getUnreadCountService = async ({ user }) => {
  const studentId = user.student?.id;
  const teacherId = user.teacher?.id;

  if (!studentId && !teacherId) {
    throwError({ message: "UNAUTHORIZED", status: 403 });
  }

  const isStudent = Boolean(studentId);
  const conversations = await dbService.findMany({
    model: "conversation",
    where: isStudent ? { studentId } : { teacherId },
    select: isStudent
      ? { unreadStudentCount: true }
      : { unreadTeacherCount: true },
  });

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (isStudent ? c.unreadStudentCount : c.unreadTeacherCount),
    0
  );

  return { totalUnread };
};

export const markAsReadService = async ({ user, conversationId }) => {
  const studentId = user.student?.id;
  const teacherId = user.teacher?.id;

  if (!studentId && !teacherId) {
    throwError({ message: "UNAUTHORIZED", status: 403 });
  }

  const isStudent = Boolean(studentId);
  const where = isStudent
    ? { id: conversationId, studentId }
    : { id: conversationId, teacherId };

  const existing = await dbService.findFirst({
    model: "conversation",
    where,
    select: { id: true },
  });

  if (!existing) {
    throwError({ message: "CONVERSATION_NOT_FOUND", status: 404 });
  }

  const readAt = new Date();
  await dbService.updateOne({
    model: "conversation",
    where: { id: existing.id },
    data: isStudent
      ? { studentLastReadAt: readAt, unreadStudentCount: 0 }
      : { teacherLastReadAt: readAt, unreadTeacherCount: 0 },
  });

  return {
    conversationId: existing.id,
    readBy: isStudent ? "student" : "teacher",
    readAt,
  };
};