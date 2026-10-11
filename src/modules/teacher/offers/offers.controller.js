import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as offerService from "./offers.service.js";

export const createOffer = asyncHandler(async (req, res) => {
  const result = await offerService.createOfferService(req.user.id, req.body);
  return successResponse({
    res,
    status: 201,
    message: "OFFER_CREATED_SUCCESSFULLY",
    data: result,
  });
});

export const getAllOffers = asyncHandler(async (req, res) => {
  const result = await offerService.getAllOffersService(req.user.id, req.query);
  return successResponse({
    res,
    message: "OFFERS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getOfferById = asyncHandler(async (req, res) => {
  const result = await offerService.getOfferByIdService(
    req.user.id,
    req.params.offerId,
    req.query.locale,
  );
  return successResponse({
    res,
    message: "OFFER_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const updateOffer = asyncHandler(async (req, res) => {
  const result = await offerService.updateOfferService(
    req.user.id,
    req.params.offerId,
    req.body,
  );
  return successResponse({
    res,
    message: "OFFER_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const changeOfferStatus = asyncHandler(async (req, res) => {
  const result = await offerService.changeOfferStatusService(
    req.user.id,
    req.params.offerId,
    req.body,
  );
  return successResponse({
    res,
    message: "OFFER_STATUS_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const deleteOffer = asyncHandler(async (req, res) => {
  await offerService.deleteOfferService(req.user.id, req.params.offerId);
  return successResponse({
    res,
    message: "OFFER_DELETED_SUCCESSFULLY",
  });
});
