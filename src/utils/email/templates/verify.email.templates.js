export const verifyEmailTemplates = ({
  otp,
  title = "Confirm your email",
} = {}) => {
  // otp is split into individual digits so each renders in its own
  // "answer sheet" cell — a nod to Learnex being a learning platform,
  // instead of a generic colored pill.
  const digits = String(otp).split("");
  const digitCells = digits
    .map(
      (d) => `
        <td style="width:44px;height:52px;border:1.5px solid #1B4F8C;border-radius:6px;background-color:#FFFFFF;text-align:center;vertical-align:middle;font-family:Georgia, 'Times New Roman', serif;font-size:24px;color:#0F2138;">
          ${d}
        </td>
        <td style="width:8px;">&nbsp;</td>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#EDF3FA;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#EDF3FA;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" border="0" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#FFFFFF;border:1px solid #D7E4F2;border-radius:10px;overflow:hidden;">

          <!-- accent bar -->
          <tr>
            <td style="height:4px;background-color:#1B4F8C;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- header -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="font-family:Georgia, 'Times New Roman', serif;font-size:22px;font-style:italic;color:#0F2138;">
                    Learnex
                  </td>
                  <td align="right" style="font-family:Helvetica, Arial, sans-serif;font-size:12px;">
                    <a href="${process.env.appUrl || "#"}" style="color:#2E7BC4;text-decoration:none;">View in browser</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- divider -->
          <tr>
            <td style="padding:20px 40px 0 40px;">
              <div style="border-top:1px solid #D7E4F2;"></div>
            </td>
          </tr>

          <!-- headline -->
          <tr>
            <td style="padding:32px 40px 0 40px;font-family:Georgia, 'Times New Roman', serif;font-size:26px;color:#0F2138;">
              ${title}
            </td>
          </tr>

          <!-- body copy -->
          <tr>
            <td style="padding:14px 40px 0 40px;font-family:Helvetica, Arial, sans-serif;font-size:15px;line-height:1.6;color:#435268;">
              Enter the code below to finish signing in to your Learnex account. Treat it like a password — anyone with this code can access your account.
            </td>
          </tr>

          <!-- otp digits -->
          <tr>
            <td style="padding:28px 40px 4px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  ${digitCells}
                </tr>
              </table>
            </td>
          </tr>

          <!-- expiry note -->
          <tr>
            <td style="padding:16px 40px 0 40px;font-family:Helvetica, Arial, sans-serif;font-size:13px;color:#7C8AA0;">
              This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.
            </td>
          </tr>

          <!-- spacer -->
          <tr>
            <td style="padding-top:32px;">
              <div style="border-top:1px solid #D7E4F2;margin:0 40px;"></div>
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="padding:20px 40px 28px 40px;font-family:Helvetica, Arial, sans-serif;font-size:12px;line-height:1.6;color:#7C8AA0;">
              Learnex &middot; This is an automated message, please don't reply directly to this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
