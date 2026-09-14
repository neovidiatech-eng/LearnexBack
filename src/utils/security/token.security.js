import jwt from "jsonwebtoken";
import * as DBService from "../../db/db.service.js";
import { roleEnum } from "../Enums/role.enum.js";

export const tokenTypeEnum = { access: "access", refresh: "refresh" };

export const generateToken = async ({
  payload = {},
  signature = process.env.ACCESS_TOKEN_SIGNATURE,
  options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) },
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
  tokenType = tokenTypeEnum.access,
} = {}) => {
  const [bearer, token] = authorization?.split(" ") || [];
  if (!bearer || !token) {
    return next(new Error("INVALID_TOKEN_FORMAT", { cause: 401 }));
  }

  const decoded = await verifyToken({
    token,
    signature:
      tokenType === tokenTypeEnum.access
        ? process.env.ACCESS_TOKEN_SIGNATURE
        : process.env.REFRESH_TOKEN_SIGNATURE,
  });

  const userId = decoded?.id || decoded?._id;
  if (!userId) {
    return next(new Error("INVALID_TOKEN_PAYLOAD", { cause: 401 }));
  }

  const isAdminModel =
    decoded.role === roleEnum.ADMIN ||
    decoded.role === roleEnum.SUPER_ADMIN ||
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
  const userRole = role || user.role?.name || user.role || "student";
  const access_token = await generateToken({
    payload: { id: userId, role: userRole },
    options: { expiresIn: 60 * 30 },
    signature: process.env.ACCESS_TOKEN_SIGNATURE,
  });
  const refresh_token = await generateToken({
    payload: { id: userId, role: userRole },
    signature: process.env.REFRESH_TOKEN_SIGNATURE,
    options: {
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
    },
  });
  return { access_token, refresh_token };
};