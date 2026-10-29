import i18next from "../../i18n/index.js";
import * as db from "../../db/db.service.js";
import { sendNotificationPushHelper } from "./push-notification.helper.js";
import { SUPPORTED_LANGUAGES } from "../../i18n/config.js";
export const notify = async ({
  receiverId = "GLOBAL",
  receiverType,
  type = "INFO",
  priority = "LOW",
  link = null,
}) => {
  try {
     const translations = SUPPORTED_LANGUAGES.map((lng) => ({
       locale: lng,
       title: i18next.t(`NOTIFICATION_${type}_TITLE`, { lng }),
       message: i18next.t(`NOTIFICATION_${type}_MESSAGE`, { lng }),
     }));

     const notification = await db.create({
       model: "notification",
       data: {
         receiverId,
         receiverType,
         type,
         priority,
         link,
         isRead: false,
         notificationTranslations: { create: translations },
       },
       include: { notificationTranslations: true },
     });

     try {
       await sendNotificationPushHelper(notification);
     } catch (e) {
       console.error("Push failed:", e.message);
     }

     return notification;
  } catch (e) {
    console.error("Notify failed:", e.message);
    return null;
  }
 
};
