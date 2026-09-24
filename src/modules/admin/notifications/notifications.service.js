import dbService from "../../../db/db.service.js";
import { reciverNotificationEnum } from "../../../utils/Enums/notifications.js";
import { baseRoleEnum } from "../../../utils/Enums/role.enum.js";

export const getAllNotifications = async (req) => {
  const userId = req.user?.id;
  const userRole = (
    req.user?.role?.roleTranslations?.find((t) => t.locale === req.locale)
      ?.name ||
    req.decoded?.role ||
    ""
  ).toLowerCase();

  const isAdmin =
    userRole === baseRoleEnum.ADMIN || userRole === baseRoleEnum.SUPER_ADMIN;

  const { page = 1, limit = 10, isRead, type } = req.query;

  const locale =
    req.locale || req.headers?.["accept-language"]?.slice(0, 2) || "en";

  // Build target receiver conditions
  const receiverConditions = [
    { receiverId: userId },
    {
      receiverType: isAdmin
        ? reciverNotificationEnum.ADMIN
        : reciverNotificationEnum.USER,
    },
    { receiverType: reciverNotificationEnum.SYSTEM },
  ];

  const where = {
    OR: receiverConditions,
    ...(isRead !== undefined
      ? { isRead: isRead === "true" || isRead === true }
      : {}),
    ...(type ? { type } : {}),
  };

  const [notifications, unreadCount] = await Promise.all([
    dbService.findManyWithPaginationAndCount({
      model: "notification",
      where,
      page,
      limit,
      orderBy: { createdAt: "desc" },
      include: {
        notificationTranslations: {
          where: { locale },
        },
      },
    }),
    dbService.count({
      model: "notification",
      where: {
        OR: receiverConditions,
        isRead: false,
      },
    }),
  ]);

  // Format notifications to surface current locale translation at top-level
  const formattedNotifications = notifications?.items?.map((item) => {
    const translation = item.notificationTranslations?.[0] || {};
    return {
      id: item.id,
      receiverId: item.receiverId,
      receiverType: item.receiverType,
      type: item.type,
      priority: item.priority,
      isRead: item.isRead,
      readAt: item.readAt,
      title: translation.title || null,
      message: translation.message || null,
      translations: item.notificationTranslations,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  return {
    notifications: formattedNotifications,
    unreadCount,
    pagination: notifications?.pagination,
  };
};

export const markAsRead = async (req) => {
  const { id } = req.params;

  const notification = await dbService.findOne({
    model: "notification",
    where: { id },
  });

  if (!notification) {
    const error = new Error("NOTIFICATION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const updatedNotification = await dbService.updateOne({
    model: "notification",
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
    include: {
      notificationTranslations: true,
    },
  });

  return updatedNotification;
};

export const markAllAsRead = async (req) => {
  const userId = req.user?.id;
  const userRole = (
    req.user?.role?.name ||
    req.decoded?.role ||
    ""
  ).toLowerCase();
  console.log(userRole);
  const isAdmin =
    userRole === baseRoleEnum.ADMIN || userRole === baseRoleEnum.SUPER_ADMIN;

  const receiverConditions = [
    { receiverId: userId },
    {
      receiverType: isAdmin
        ? reciverNotificationEnum.ADMIN
        : reciverNotificationEnum.USER,
    },
    { receiverType: reciverNotificationEnum.SYSTEM },
  ];

  const result = await dbService.updateMany({
    model: "notification",
    where: {
      OR: receiverConditions,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return {
    message: "ALL_NOTIFICATIONS_MARKED_AS_READ",
    updatedCount: result.count,
  };
};

export const deleteNotification = async (req) => {
  const { id } = req.params;

  const notification = await dbService.findOne({
    model: "notification",
    where: { id },
  });

  if (!notification) {
    const error = new Error("NOTIFICATION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await dbService.deleteOne({
    model: "notification",
    where: { id },
  });

  return { id, message: "NOTIFICATION_DELETED_SUCCESSFULLY" };
};

export const createNotification = async (req) => {
  const {
    receiverId = "GLOBAL",
    receiverType = reciverNotificationEnum.SYSTEM,
    type = "INFO",
    priority = "LOW",
    link,
    translations,
  } = req.body;

  const notification = await dbService.create({
    model: "notification",
    data: {
      receiverId,
      receiverType,
      type,
      priority,
      link: link || null,
      isRead: false,
      notificationTranslations: {
        create: translations.map((translation) => ({
          locale: translation.locale,
          title: translation.title,
          message: translation.message,
        })),
      },
    },
    include: {
      notificationTranslations: true,
    },
  });

  return notification;
};
