import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as savedService from "./saved.service.js";

/**
 * GET /student/saved
 * Returns the authenticated student's saved items.
 */
export const getSaved = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const saved = await savedService.getSavedService(req.user.id, locale);
  return successResponse({ res, data: saved });
});

/**
 * POST /student/saved/add
 * Adds an item (course) to saved items.
 * Body: { type: "COURSE", itemId: "<courseId>" }
 */
export const addToSaved = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const saved = await savedService.addToSavedService(req.user.id, req.body, locale);
  return successResponse({ res, status: 201, message: "ITEM_ADDED_TO_SAVED", data: saved });
});

/**
 * DELETE /student/saved/remove/:itemId
 * Removes an item from saved items by its Saved id or itemId.
 */
export const removeFromSaved = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const saved = await savedService.removeFromSavedService(
    req.user.id,
    req.params.itemId,
    locale
  );
  return successResponse({ res, message: "ITEM_REMOVED_FROM_SAVED", data: saved });
});

/**
 * DELETE /student/saved/clear
 * Clears all saved items for the student.
 */
export const clearSaved = asyncHandler(async (req, res) => {
  const saved = await savedService.clearSavedService(req.user.id);
  return successResponse({ res, message: "SAVED_CLEARED", data: saved });
});
