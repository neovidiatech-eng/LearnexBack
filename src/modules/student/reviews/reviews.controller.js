import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as reviewsService from "./reviews.service.js";

export const addReview = asyncHandler(async (req, res) => {
  const result = await reviewsService.addReviewService(req.user.id, req.body);
  return successResponse({
    res,
    status: 201,
    message: "REVIEW_SUBMITTED_SUCCESSFULLY",
    data: result,
  });
});

export const getReviews = asyncHandler(async (req, res) => {
  const result = await reviewsService.getReviewsService(req.user?.id, req.query);
  return successResponse({
    res,
    data: result,
  });
});
