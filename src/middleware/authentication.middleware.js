import { asyncHandler } from "../utils/response.js";
import {
  decodedToken,
  
} from "../utils/security/token.security.js";
import { tokenTypeEnum } from "../utils/Enums/token.enum.js";
export const authentication = ({
  tokenType = tokenTypeEnum.ACCESS,
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    const result = await decodedToken({
      next,
      authorization: req.headers.authorization,
      tokenType,
    });
    if (!result) return;
    req.user = result.user;
    req.decoded = result.decoded;
    return next();
  });
};

export const auth = ({
  tokenType = tokenTypeEnum.ACCESS,
  accessRoles = [],
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        next,
        authorization: req.headers.authorization,
        tokenType,
      })) || {};
    req.user = user;
    const userRole =
      req.user?.role?.roleTranslations?.[0]?.name ||
      req.user?.role?.name ||
      req.decoded?.role;
    if (!accessRoles.includes(userRole)) {
      return next(new Error("UNAUTHORIZED_ACCOUNT", { cause: 403 }));
    }
    return next();
  });
};