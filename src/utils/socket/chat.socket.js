import { Server } from "socket.io";
import { chatSocketAuthentication } from "../../middleware/socket.auth.js";
import { registerChatSocketEvents } from "../../modules/chat/chat.socket.event.js";


let io;

export const initializeSocket = (httpServer, allowedOrigins) => {
    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    io.use(chatSocketAuthentication)

    io.on("connection", (socket) => {
        console.log(`Chat socket connected ${socket.id}`);

        if (socket.data?.user?.id) {
            socket.join(`user:${socket.data.user.id}`);
        }

        registerChatSocketEvents(io,socket);


        socket.on("disconnect", (reason) => {
            console.log(`Chat socket disconnected : ${reason}`, reason);

        });
    });
    return io;
}

export const getIo = () => {
    if (!io) {
        throw new Error("SOCKET_IO_NOT_INITIALIZED")
    }
    return io
}