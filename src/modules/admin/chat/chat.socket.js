import { decodedToken } from "../../../utils/security/token.security";

export const chatSocketAuthentication = async(socket,next)=>{
    const rawToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if(!rawToken){
        return next(new Error("UNAUTHORIZED_ACCOUNT"))
    }

    const authorization = rawToken.startsWith("Bearer ")
      ? rawToken
      : `Bearer ${rawToken}`;

    const result = await decodedToken({
        
    })


    
    
}