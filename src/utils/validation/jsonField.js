import joi from "joi";

export const jsonArray = (itemSchema, { required = false } = {}) => {
  const base = joi
    .alternatives()
    .try(
      joi.array().items(itemSchema),
      joi.string().custom((value, helpers) => {
        let parsed;
        const trimmed = typeof value === "string" ? value.trim() : "";
        try {
          parsed = JSON.parse(value);
        } catch {
          if (trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("{")) {
            parsed = trimmed.includes(",")
              ? trimmed.split(",").map((s) => s.trim()).filter(Boolean)
              : [trimmed];
          } else {
            return helpers.error("jsonArray.invalidJson");
          }
        }
        if (!Array.isArray(parsed)) return helpers.error("jsonArray.notArray");
        if (itemSchema) {
          const itemValidation = joi.array().items(itemSchema).validate(parsed);
          if (itemValidation.error) {
            return helpers.error("jsonArray.invalidItem", { details: itemValidation.error.details });
          }
          return itemValidation.value;
        }
        return parsed;
      }, "JSON string to array"),
    )
    .messages({
      "jsonArray.invalidJson": "{{#label}} must be a valid JSON array string",
      "jsonArray.notArray": "{{#label}} must be an array",
      "jsonArray.invalidItem": "{{#label}} contains invalid items",
    });

  return required ? base.required() : base;
};
