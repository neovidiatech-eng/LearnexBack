import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as notificationsService from "./notifications.service.js";

export const getAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationsService.getAllNotifications(req);
  return successResponse({
    req,
    res,
    message: "NOTIFICATIONS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const result = await notificationsService.markAsRead(req);
  return successResponse({
    req,
    res,
    message: "NOTIFICATION_MARKED_AS_READ_SUCCESSFULLY",
    data: result,
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationsService.markAllAsRead(req);
  return successResponse({
    req,
    res,
    message: "ALL_NOTIFICATIONS_MARKED_AS_READ_SUCCESSFULLY",
    data: result,
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationsService.deleteNotification(req);
  return successResponse({
    req,
    res,
    message: "NOTIFICATION_DELETED_SUCCESSFULLY",
    data: result,
  });
});

export const createNotification = asyncHandler(async (req, res) => {
  const result = await notificationsService.createNotification(req);
  return successResponse({
    req,
    res,
    status: 201,
    message: "NOTIFICATION_CREATED_SUCCESSFULLY",
    data: result,
  });
});