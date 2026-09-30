import joi from "joi";

export const changeLanguageSchema = {
  body: joi
    .object({
      language: joi
        .string()
        .valid("ar", "en", "es", "fr", "de", "it")
        .required()
        .messages({
          "any.required": "LANGUAGE_IS_REQUIRED",
          "any.only": "LANGUAGE_NOT_SUPPORTED",
        }),
    })
    .options({ allowUnknown: false }),
};
