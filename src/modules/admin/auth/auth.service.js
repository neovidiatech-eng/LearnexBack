import * as DBService from "../../../db/db.service.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import { generateLoginCredentials } from "../../../utils/security/token.security.js";
import { roleEnum } from "../../../utils/Enums/role.enum.js";

export const loginService = async ({ email, password }) => {
  const admin = await DBService.findFirst({
    model: "admin",
    where: { email },
  });

  if (!admin) {
    const error = new Error("INVALID_CREDENTIALS");
    error.cause = 400;
    throw error;
  }

  const isPasswordValid = await compareHash({
    plainText: password,
    hashValue: admin.password,
  });

  if (!isPasswordValid) {
    const error = new Error("INVALID_CREDENTIALS");
    error.cause = 400;
    throw error;
  }

  const credentials = await generateLoginCredentials({
    user: admin,
    role: roleEnum.ADMIN,
  });

  return { credentials };
};

export const getNewCredentialsService = async (user) => {
  const credentials = await generateLoginCredentials({
    user,
    role: roleEnum.ADMIN,
  });

  return { credentials };
};