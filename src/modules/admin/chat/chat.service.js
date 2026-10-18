import dbService from "../../../db/db.service.js";

export const getConversationsService = async ({
    search = "",
    page = 1,
    limit = 20,
}) => {
    const where = {};
    if(search?.trim()){
        where.user = {
            fullName:{
                contains:search.trim(),
                mode:"insensitive",
            }
        }
    }
    const result = await dbService.findManyWithPaginationAndCount({
        model:"conversation",
        where,
        page,
        limit,
        orderBy:[
            {lastMessageAt:{sort:"desc",nulls:"last"}},
            {createdAt:"desc"}
        ],
        select:{
            id:true,
            userId:true,
            lastMessage:true,
            lastMessageAt:true,
            unreadAdminCount:true,
            unreadUserCount:true,
            createdAt:true,
            user:{
                select:{
                    id:true,
                    fullName:true,
                    profilePhoto:true,
                    role:{
                        select:{
                            name:true
                        },
                    },
                    student:{
                        select:{
                            id:true,
                            
                        },
                    },
                    teacher:{
                        select:{
                            id:true,
                            
                        }
                    }

                }
            }
        }

        
    })

    return{
        conversations:result.items.map((conversation)=>({
            id:conversation.id,
            userId:conversation.userId,
            user:{
                id:conversation.user.id,
                fullName:conversation.user.fullName,
                profilePhoto:conversation.user.profilePhoto,
                role:conversation.user.role?.name??null,
                userType:conversation.user.teacher
                ?"TEACHER"
                :conversation.user.student
                ?"STUDENT" :"OTHER"
                

            },
            lastMessage:conversation.lastMessage,
            lastMessageAt:conversation.lastMessageAt,
            unreadAdminCount:conversation.unreadAdminCount,
            unreadUserCount:conversation.unreadUserCount,
            createdAt:conversation.createdAt
            
        })),
        pagination: result.pagination,
    }

}