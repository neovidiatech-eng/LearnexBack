import jwt from "jsonwebtoken";
const JITSI_APP_ID = process.env.JITSI_APP_ID;
const JITSI_APP_SECRET = process.env.JITSI_JWT_SECRET;
const JITSI_AUDIENCE = process.env.JITSI_AUDIENCE;
export const generateJitsiToken = ({
  userId,
  roomName,
  userName,
  userEmail,
  isModerator
})=>{
  const payload = {
    context:{
      user:{
        id:userId,
        name:userName,
        email:userEmail,
        moderator:isModerator
      }
    },
    aud:JITSI_AUDIENCE,
    iss:JITSI_APP_ID,
    sub:"meet.jitsi",
    room: roomName,
    exp:Math.floor(Date.now() / 1000) + 60 * 60 * 2,
  };
  return jwt.sign(payload,JITSI_APP_SECRET,{
    algorithm:"HS256"
  })  
}

