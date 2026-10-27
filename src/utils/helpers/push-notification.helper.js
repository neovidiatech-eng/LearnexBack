import * as db from "../../db/db.service.js";
import { reciverNotificationEnum } from "../Enums/notifications.js";
import { sendPushNotification } from "../firebase/index.js";
import { throwError } from "../response.js";
export const sendNotificationPushHelper = async (notification) => {
  let receiver;
  if (notification.receiverType === reciverNotificationEnum.USER) {
    receiver = await db.findOne({
      model: "user",
      where: { id: notification.receiverId },
      select: { fcmToken: true },
    });
  } else if (notification.receiverType === reciverNotificationEnum.ADMIN) {
    receiver = await db.findOne({
      model: "admin",
      where: { id: notification.receiverId },
      select: { fcmToken: true },
    });
  } else {
    return { sent: false, reason: "UNSUPPORTED_RECEIVER_TYPE" };
  }
  if (!receiver) {
    throwError({ status: 404, message: "NOTIFICATION_RECEIVER_NOT_FOUND" });
  }
  if (!receiver.fcmToken) {
    return { sent: false, reason: "FCM_TOKEN_NOT_FOUND" };
  }

  const translation =
    notification.notificationTranslations?.find(
      (item) => item.locale === "ar",
    ) || notification.notificationTranslations?.[0];

  if (!translation?.title || !translation?.message) {
    throwError({ message: "NOTIFICATION_TRANSLATION_NOT_FOUND", status: 404 });
  }
  const result = await sendPushNotification({
    fcmToken: receiver.fcmToken,
    title: translation.title,
    body: translation.message,
    data: {
      notificationId: notification.id,
      type: notification.type,
      link: notification.link || "",
    },
  });
  return { result, sent: Boolean(result) };
};
