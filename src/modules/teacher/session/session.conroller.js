
import * as sessionService from "./session.service.js";
import { asyncHandler } from "../../../utils/response.js";
import { successResponse } from "../../../utils/response.js";

export const getTeacherSessionRequestsController = asyncHandler(
  async (req, res) => {
    const result = await sessionService.getTeacherSessionRequests({
      userId: req.user.id,
      ...req.query,
    });

    return successResponse({
      res,
      status: 200,
      message: "SESSION_REQUESTS_FETCHED_SUCCESSFULLY",
      data: result,
    });
  },
);

export const acceptRequestController = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const result = await sessionService.acceptRequest({
    userId: req.user.id,
    requestId,
  });

  return successResponse({
    res,
    status: 200,
    message: "SESSION_REQUEST_ACCEPTED_SUCCESSFULLY",
    data: result,
  });
});

export const rejectRequestController = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { rejectedReason } = req.body??{};

  const result = await sessionService.rejectRequest({
    userId: req.user.id,
    requestId,
    rejectedReason,
  });

  return successResponse({
    res,
    status: 200,
    message: "SESSION_REQUEST_REJECTED_SUCCESSFULLY",
    data: result,
  });
});

export const getMySessionsController = asyncHandler(async(req,res)=>{
    const result = await sessionService.getMySessions({
        userId:req.user.id,
        ...req.query
    })
    return successResponse({
      res,
      status:200,
      message:"TEACHER_SESSIONS_FETCHED_SUCCESSFULLY",
      data:result
    })
})

export const startSessionController = asyncHandler(async(req,res)=>{
  const {sessionId} = req.params;
  const result = await sessionService.startSession({
    userId:req.user.id,
    sessionId
  })
  return successResponse({
    res,
    status:200,
    message:"SESSION_STARTED_SUCCESSFULLY",
    data:result,
  })
})

export const endSessionController = asyncHandler(async (req, res) => {
  const result = await sessionService.endSession({
    userId: req.user.id,
    sessionId: req.params.sessionId,
  });

  return successResponse({
    res,
    status: 200,
    data: result,
    message: "SESSION_ENDED_SUCCESSFULLY",
  });
});

export const getTeacherCustomRequestsController = asyncHandler(async (req, res) => {
  const result = await sessionService.getTeacherCustomSessionRequests({
    userId: req.user.id,
    ...req.query,
  });

  return successResponse({
    res,
    status: 200,
    message: "CUSTOM_SESSION_REQUESTS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const acceptCustomRequestController = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const result = await sessionService.acceptCustomSessionRequest({
    userId: req.user.id,
    requestId,
  });

  return successResponse({
    res,
    status: 200,
    message: "CUSTOM_SESSION_REQUEST_ACCEPTED_SUCCESSFULLY",
    data: result,
  });
});

export const rejectCustomRequestController = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { rejectedReason } = req.body??{};

  const result = await sessionService.rejectCustomSessionRequest({
    userId: req.user.id,
    requestId,
    rejectedReason,
  });

  return successResponse({
    res,
    status: 200,
    message: "CUSTOM_SESSION_REQUEST_REJECTED_SUCCESSFULLY",
    data: result,
  });
});

export const joinSessionController = asyncHandler(async(req,res)=>{
  const result = await sessionService.joinSession({
    userId:req.user.id,
    sessionId:req.params.sessionId,
  })

  return successResponse({
    res,
    status:200,
    message:"SESSION_JOINED_SUCCESSFULLY",
    data:result
  })
})