import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as reviewsService from "./reviews.service.js";

export const getReviews = asyncHandler(async (req, res) => {
  const result = await reviewsService.getReviewsService(req.user.id);
  return successResponse({
    res,
    data: result,
  });
});

