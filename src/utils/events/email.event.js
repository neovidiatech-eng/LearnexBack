import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email.js";
import { verifyEmailTemplates } from "../email/templates/verify.email.templates.js";
export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Confirm-Email",
    html: verifyEmailTemplates({otp:data.otp}),
  }).catch((error) => {
    console.log(`fail to send email to ${data.to}`);
  });
});


emailEvent.on("sendForgotPassword", async (data) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Forgot-Email",
    html: verifyEmailTemplates({ otp: data.otp,title:data.title }),
  }).catch((error) => {
    console.log(`fail to send email to ${data.to}`);
  });
});


