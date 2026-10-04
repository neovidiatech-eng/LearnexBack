import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as cartService from "./cart.service.js";

/**
 * GET /student/cart
 * Returns the authenticated student's cart.
 */
export const getCart = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const cart = await cartService.getCartService(req.user.id, locale);
  return successResponse({ res, data: cart });
});

/**
 * POST /student/cart/add
 * Adds an item (course) to the cart.
 * Body: { type: "COURSE", itemId: "<courseId>" }
 */
export const addToCart = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const cart = await cartService.addToCartService(req.user.id, req.body, locale);
  return successResponse({ res, status: 201, message: "ITEM_ADDED_TO_CART", data: cart });
});

/**
 * DELETE /student/cart/remove/:itemId
 * Removes a single cart item by its CartItem id.
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const cart = await cartService.removeFromCartService(
    req.user.id,
    req.params.itemId,
    locale
  );
  return successResponse({ res, message: "ITEM_REMOVED_FROM_CART", data: cart });
});

/**
 * DELETE /student/cart/clear
 * Clears all items from the cart.
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCartService(req.user.id);
  return successResponse({ res, message: "CART_CLEARED", data: cart });
});
