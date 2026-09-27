import Joi from "joi";
import { generalFields } from "../../../../utils/validation/generalField.js";


export const createItemSchema = {
  params: Joi.object({
    sectionId: generalFields.id.required().messages({
      "string.empty": "SECTION_ID_EMPTY",
      "string.guid": "SECTION_ID_INVALID",
      "any.required": "SECTION_ID_REQUIRED",
    }),
  }),

  body: Joi.object({
    title: generalFields.name.required(),

    description: generalFields.description.optional(),

    materialType: Joi.string().trim().required().messages({
      "string.empty": "MATERIAL_TYPE_EMPTY",
      "any.required": "MATERIAL_TYPE_REQUIRED",
    }),
    order: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        "number.base": "ITEM_ORDER_NUMBER",
        "number.integer": "ITEM_ORDER_INTEGER",
        "number.min": "ITEM_ORDER_MIN",
      }),
  }),
};
export const getItemsSchema = {
  params: Joi.object({
    sectionId: generalFields.id.required().messages({
      "string.empty": "SECTION_ID_EMPTY",
      "string.guid": "SECTION_ID_INVALID",
      "any.required": "SECTION_ID_REQUIRED",
    }),
  }),
};

export const getItemIdParamSchema = {
    params: Joi.object({
        itemId: generalFields.id.required().messages({
            "string.empty": "ITEM_ID_EMPTY",
            "string.guid": "ITEM_ID_INVALID",
            "any.required": "ITEM_ID_REQUIRED",
        })
    })
}

export const getItemByIdSchema = {
  params: Joi.object({
    sectionId: generalFields.id.required().messages({
      "string.empty": "SECTION_ID_EMPTY",
      "string.guid": "SECTION_ID_INVALID",
      "any.required": "SECTION_ID_REQUIRED",
    }),
    itemId: generalFields.id.required().messages({
      "string.empty": "ITEM_ID_EMPTY",
      "string.guid": "ITEM_ID_INVALID",
      "any.required": "ITEM_ID_REQUIRED",
    }),
  }),
};

export const updateItemSchema = {
  params: Joi.object({
    sectionId: generalFields.id.required().messages({
      "string.empty": "SECTION_ID_EMPTY",
      "string.guid": "SECTION_ID_INVALID",
      "any.required": "SECTION_ID_REQUIRED",
    }),
    itemId: generalFields.id.required().messages({
      "string.empty": "ITEM_ID_EMPTY",
      "string.guid": "ITEM_ID_INVALID",
      "any.required": "ITEM_ID_REQUIRED",
    }),
  }),

  body: Joi.object({
    title: generalFields.name.optional(),
    description: generalFields.description.optional(),
    materialType: Joi.string().trim().optional().messages({
      "string.empty": "MATERIAL_TYPE_EMPTY",
    }),
    order: Joi.number().integer().min(1).optional().messages({
      "number.base": "ITEM_ORDER_NUMBER",
      "number.integer": "ITEM_ORDER_INTEGER",
      "number.min": "ITEM_ORDER_MIN",
    }),
  }),
};