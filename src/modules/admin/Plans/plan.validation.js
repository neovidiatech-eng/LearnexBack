import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

import { days } from "../../../utils/Enums/days.js";


export const getAllPlans = {
  query: joi.object({
    page: generalFields.page.required(),
    limit: generalFields.limit.required(),
    search: generalFields.search.optional(),
    sortOrder: joi.string().optional().valid("asc", "desc").optional(),
    teacherId: generalFields.id.optional(),
  })
}