import joi from "joi";
import { languagesEnum } from "../../../utils/Enums/langs.enum.js";
import { transactionStatus } from "../../../utils/Enums/transactions.enum.js";

export const getFinanceOverview = {
  query: joi.object({
    year: joi.number().integer().min(2000).max(2100).optional(),
    locale: joi
      .string()
      .valid(...Object.values(languagesEnum))
      .default(languagesEnum.ar)
      .optional(),
  }),
};

export const getTransactions = {
  query: joi.object({
    page: joi.number().integer().min(1).default(1).optional(),
    limit: joi.number().integer().min(1).max(100).default(10).optional(),
    search: joi.string().allow("", null).optional(),
    status: joi
      .string()
      .valid(...Object.values(transactionStatus), "ALL")
      .default("ALL")
      .optional(),
    paymentMethod: joi.string().allow("", null).optional(),
    startDate: joi.date().iso().optional(),
    endDate: joi.date().iso().optional(),
    locale: joi
      .string()
      .valid(...Object.values(languagesEnum))
      .default(languagesEnum.ar)
      .optional(),
  }),
};

export const getTransactionById = {
  params: joi.object({
    id: joi.string().uuid().required(),
  }),
};

export const exportTransactions = {
  query: joi.object({
    search: joi.string().allow("", null).optional(),
    status: joi
      .string()
      .valid(...Object.values(transactionStatus), "ALL")
      .default("ALL")
      .optional(),
    paymentMethod: joi.string().allow("", null).optional(),
    startDate: joi.date().iso().optional(),
    endDate: joi.date().iso().optional(),
    locale: joi
      .string()
      .valid(...Object.values(languagesEnum))
      .default(languagesEnum.ar)
      .optional(),
  }),
};
