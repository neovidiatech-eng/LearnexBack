
import jwt from "jsonwebtoken";

export const generateJitsiToken = ({
  userId,
  roomName,
  userName,
  isModerator,
  ttlSeconds = 2 * 60 * 60,
}) => {
  const {
    JITSI_APP_ID,
    JITSI_JWT_SECRET,
    JITSI_AUDIENCE,
  } = process.env;

  if (!JITSI_APP_ID || !JITSI_JWT_SECRET || !JITSI_AUDIENCE) {
    throw new Error("JITSI_NOT_CONFIGURED");
  }

  if (!userId || !roomName || !userName) {
    throw new Error("JITSI_INVALID_TOKEN_PAYLOAD");
  }

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    aud: JITSI_AUDIENCE,
    iss: JITSI_APP_ID,
    sub: "meet.jitsi",
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

  return jwt.sign(payload, JITSI_JWT_SECRET, {
    algorithm: "HS256",
  });
};
