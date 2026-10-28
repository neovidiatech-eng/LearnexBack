import * as db from "../../db/db.service.js";
import { reciverNotificationEnum } from "../Enums/notifications.js";
import { sendPushNotification } from "../firebase/index.js";
import { throwError } from "../response.js";

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
const getReceiverTokens = async ({ receiverType, receiverId }) => {
  switch (receiverType) {
    case reciverNotificationEnum.USER: {
      const user = await db.findOne({
        model: "user",
        where: { id: receiverId },
        select: { fcmToken: true },
      });
      if (!user) {
        throwError({ status: 404, message: "NOTIFICATION_RECEIVER_NOT_FOUND" });
      }
      return user.fcmToken ? [user.fcmToken] : [];
    }
    case reciverNotificationEnum.ADMIN: {
      const admins = await db.findMany({
        model: "admin",
        select: { fcmToken: true },
      });
      return admins.map((admin) => admin.fcmToken).filter(Boolean);
    }
    case reciverNotificationEnum.ALL_STUDENTS: {
      const users = await db.findMany({
        model: "user",
        where: { fcmToken: { not: null }, student: { isNot: null } },
        select: { fcmToken: true },
      });
      return users.map((user) => user.fcmToken);
    }
    case reciverNotificationEnum.ALL_TEACHERS: {
      const users = await db.findMany({
        model: "user",
        where: { fcmToken: { not: null }, teacher: { isNot: null } },
        select: { fcmToken: true },
      });
      return users.map((user) => user.fcmToken);
    }
    case reciverNotificationEnum.SYSTEM: {
      const users = await db.findMany({
        model: "user",
        where: { fcmToken: { not: null } },
        select: { fcmToken: true },
      });
      return users.map((user) => user.fcmToken);
    }
    default:
      return [];
  }
};

export const sendNotificationPushHelper = async (notification) => {
  const tokens = [...new Set(await getReceiverTokens(notification))];
if (!tokens.length) {
  throwError({ message: "FCM_TOKEN_NOT_FOUND", status: 404 });
}
  const translation =
    notification.notificationTranslations?.find(
      (item) => item.locale === "ar",
    ) || notification.notificationTranslations?.[0];

  if (!translation?.title || !translation?.message) {
    throwError({ message: "NOTIFICATION_TRANSLATION_NOT_FOUND", status: 404 });
  }
  const payload = {
    title: translation.title,
    body: translation.message,
    data: {
      notificationId: notification.id,
      type: notification.type,
      link: notification.link || "",
    },
  };
//one user
if (tokens.length===1) {
  const result = await sendPushNotification({
    fcmToken: tokens[0],
    ...payload,
  });
  return { sent: Boolean(result), total: 1 };
  }
  //multi users
 let successCount = 0;
 for (const batch of chunk(tokens, 500)) {
   const result = await sendPushNotification({ fcmTokens: batch, ...payload });
   successCount += result?.successCount || 0;
 }

 return { sent: successCount > 0, successCount, total: tokens.length };
};
