import dbService from "../../../../db/db.service.js";
import { asyncHandler, successResponse } from "../../../../utils/response.js";
import * as itemService from "./items.service.js";

export const createItem = asyncHandler(async(req , res , next)=>{
    const{sectionId} = req.params;

    const{
        title,
        description,
        materialType,
        order
    } = req.body;
    const teacher = await dbService.findFirst({
        model:"teacher",
        where:{
            userId:req.user.id
        },
        select:{
            id:true
        }
    });
    if(!teacher){
        const error = new Error("TEACHER_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    const item = await itemService.createItem({
        sectionId,
        teacherId:teacher.id,
        title,
        description,
        materialType,
        materialLink:req.file?.path || req.file?.relativeDestination,
        order
    })
    return successResponse({
        res,
        status:201,
        data:item,
        message:"Item created successfully",
    });
})
