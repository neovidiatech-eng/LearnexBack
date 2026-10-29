import jwt from "jsonwebtoken";

export const generateJitsiToken = ({
  userId,
  roomName,
  userName,
  isModerator,
  ttlSeconds = 2 * 60 * 60,
}) => {
  const appId = process.env.JITSI_APP_ID || "learnx_default_app";
  const jwtSecret =
    process.env.JITSI_JWT_SECRET ||
    process.env.ACCESS_TOKEN_SIGNATURE ||
    "learnx_jitsi_fallback_secret_2026";
  const audience = process.env.JITSI_AUDIENCE || "learnx_jitsi_audience";
  const sub = process.env.JITSI_SUB || "*";

  if (!userId || !roomName || !userName) {
    throw new Error("JITSI_INVALID_TOKEN_PAYLOAD");
  }

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    aud: audience,
    iss: appId,
    sub: sub,
    room: roomName,
    nbf: now - 10,
    exp: now + ttlSeconds,

    context: {
      user: {
        id: String(userId),
        name: userName,
        moderator: Boolean(isModerator),
        affiliation: isModerator ? "owner" : "member",
      },
    },
  };

  return jwt.sign(payload, jwtSecret, {
    algorithm: "HS256",
  });
};
