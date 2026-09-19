import { asyncHandler } from "../utils/response.js";

export const validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const validationError = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        validationError.push({
          key,
          details: validationResult.error.details.map((element) => {
            return { message: element.message, path: element.path[0] };
          }),
        });
      }
    }
    if (validationError.length) {
      return res
        .status(400)
        .json({ error_message: "VALIDATION_ERROR", validationError });
    }
    return next();
  });
};
