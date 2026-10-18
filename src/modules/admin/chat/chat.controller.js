import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as chatService from "./chat.service.js";

export const getConversations = asyncHandler(async(req,res,next)=>{
    const {search,page,limit} = req.query;
    const result = await chatService.getConversationsService({search,page,limit});
    return successResponse({
        res,
        message:"CONVERSATION_RETRIEVED_SUCCESSFULLY",
        data:result,
    });
    
    
})