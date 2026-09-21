import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as offerService from "./offers.service.js";

export const createOffer = asyncHandler(async (req, res) => {
  const result = await offerService.createOfferService(req.body);
  return successResponse({
    res,
    data: result,
    status: 201,
    message: "OFFER_CREATED_SUCCESSFULLY",
  });
});

export const getAllOffers = asyncHandler(async (req, res) => {
  const result = await offerService.getAllOffersService(req.query);
  return successResponse({
    res,
    data: result,
    message: "OFFERS_FETCHED_SUCCESSFULLY",
  });
});

export const getOfferById = asyncHandler(async (req, res) => {
  const result = await offerService.getOfferByIdService(
    req.params.offerId,
    req.query.locale,
  );
  return successResponse({
    res,
    data: result,
    message: "OFFER_DETAILS_FETCHED_SUCCESSFULLY",
  });
});

export const updateOffer = asyncHandler(async (req, res) => {
  const result = await offerService.updateOfferService(
    req.params.offerId,
    req.body,
  );
  return successResponse({
    res,
    data: result,
    message: "OFFER_UPDATED_SUCCESSFULLY",
  });
});

export const changeOfferStatus = asyncHandler(async (req, res) => {
  const offer = await offerService.changeOfferStatusService(
    req.params.offerId,
    req.body,
  );
  return successResponse({
    res,
    data: offer,
    message: "OFFER_STATUS_UPDATED_SUCCESSFULLY",
  });
});

export const deleteOffer = asyncHandler(async (req, res) => {
  await offerService.deleteOfferService(req.params.offerId);
  return successResponse({
    res,
    status: 204,
  });
});
