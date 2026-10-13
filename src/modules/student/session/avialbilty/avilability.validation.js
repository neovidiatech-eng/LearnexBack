
import Joi from "joi";

const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000;

export const getAvailableSlots = {
  params: Joi.object({
    teacherId: Joi.string().uuid().required(),
  }),

  query: Joi.object({
    from: Joi.date().iso().required(),
    to: Joi.date().iso().greater(Joi.ref("from")).required(),
  }).custom((value, helpers) => {
    if (new Date(value.to) - new Date(value.from) > MAX_RANGE_MS) {
      return helpers.message("DATE_RANGE_TOO_LARGE");
    }
    return value;
  }),
};