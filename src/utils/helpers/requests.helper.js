import * as db from "../../db/db.service.js";
import { requestStatusEnum, requestTabEnum } from "../Enums/request.enum.js";
import { asyncHandler } from "../response.js";

const generateRequestCode = async () => {
  const count = await db.count({ model: "systemRequest" });
  const nextNum = (count + 1).toString().padStart(4, "0");
  return `REQ-${nextNum}`;
};

export const createSystemRequest = asyncHandler(
  async ({
    tab,
    type,
    priority,
    requesterId,
    requesterRole = requestTabEnum.STUDENT,
    referenceId,
    referenceModel,
    details = {},
  } = {}) => {
    const code = await generateRequestCode();
    const request = await db.create({
      model: "systemRequest",
      data: {
        code,
        tab,
        type,
        priority,
        status: requestStatusEnum.PENDING,
        requesterId,
        requesterRole,
        referenceId,
        referenceModel,
        details,
      },
    });
    return request;
  },
);
