import { asyncHandler, successResponse } from "../../utils/response.js";
import * as chatServices from "./chat.service.js";

export const getConversations = asyncHandler(async (req, res) => {
  const result = await chatServices.getConversations({
    user: req.user,
    ...req.query,
  });
  return successResponse({
    res,
    message: "CONVERSATIONS_RETRIEVED_SUCCESSFULLY",
    data: result,
    status: 200,
  });
});

export const getMessages = asyncHandler(async (req, res) => {
  const result = await chatServices.getMessagesService({
    user: req.user,
    conversationId: req.params.conversationId,
    ...req.query,
  });
  return successResponse({
    res,
    message: "MESSAGES_RETRIEVED_SUCCESSFULLY",
    data: result,
    status: 200,
  });
});

export const startConversation = asyncHandler(async (req, res) => {
  const result = await chatServices.startConversationService({
    user: req.user,
    ...req.body,
  });
  return successResponse({
    res,
    message: "CONVERSATION_INITIALIZED_SUCCESSFULLY",
    data: result,
    status: 200,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await chatServices.getUnreadCountService({
    user: req.user,
  });
  return successResponse({
    res,
    message: "UNREAD_COUNT_RETRIEVED_SUCCESSFULLY",
    data: result,
    status: 200,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const result = await chatServices.markAsReadService({
    user: req.user,
    conversationId: req.params.conversationId,
  });
  return successResponse({
    res,
    message: "CONVERSATION_MARKED_AS_READ_SUCCESSFULLY",
    data: result,
    status: 200,
  });
});