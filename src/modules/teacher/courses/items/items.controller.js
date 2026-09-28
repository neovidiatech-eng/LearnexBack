import dbService from "../../../../db/db.service.js";
import { deleteFile, deleteUploadedFiles } from "../../../../utils/multer/file.utils.js";
import { asyncHandler, successResponse } from "../../../../utils/response.js";
import * as itemService from "./items.service.js";

export const createItem = asyncHandler(async(req , res , next)=>{
    const{sectionId} = req.params;

    const{
        title,
        description,
        materialType,
        materialLink:videoLink,
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
    const materialLink =
        materialType === "PDF"
            ? req.file?.path || req.file?.relativeDestination
            : req.body.materialLink;

    const item = await itemService.createItem({
        sectionId,
        teacherId:teacher.id,
        title,
        description,
        materialType,
        materialLink,
        order
    })
    return successResponse({
        res,
        status:201,
        data:item,
        message:"Item created successfully",
    });
})

export const getItems = asyncHandler(async(req,res,next)=>{
    const {sectionId} = req.params;
    const teacher = await dbService.findFirst({
        model:"teacher",
        where:{
            userId:req.user.id
        },
        select:{
            id:true,
        }
    })
    if(!teacher){
        const error = new Error("TEACHER_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    const items = await itemService.getItems({
        sectionId,
        teacherId:teacher.id
    })

    return successResponse({
        res,
        status:200,
        data:items,
        message:"ITEMS_FETCHED_SUCCESSFULLY"
    })
    
})

export const getItemById = asyncHandler(async(req,res,next)=>{
    const teacher = await dbService.findFirst({
        model:"teacher",
        where:{
            userId:req.user.id
        },
        select:{
            id:true
        }
    })
    if(!teacher){
        const error = new Error("TEACHER_NOT_FOUND");
        error.cause = 404;
        throw error;
    }

    const item = await itemService.getItemById({
        sectionId:req.params.sectionId,
        itemId:req.params.itemId,
        teacherId:teacher.id
    })

    return successResponse({
        res,
        status:200,
        data:item,
        message:"ITEM_FETCHED_SUCCESSFULLY"
    })
})
export const updateItem = asyncHandler(async(req,res,next)=>{
    const{sectionId,itemId} = req.params;
    const{
        title,
        description,
        materialType,
        order,
        materialLink:videoLink
    } = req.body;

    const teacher = await dbService.findFirst({
        model:"teacher",
        where:{
            userId:req.user.id
        },
        select:{
            id:true
        }
    })
    if(!teacher){
        const error = new Error("TEACHER_NOT_FOUND");
        error.cause = 404;
        throw error;
    }
    const materialLink =
        materialType === "PDF"
            ? req.file?.path || req.file?.relativeDestination
            : req.body.materialLink;

    const updatedItem = await itemService.updateItem({
        sectionId,
        itemId,
        teacherId:teacher.id,
        title,
        description,
        materialType,
        materialLink,
        order
    })
    if(
        updatedItem.oldMaterialLink 
        && updatedItem.updatedItem.materialLink
        && updatedItem.oldMaterialLink !== updatedItem.updatedItem.materialLink 
    ){
        deleteUploadedFiles(updatedItem.oldMaterialLink);
    }

    return successResponse({
        res,
        status:200,
        data:updatedItem,
        message:"ITEM_UPDATED_SUCCESSFULLY"
    })
})

export const deletedItem = asyncHandler(async(req,res,next)=>{
    const {sectionId,itemId} = req.params;
    const teacher = await dbService.findFirst({
        model:"teacher",
        where:{
            userId:req.user.id,
        },
        select:{
            id:true
        }
    })
    if(!teacher){
        const error = new Error("TEACHER_NOT_FOUND");
        error.cause = 404;
        throw error;
    }
    const deletedItem = await itemService.deleteItem({
        sectionId,
        itemId,
        teacherId:teacher.id
    })
    if(deletedItem.materialLink){
        deleteUploadedFiles(deletedItem.materialLink);
    }

    return successResponse({
        res,
        status:200,
        data:deletedItem,
        message:"ITEM_DELETED_SUCCESSFULLY"
    })
})