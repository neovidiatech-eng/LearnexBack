import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as activitylogsService from "./activitylogs.service.js";

export const getActivityStats = asyncHandler(async(req,res)=>{
    const result = await activitylogsService.getActivityStats()
    return successResponse({
        req,
        res,
        message:"FETCH_SUCCESSFULLY",
        data:result
    })
    
})

export const getActivitylogs = asyncHandler(async(req,res)=>{
    const result = await activitylogsService.getActivitylogs(req.query);
    return successResponse({
        req,
        res,message:"FETCH_SUCCESSFULLY",
        data:result
    })
})

export const getActivitylogById = asyncHandler(async(req,res)=>{
    const result = await activitylogsService.getActivitylogsById(req.params.id)
    return successResponse({
        req,
        res,
        message:"FETCH_SUCCESSFULLY",
        data:result
    })
})