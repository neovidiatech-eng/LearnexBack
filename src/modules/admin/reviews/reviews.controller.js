import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as reviewsService from "./reviews.service.js";

export const getReviews = asyncHandler(async (req, res) => {
  const result = await reviewsService.getReviewsService(req.query);
  return successResponse({
    res,
    message: "REVIEWS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getReviewStats = asyncHandler(async (req, res) => {
  const result = await reviewsService.getReviewStatsService();
  return successResponse({
    res,
    message: "REVIEW_STATS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getReviewById = asyncHandler(async (req, res) => {
  const result = await reviewsService.getReviewByIdService(
    req.params,
    req.query,
  );
  return successResponse({
    res,
    message: "REVIEW_DETAILS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const toggleReviewVisibility = asyncHandler(async (req, res) => {
  const result = await reviewsService.toggleReviewVisibilityService(
    req.params,
    req.body,
    req.query,
  );
  return successResponse({
    res,
    message: "REVIEW_VISIBILITY_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewsService.deleteReviewService(req.params, req.query);
  return successResponse({
    res,
    status: 200,
    message: "REVIEW_DELETED_SUCCESSFULLY",
  });
});
