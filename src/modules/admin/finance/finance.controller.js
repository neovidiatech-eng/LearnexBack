import * as financeService from "./finance.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";
import dayjs from "dayjs";

export const getFinanceOverview = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const result = await financeService.getFinanceOverviewService(
    req.query,
    locale
  );
  return successResponse({ res, data: result });
});

export const getTransactions = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const result = await financeService.getTransactionsService({
    ...req.query,
    locale,
  });
  return successResponse({ res, data: result });
});

export const getTransactionById = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const result = await financeService.getTransactionByIdService(
    req.params.id,
    locale
  );
  return successResponse({ res, data: result });
});

export const exportTransactionsExcel = asyncHandler(async (req, res) => {
  const locale = req.query.locale || req.headers["accept-language"] || "ar";
  const workbook = await financeService.exportTransactionsExcelService({
    ...req.query,
    locale,
  });

  const filename = `finance-transactions-${dayjs().format("YYYY-MM-DD")}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  await workbook.xlsx.write(res);
  res.end();
});

