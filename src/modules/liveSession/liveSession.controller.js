import { asyncHandler, successResponse } from "../../utils/response.js";
import * as liveservice from "./liveSession.service.js"

export const createLiveSession = asyncHandler(async(req,res,next)=>{
    const {title, startAt, type, studentIds} = req.body
    const userId = req.user.id
    const liveSession = await liveservice.createLiveSession({
        title,
        startAt,
        type,
        studentIds,
        userId
    })
    return successResponse({
        res,
        req,
        message:"CREATE_SUCCESS",
        data:liveSession,
        status:201
    })
})

export const joinLiveSession = asyncHandler(async(req,res,next)=>{
    const {id} = req.params
    const userId = req.user.id

    const result = await liveservice.joinLiveSession({
        liveSessionId:id,
        userId,
    })
    return successResponse({
        req,
        res,
        status:200,
        message:"LIVE_SESSION_JOIN_SUCCESS",
        data:result
    })
})

export const getLiveSession = asyncHandler(async(req,res,next)=>{
    const {id}= req.params;

    const liveSession = await liveservice.getLiveSession({liveSessionId:id})

    return successResponse({
        req,
        res,
        status:200,
        message:"FETCH_SUCCESS",
        data:liveSession
    })


})
export const getAllLiveSessions = asyncHandler(async(req,res,next)=>{
    const {page,limit,search}= req.query
    const liveSessions = await liveservice.getAllLiveSessions({page,limit,search})
    return successResponse({
        req,
        res,
        status:200,
        message:"FETCH_SUCCESS",
        data:liveSessions
    })
})

export const deleteLiveSession = asyncHandler(async(req,res,next)=>{
    const {id} = req.params;
    await liveservice.deleteLiveSession({
        liveSessionId:id,
    })
    return successResponse({
        req,
        res,
        status:200,
        message:"DELETE_SUCCESS"
    })
})



export const startLiveSession = asyncHandler(async(req,res,next)=>{
    const {id} = req.params;
    const userId = req.user.id;
    const liveSession = await liveservice.startLiveSession({
        liveSessionId:id,
        userId
    })
    return successResponse({
        req,
        res,
        status:200,
        message:"LIVE_SESSION_START_SUCCESS",
        data:liveSession
    })

})

export const updateLiveSession = asyncHandler(async(req,res,next)=>{
    const {id} = req.params;
    const userId = req.user.id;
    const {startAt, title, type} = req.body;

    const liveSession = await liveservice.updateLiveSession({
        liveSessionId:id,
        userId,
        startAt,
        title,
        type
    })
    return successResponse({
        req,
        res,
        status:200,
        message:"UPDATE_SUCCESS",
        data:liveSession
    })
    
} )
export const endLiveSession = asyncHandler(async(req,res,next)=>{
    const {id} = req.params;
    const userId = req.user.id;
    const liveSession = await liveservice.endLiveSession({
        liveSessionId:id,
        userId
    })
    return successResponse({
        req,
        res,
        status:200,
        message:"LIVE_SESSION_END_SUCCESS",
        data:liveSession
    })
})

export const getStudentUpcomingLiveSessions = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { page, limit, search } = req.query;

    const result = await liveservice.getStudentUpcomingLiveSessions({
        userId,
        page,
        limit,
        search
    });

    return successResponse({
        req,
        res,
        status: 200,
        message: "FETCH_SUCCESS",
        data: result
    });
});

export const getStudentNextLiveSession = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const result = await liveservice.getStudentNextLiveSession({
        userId
    });

    return successResponse({
        req,
        res,
        status: 200,
        message: "FETCH_SUCCESS",
        data: result
    });
});