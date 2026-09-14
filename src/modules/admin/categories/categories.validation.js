import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

export const getAllCategories = {
  query: joi
    .object()
    .keys({
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).max(100).default(10),
      search: joi.string().trim().allow(""),
    })
    .options({ allowUnknown: false }),
};

export const getCategoryById = {
  params: joi
    .object()
    .keys({
      categoryId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const createCategory = {
  body: joi
    .object()
    .keys({
      name: joi.string().min(2).max(100).trim().required(),
      description: joi.string().min(2).max(1000).trim().required(),
      slug: joi.string().trim(),
    })
    .required()
    .options({ allowUnknown: false }),
  file: joi.object(generalFields.file).unknown(true).optional(),
  query: joi
    .object()
    .keys({
      slug: joi.string().trim(),
    })
    .options({ allowUnknown: false }),
};

export const editCategory = {
  params: joi
    .object()
    .keys({
      categoryId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
  body: joi
    .object()
    .keys({
      name: joi.string().min(2).max(100).trim(),
      description: joi.string().min(2).max(1000).trim(),
      slug: joi.string().trim(),
    })
    .min(1)
    .required()
    .options({ allowUnknown: false }),
  file: joi.object(generalFields.file).unknown(true).optional(),
};

export const deleteCategory = {
  params: joi
    .object()
    .keys({
      categoryId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};
