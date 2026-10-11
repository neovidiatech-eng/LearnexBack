import joi from "joi";
import { generalFields } from "../../utils/validation/generalField.js";
import { sessionType } from "../../utils/Enums/sessions.enum.js";

export const createLiveSessionSchema = {
    body: joi.object().keys({
        title: joi.string().optional().messages({
            "string.base": "TITLE_MUST_BE_STRING",
            "string.empty": "TITLE_CANNOT_BE_EMPTY"
        }),
        startAt: joi.date().required().messages({
            "date.base": "START_AT_MUST_BE_DATE",
            "date.empty": "START_AT_IS_REQUIRED",
            "any.required": "START_AT_IS_REQUIRED"
        }),
        type: joi.string()
            .valid(...Object.values(sessionType))
            .default(sessionType.GROUP)
            .messages({
                "string.base": "TYPE_MUST_BE_STRING",
                "any.only": "INVALID_SESSION_TYPE"
            }),
        studentIds: joi.array()
            .items(generalFields.id.messages({
                "string.pattern.base": "STUDENT_ID_MUST_BE_UUID"
            }))
            .optional()
            .messages({
                "array.base": "STUDENT_IDS_MUST_BE_ARRAY"
            })
    })
}

export const liveSessionIdSchema = {
  params: joi.object().keys({
    id: generalFields.id
      .messages({
        "string.base": "LIVE_SESSION_ID_MUST_BE_STRING",
        "string.empty": "LIVE_SESSION_ID_CANNOT_BE_EMPTY",
        "string.pattern.base": "LIVE_SESSION_ID_MUST_BE_VALID_ID",
        "any.required": "LIVE_SESSION_ID_REQUIRED",
      })
      .required(),
  }),
};

export const updateLiveSessionSchema = {
    body: joi.object().keys({
        title: joi.string().optional().messages({
            "string.base": "TITLE_MUST_BE_STRING",
            "string.empty": "TITLE_CANNOT_BE_EMPTY"
        }),
        startAt: joi.date().optional().messages({
            "date.base": "START_AT_MUST_BE_DATE",
            "date.empty": "START_AT_IS_REQUIRED"
        }),
        type: joi.string()
            .valid(...Object.values(sessionType))
            .optional()
            .messages({
                "string.base": "TYPE_MUST_BE_STRING",
                "any.only": "INVALID_SESSION_TYPE"
            })
    }).min(1)
}

export const getStudentUpcomingLiveSessionsSchema = {
    query: joi.object().keys({
        page: joi.number().integer().min(1).optional(),
        limit: joi.number().integer().min(1).optional(),
        search: joi.string().optional()
    })
}