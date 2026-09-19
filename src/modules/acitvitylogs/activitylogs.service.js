import dbService from "../../db/db.service.js"
import { ACTIVITY_ACTIONS, ACTIVITY_STATUS } from "../../utils/Enums/activity.enum.js"

export const getActivityStats = async() =>{
    const [total,login,logout,failed] = await Promise.all([
        dbService.count({model:"activityLog"}),
        dbService.count({model:"activityLog",where:{action:ACTIVITY_ACTIONS.LOGIN}}),
        dbService.count({model:"activityLog",where:{action:ACTIVITY_ACTIONS.LOGOUT}}),
        dbService.count({model:"activityLog",where:{status:ACTIVITY_STATUS.FAILED}}),
    ])
    return {total,login,logout,failed};
}

export const getActivitylogs = async({action="all",search,page=1,limit=10})=>{
    const where = {
        ...(action !== "all" && { action:action.toUpperCase() }),
        ...(search && {
            userName:{
                contains:search,
                mode:"insensitive"
            }
        })
    }
    const [logs,total] = await Promise.all([
        dbService.findMany({
            model:"activityLog",
            where,
            orderBy:{createdAt:"desc"},
            skip: (Number(page)-1)*Number(limit),
            take:Number(limit)
        }),
        dbService.count({model:"activityLog",where})
    ])
    return {logs,total,page:Number(page)}
};

export const getActivitylogsById = async(id) =>{
    const log = await dbService.findFirst({
        model:"activityLog",
        where:{id}
    })
    if(!log){
        const error = new Error("ACTIVITY_LOG_NOT_FOUND")
        error.cause = 404;
        throw error;
    }
    return log;
}