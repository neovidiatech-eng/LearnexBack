import * as calendarService from "./calendar.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getCalendar = asyncHandler(async (req, res) => {
  const result = await calendarService.getCalendarService(req.query);
  return successResponse({
    res,
    data: result,
  });
});

export const getCalendarById = asyncHandler(async (req, res) => {
  const result = await calendarService.getCalendarByIdService(req.params.id);
  return successResponse({
    res,
    data: result,
  });
});

