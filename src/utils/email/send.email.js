import nodemailer from "nodemailer";
export async function sendEmail({
  from = process.env.APP_EMAIL,
  to = "",
  cc = "",
  bcc = "",
  text = "",
  html = "",
  subject = "LearnX APP",
  attachments = [],
} = {}) {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"LearnX APP 😉" <${from}>`, // sender address
      to,
      cc,
      bcc,
      text,
      html,
      subject,
      attachments,
    });
    // console.log(info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}
