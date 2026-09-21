import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

const translationSchema = joi.object({
  lang: joi.string().valid("en", "ar", "fr").default("en"),
  name: joi.string().min(2).max(100).trim().required(),
  slug: joi.string().trim().optional(),
});

export const createRole = {
  body: joi
    .object()
    .keys({
      color: joi.string().trim().allow("", null).optional(),
      name: joi.string().min(2).max(100).trim().optional(),
      lang: joi.string().valid("en", "ar", "fr").optional(),
      slug: joi.string().trim().optional(),
      translations: joi.array().items(translationSchema).optional(),
      permissionIds: joi.array().items(joi.string().trim()).optional(),
      permissions: joi.array().items(joi.string().trim()).optional(),
    })
    .or("translations", "name")
    .required()
    .options({ allowUnknown: false }),
};

export const getAllRoles = {
  query: joi
    .object()
    .keys({
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).max(100).default(10),
      search: joi.string().trim().allow(""),
      lang: joi.string().trim().allow(""),
      locale: joi.string().trim().allow(""),
    })
    .options({ allowUnknown: false }),
};

export const getRoleById = {
  params: joi
    .object()
    .keys({
      roleId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
  query: joi
    .object()
    .keys({
      lang: joi.string().trim().allow(""),
      locale: joi.string().trim().allow(""),
    })
    .options({ allowUnknown: false }),
};

export const updateRole = {
  params: joi
    .object()
    .keys({
      roleId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
  body: joi
    .object()
    .keys({
      color: joi.string().trim().allow("", null).optional(),
      name: joi.string().min(2).max(100).trim().optional(),
      lang: joi.string().valid("en", "ar", "fr").optional(),
      slug: joi.string().trim().optional(),
      translations: joi.array().items(translationSchema).optional(),
      permissionIds: joi.array().items(joi.string().trim()).optional(),
      permissions: joi.array().items(joi.string().trim()).optional(),
    })
    .min(1)
    .required()
    .options({ allowUnknown: false }),
};

export const deleteRole = {
  params: joi
    .object()
    .keys({
      roleId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};


