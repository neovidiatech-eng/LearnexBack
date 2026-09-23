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


emailEvent.on("teacherApproved", async (data) => {
  await sendEmail({
    to: data.to,
    subject: "تهانينا! تمت الموافقة على حسابك كمعلم في LearnX",
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px;">
        <h2>مرحباً بك يا ${data.name || "معلمنا العزيز"} في LearnX!</h2>
        <p>يسعدنا إبلاغك بأن إدارة المنصة قد راجعت طلبك وتمت <b>الموافقة على تفعيل حسابك كمعلم معتمد</b> بنجاح.</p>
        <p>يمكنك الآن تسجيل الدخول إلى لوحة تحكم المعلم والبدء في تقديم الدروس واستقبال الطلاب.</p>
      </div>
    `,
  }).catch((error) => {
    console.log(`Failed to send approval email to ${data.to}:`, error);
  });
});

emailEvent.on("teacherRejected", async (data) => {
  await sendEmail({
    to: data.to,
    subject: "تحديث بخصوص طلب انضمامك كمعلم في LearnX",
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #c0392b;">مرحباً بك يا ${data.name || "معلمنا العزيز"}،</h2>
        <p>نشكرك على اهتمامك ورغبتك في الانضمام إلى منصة <b>LearnX</b> كمعلم.</p>
        <p>نود إبلاغك بأنه بعد مراجعة بيانات طلبك والسيرة الذاتية المقدمة من قِبل إدارة المنصة، <b>لم نتمكن من قبول الطلب في الوقت الحالي</b>.</p>
        
        <div style="background-color: #f9f2f2; border-right: 4px solid #e74c3c; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #c0392b;">سبب الرفض:</h4>
          <p style="margin: 0; color: #555;">${data.reason || "عدم استيفاء بعض الشروط والمتطلبات الأساسية."}</p>
        </div>

        <p>يمكنك مراجعة وتحديث بياناتك وشهاداتك والتقديم مرة أخرى في المستقبل، أو التواصل مع فريق الدعم في حال كان لديك أي استفسار.</p>
        <br>
        <p style="color: #777; font-size: 14px;">مع تمنياتنا لك بالتوفيق والنجاح دائماً،<br><b>فريق عمل LearnX</b></p>
      </div>
    `,
  }).catch((error) => {
    console.log(`Failed to send rejection email to ${data.to}:`, error);
  });
});

