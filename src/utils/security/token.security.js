import jwt from "jsonwebtoken";
import * as DBService from "../../db/db.service.js";
import { baseRoleEnum } from "../Enums/role.enum.js";
import { tokenTypeEnum } from "../Enums/token.enum.js";


export const generateToken = async ({
  payload = {},
  signature = process.env.ACCESS_TOKEN_SIGNATURE,
  options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 60 * 60 * 24 * 7 },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = async ({
  token = "",
  signature = process.env.ACCESS_TOKEN_SIGNATURE,
} = {}) => {
  return jwt.verify(token, signature);
};

export const decodedToken = async ({
  next,
  authorization = "",
  tokenType = tokenTypeEnum.ACCESS,
} = {}) => {
  const [bearer, token] = authorization?.split(" ") || [];
  if (!bearer || !token) {
    return next(new Error("INVALID_TOKEN_FORMAT", { cause: 401 }));
  }

  let decoded;
  try {
    decoded = await verifyToken({
      token,
      signature:
        tokenType === tokenTypeEnum.ACCESS
          ? process.env.ACCESS_TOKEN_SIGNATURE
          : process.env.REFRESH_TOKEN_SIGNATURE,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("TOKEN_EXPIRED", { cause: 401 }));
    }
    return next(new Error("INVALID_TOKEN", { cause: 401 }));
  }

  const userId = decoded?.id || decoded?._id;
  if (!userId) {
    return next(new Error("INVALID_TOKEN_PAYLOAD", { cause: 401 }));
  }

  const isAdminModel =
    decoded.role === baseRoleEnum.ADMIN ||
    decoded.role === baseRoleEnum.SUPER_ADMIN ||
    ["admin", "super_admin"].includes(String(decoded.role).toLowerCase());

  const model = isAdminModel ? "admin" : "user";

  const user = await DBService.findFirst({
    model,
    where: {
      id: userId,
    },
    include:
      model === "user"
        ? {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
              roleTranslations: true,
            },
          },
        }
        : undefined,
  });
  if (!user) {
    return next(new Error("ACCOUNT_NOT_FOUND", { cause: 404 }));
  }

  if (model === "admin" && !user.role) {
    user.role = { name: decoded.role || "admin", rolePermissions: [] };
  }

  return { user, decoded };
};

export const generateLoginCredentials = async ({ user, role }) => {
  const userId = user.id || user._id;

  const rawRole =
    (typeof role === "string" ? role : null) ||
    user.role?.slug ||
    user.role?.roleTranslations?.[0]?.name ||
    user.role?.name ||
    (typeof user.role === "string" ? user.role : null) ||
    "student";
  const userRole = typeof rawRole === "string" ? rawRole : "student";

  const access_token = await generateToken({
    payload: { id: userId, role: userRole },
    options: {
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 60 * 60 * 24 * 7,
    },
    signature: process.env.ACCESS_TOKEN_SIGNATURE,
  });
  const refresh_token = await generateToken({
    payload: { id: userId, role: userRole },
    signature: process.env.REFRESH_TOKEN_SIGNATURE,
    options: {
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 60 * 60 * 24 * 365,
    },
  });
  return { access_token, refresh_token };
};