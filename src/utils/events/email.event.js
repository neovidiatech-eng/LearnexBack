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

emailEvent.on("certificateUploaded", async (data) => {
  await sendEmail({
    to: data.to,
    subject: "تم استلام شهادتك بنجاح - قيد المراجعة | LearnX",
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #2c3e50;">مرحباً ${data.name || "معلمنا العزيز"}،</h2>
        <p>تم استلام شهادتك بعنوان <b>"${data.certificateTitle}"</b> الصادرة من <b>${data.issuer || "الجهة المانحة"}</b> بنجاح.</p>
        
        <div style="background-color: #f8f9fa; border-right: 4px solid #3498db; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #555;">حالة الشهادة الحالية: <b style="color: #e67e22;">قيد المراجعة (Pending)</b></p>
          <p style="margin: 5px 0 0 0; color: #777; font-size: 13px;">يقوم فريق الإدارة حالياً بمراجعة وتوثيق الشهادة وسنوافيك بالرد فور الانتهاء.</p>
        </div>

        <p style="color: #777; font-size: 14px;">شكراً لجهودك المستمرة في تطوير ملفك المهني على منصة LearnX.</p>
        <br>
        <p style="color: #777; font-size: 14px;">مع تحياتنا،<br><b>فريق عمل LearnX</b></p>
      </div>
    `,
  }).catch((error) => {
    console.log(`Failed to send certificateUploaded email to ${data.to}:`, error);
  });
});

emailEvent.on("certificateApproved", async (data) => {
  await sendEmail({
    to: data.to,
    subject: "تهانينا! تم اعتماد وتوثيق شهادتك في LearnX 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #27ae60;">مرحباً ${data.name || "معلمنا العزيز"}! 🎉</h2>
        <p>يسعدنا إبلاغك بأنه تمت مراجعة واعتماد شهادتك بعنوان <b>"${data.certificateTitle}"</b> بنجاح.</p>
        
        <div style="background-color: #f4faf6; border-right: 4px solid #2ecc71; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #27ae60; font-weight: bold;">الحالة: موثقة ومعتمدة (Verified) ✅</p>
          <p style="margin: 5px 0 0 0; color: #555; font-size: 13px;">أصبحت الشهادة الآن ظاهرة في ملفك الشخصي كمعلم معتمد في منصة LearnX.</p>
        </div>

        <p>يمكنك تسجيل الدخول لعرض ملفك الشخصي ومتابعة نشاطك.</p>
        <br>
        <p style="color: #777; font-size: 14px;">مع تمنياتنا لك بمزيد من النجاح والتألق،<br><b>فريق عمل LearnX</b></p>
      </div>
    `,
  }).catch((error) => {
    console.log(`Failed to send certificateApproved email to ${data.to}:`, error);
  });
});

emailEvent.on("certificateRejected", async (data) => {
  await sendEmail({
    to: data.to,
    subject: "تحديث بخصوص الشهادة المرفوعة في LearnX",
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #c0392b;">مرحباً ${data.name || "معلمنا العزيز"}،</h2>
        <p>نود إبلاغك بأنه بعد مراجعة الشهادة المرفوعة بعنوان <b>"${data.certificateTitle}"</b>، تعذر علينا اعتمادها في الوقت الحالي.</p>
        
        <div style="background-color: #fdf2f2; border-right: 4px solid #e74c3c; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #c0392b;">سبب الرفض:</h4>
          <p style="margin: 0; color: #555;">${data.reason || "الملف المرفق غير واضح أو البيانات لا تطابق الشهادة."}</p>
        </div>

        <p>يمكنك إعادة رفع الشهادة بملف أوضح وبيانات دقيقة من خلال لوحة تحكم المعلم.</p>
        <br>
        <p style="color: #777; font-size: 14px;">مع تحياتنا،<br><b>فريق عمل LearnX</b></p>
      </div>
    `,
  }).catch((error) => {
    console.log(`Failed to send certificateRejected email to ${data.to}:`, error);
  });
});


