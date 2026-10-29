/**
 * Fast-fail environment validator on application boot.
 * Diagnoses missing configuration early with actionable guidance.
 */
export const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === "production";

  // Critical variables - app cannot function properly without these
  const required = [
    { key: "DATABASE_URL", description: "PostgreSQL connection string" },
    { key: "ACCESS_TOKEN_SIGNATURE", description: "JWT Access Token Secret" },
    { key: "REFRESH_TOKEN_SIGNATURE", description: "JWT Refresh Token Secret" },
  ];

  const missingRequired = required.filter(({ key }) => !process.env[key]);

  if (missingRequired.length > 0) {
    const list = missingRequired
      .map(({ key, description }) => `  - ${key} (${description})`)
      .join("\n");

    const message = `\n[FATAL CONFIG ERROR] Missing required environment variables:\n${list}\n`;

    if (isProduction) {
      console.error(message);
      process.exit(1);
    } else {
      console.warn(
        `${message}Running in non-production mode with degraded security/functionality.\n`
      );
    }
  }

  // Recommended variables - app functions but some features run with fallbacks
  const recommended = [
    { key: "REDIS_URL", feature: "Distributed caching and rate-limiting" },
    { key: "EMAIL", feature: "SMTP email delivery (OTP, receipts)" },
    { key: "EMAIL_PASSWORD", feature: "SMTP authentication password" },
    { key: "JITSI_APP_ID", feature: "Live video session authentication" },
  ];

  const missingRecommended = recommended.filter(({ key }) => !process.env[key]);

  if (missingRecommended.length > 0) {
    console.info(
      `[CONFIG NOTICE] Optional variables not set (defaults/standby active):\n` +
        missingRecommended
          .map(({ key, feature }) => `  * ${key} -> ${feature}`)
          .join("\n")
    );
  }
};
