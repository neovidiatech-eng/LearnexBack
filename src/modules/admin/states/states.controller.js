import * as stateService from "./states.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";
export const getStates = asyncHandler(async (req, res) => {
  const result = await stateService.getStatesService(req.query)
  return successResponse({
    res,
    message: "ADMIN_LOGIN_SUCCESSFUL",
    data: result,
  });
});