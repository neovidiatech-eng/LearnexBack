import dbService from "../../db/db.service.js";

export const registerChatSocketEvents = (io, socket) => {
  socket.on("join_conversation", async ( payload,ack)=>{
    const reply = typeof ack === "function" ? ack : () => {};
    try {
        const {conversationId} = payload ?? {}
        if(
            typeof conversationId !='string' ||
            !conversationId.trim()
        ){
            return reply({ ok: false, code: "INVALID_CONVERSATION_ID" });
        }

        const accountType = socket.data.accountType;
        const participantId = 
        accountType === "student"
        ?socket.data.student?.id
        :accountType === "teacher"
        ?socket.data.teacher?.id
        :null;

        if(participantId == null){
            return reply({ ok: false, code: "INVALID_ACCOUNT_TYPE" });
        }

        const where = 
            accountType === "student"
            ?{id:conversationId,studentId:participantId}
            :{id:conversationId,teacherId:participantId};

        const conversation = await dbService.findFirst({
            model:"conversation",
            where,
            select:{id:true},
        });
        if(!conversation){
            return reply({ ok: false, code: "CONVERSATION_NOT_FOUND" });

        }

        const roomName = `conversation:${conversationId}`;

        await socket.join(roomName);

        return reply({ ok: true, conversationId: conversation.id });
       
    } catch (error) {
        console.error("join_conversation_failed:",error);
        return reply({ ok: false, code: "INTERNAL_SERVER_ERROR" });

        
    }
  }

)

socket.on("send_message",async(payload,ack)=>{
    const reply = typeof ack === "function" ? ack : () => {};
    try {
        const {conversationId , content} = payload ?? {};
        if(
            typeof conversationId !== "string" ||
            !conversationId.trim() ||
            typeof content !== "string" ||
            !content.trim()
        ){
            return reply({ ok: false, code: "INVALID_MESSAGE_DATA" });

        }

        const accountType = socket.data.accountType;

        const participantId =
            accountType === "student"
            ? socket.data.student?.id
            : accountType === "teacher"
            ? socket.data.teacher?.id
            : null;
        const userId = socket.data.user?.id;

        if(!participantId || !userId){
            return reply({ ok: false, code: "UNAUTHORIZED_ACCOUNT" });

        }
        const where =
            accountType === "student"
             ?{
                id:conversationId,
                studentId:participantId
             }
             :{
                id:conversationId,
                teacherId:participantId
             };
        const messageContent = content.trim();
        if(messageContent.length > 5000){
            return reply({ ok: false, code: "MESSAGE_TOO_LONG" });

        }
        const result = await dbService.transaction(async (tx) => {
            const conversation = await tx.findFirst({
                model: "conversation",
                where,
                select: {
                    id: true,
                    student: { select: { userId: true } },
                    teacher: { select: { userId: true } },
                },
            });
            if (!conversation) {
                return null;
            }
            const createdMessage = await tx.create({
                model: "message",
                data: {
                    conversationId: conversation.id,
                    senderId: userId,
                    content: messageContent,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            fullName: true,
                            profilePhoto: true,
                        },
                    },
                },
            });
            await tx.updateOne({
                model: "conversation",
                where: { id: conversation.id },
                data: {
                    lastMessage: messageContent.slice(0, 100),
                    lastMessageAt: createdMessage.createdAt,
                    ...(accountType === "student"
                        ? { unreadTeacherCount: { increment: 1 } }
                        : { unreadStudentCount: { increment: 1 } }
                    ),
                },
            });

            const recipientUserId =
                accountType === "student"
                    ? conversation.teacher?.userId
                    : conversation.student?.userId;

            return { message: createdMessage, recipientUserId };
        });

        if (!result) {
            return reply({ ok: false, code: "CONVERSATION_NOT_FOUND" });
        }

        const { message, recipientUserId } = result;
        const roomName = `conversation:${conversationId}`;

        socket.to(roomName).emit("new_message", message);

        if (recipientUserId) {
            io.to(`user:${recipientUserId}`).emit("new_message_notification", {
                conversationId,
                message,
            });
        }

        return reply({ ok: true, message });


        
        
    } catch (error) {
        console.error("send_message_failed:", error);

        return reply({ ok: false, code: "INTERNAL_SERVER_ERROR" });
        
    }
})
socket.on("mark_as_read", async (payload, ack) => {
  const reply = typeof ack === "function" ? ack : () => {};

  try {
    const { conversationId } = payload ?? {};
    if (typeof conversationId !== "string" || !conversationId.trim()) {
      return reply({ ok: false, code: "INVALID_CONVERSATION_ID" });
    }

    const accountType = socket.data.accountType;
    const participantId =
      accountType === "student"
        ? socket.data.student?.id
        : accountType === "teacher"
        ? socket.data.teacher?.id
        : null;

    if (!participantId) {
      return reply({ ok: false, code: "UNAUTHORIZED_ACCOUNT" });
    }

    const where =
      accountType === "student"
        ? { id: conversationId, studentId: participantId }
        : { id: conversationId, teacherId: participantId };

    const readAt = new Date();

    const conversation = await dbService.transaction(async (tx) => {
      const existingConversation = await tx.findFirst({
        model: "conversation",
        where,
        select: { id: true },
      });
      if (!existingConversation) return null;

      return tx.updateOne({
        model: "conversation",
        where: { id: existingConversation.id },
        data:
          accountType === "student"
            ? { studentLastReadAt: readAt, unreadStudentCount: 0 }
            : { teacherLastReadAt: readAt, unreadTeacherCount: 0 },
        select: { id: true },
      });
    });

    if (!conversation) {
      return reply({ ok: false, code: "CONVERSATION_NOT_FOUND" });
    }

    const readPayload = {
      conversationId: conversation.id,
      readBy: accountType,
      readAt,
    };

    socket.to(`conversation:${conversation.id}`).emit("message_read", readPayload);

    return reply({ ok: true, ...readPayload });
  } catch (error) {
    console.error("mark_as_read_failed:", error);
    return reply({ ok: false, code: "INTERNAL_SERVER_ERROR" });
  }
})
socket.on("leave_conversation",async(payload,ack)=>{
    const reply = typeof ack === "function" ? ack : () => {};
    try {
        const {conversationId} = payload ?? {};
        if(typeof conversationId !== "string" || !conversationId.trim()){
            return reply({ok:false,code:"INVALID_CONVERSATION_ID"})
        }
        await socket.leave(`conversation:${conversationId}`);

        return reply({ok:true,conversationId});
        
    } catch (error) {
        console.error("leave_conversation_failed:", error);
        return reply({ok:false,code:"INTERNAL_SERVER_ERROR"})
    }
});

const isInRoom = (socket,payload) =>{
    const {conversationId} = payload ?? {};
    if(typeof conversationId !== "string" || !conversationId.trim() ) return null;

    const roomName = `conversation:${conversationId}`;

    return socket.rooms.has(roomName) ? roomName : null;
}

socket.on("typing",(payload)=>{
    const roomName = isInRoom(socket,payload);

    if(!roomName) return;

    socket.to(roomName).emit("user_typing",{
        conversationId:payload.conversationId,
        userId:socket.data.user.id,
        fullName:socket.data.user.fullName
    })
})

socket.on("stop_typing",(payload)=>{
    const roomName = isInRoom(socket,payload);

    if(!roomName) return;

    socket.to(roomName).emit("user_stop_typing",{
        conversationId:payload.conversationId,
        userId:socket.data.user.id,
    })
})

socket.on("disconnecting", () => {
  for (const roomName of socket.rooms) {
    if (roomName.startsWith("conversation:")) {
      socket.to(roomName).emit("user_stop_typing", {
        conversationId: roomName.slice("conversation:".length),
        userId: socket.data.user.id,
      });
    }
  }
});



};