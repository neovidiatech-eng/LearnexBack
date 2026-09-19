import dbService from "../../db/db.service.js"

export const logActivity = async ({actorId = null ,userName , role,action ,status,ipAddress , module="Auth"})=>{
    return await dbService.create({
        model:"activityLog",
        data:{actorId,userName, role,action ,status,ipAddress , module}
    })
}