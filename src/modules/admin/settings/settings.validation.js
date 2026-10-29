import Joi from "joi";
import { commissionType } from "../../../utils/Enums/commissionType.enum.js";

export const commission = {
    body: Joi.object().keys({
        commissionType: Joi.string().valid(...Object.values(commissionType)).required(),
        commissionValue: Joi.number().required(),
    }).required(),
};
