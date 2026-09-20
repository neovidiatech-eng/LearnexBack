import joi from "joi";

export const jsonArray = (itemSchema, { required = false } = {}) => {
  const base = joi
    .alternatives()
    .try(
      joi.array().items(itemSchema),
      joi.string().custom((value, helpers) => {
        let parsed;
        try {
          parsed = JSON.parse(value);
        } catch {
          return helpers.error("jsonArray.invalidJson");
        }
        if (!Array.isArray(parsed)) return helpers.error("jsonArray.notArray");
        return parsed;
      }, "JSON string to array"),
    )
    .messages({
      "jsonArray.invalidJson": "{{#label}} must be a valid JSON array string",
      "jsonArray.notArray": "{{#label}} must be an array",
    });

  return required ? base.required() : base;
};
