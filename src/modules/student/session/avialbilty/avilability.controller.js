import { asyncHandler, successResponse } from "../../../../utils/response.js";
import * as availabilityService from "./avilability.service.js";

export const getAvailableSlotsController = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { from, to } = req.query;

  const result = await availabilityService.getAvailableSlots({
    teacherId,
    from: new Date(from),
    to: new Date(to),
  });

  return successResponse({
    res,
    status: 200,
    message: "AVAILABLE_SLOTS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});