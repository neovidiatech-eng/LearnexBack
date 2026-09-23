import * as DBService from "../../../db/db.service.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import { generateLoginCredentials } from "../../../utils/security/token.security.js";
import { baseRoleEnum } from "../../../utils/Enums/role.enum.js";
import { logActivity } from "../../../utils/helpers/acitvitylogs.js";
import { ACTIVITY_ACTIONS, ACTIVITY_STATUS } from "../../../utils/Enums/activity.enum.js";

export const loginService = async ({ email, password,ipAddress }) => {
  const admin = await DBService.findFirst({
    model: "admin",
    where: { email },
  });

  if (!admin) {
    await logActivity({
      actorId:null,
      userName:email,
      role:baseRoleEnum.ADMIN,
      action:ACTIVITY_ACTIONS.LOGIN,
      status:ACTIVITY_STATUS.FAILED,
      ipAddress
    })
    const error = new Error("INVALID_CREDENTIALS");
    error.cause = 400;
    throw error;
  }

  const isPasswordValid = await compareHash({
    plainText: password,
    hashValue: admin.password,
  });

  if (!isPasswordValid) {
    await logActivity({
      actorId:admin.id,
      userName:admin.fullName,
      role:baseRoleEnum.ADMIN,
      action:ACTIVITY_ACTIONS.LOGIN,
      status:ACTIVITY_STATUS.FAILED,
      ipAddress
    })
    const error = new Error("INVALID_CREDENTIALS");
    error.cause = 400;
    throw error;
  }

  const credentials = await generateLoginCredentials({
    user: admin,
    role: baseRoleEnum.ADMIN,
  });

  await logActivity ({
    actorId:admin.id,
    userName:admin.fullName,
    role:baseRoleEnum.ADMIN,
    action:ACTIVITY_ACTIONS.LOGIN,
    status:ACTIVITY_STATUS.SUCCESS,
    ipAddress
  })

  return { credentials };
};
export const logOutService = async ({user,ipAddress})=>{
  await logActivity({
    actorId:user.id,
    userName:user.fullName,
    role:baseRoleEnum.ADMIN,
    action:ACTIVITY_ACTIONS.LOGOUT,
    status:ACTIVITY_STATUS.SUCCESS,
    ipAddress
  })
  return {}
  
}

export const getNewCredentialsService = async (user) => {
  const credentials = await generateLoginCredentials({
    user,
    role: baseRoleEnum.ADMIN,
  });

  return { credentials };
};
