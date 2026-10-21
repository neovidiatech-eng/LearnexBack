import * as reportService from "./reports.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getReports = asyncHandler(async (req, res) => {
  const locale =
    req.locale || req.headers?.["accept-language"]?.slice(0, 2) || "en";
  const result = await reportService.getReportsService(req.query, locale);
  return successResponse({
    res,
    data: result,
  });
});

export const getReportsExcel = asyncHandler(async (req, res) => {
  const locale =
    req.locale || req.headers?.["accept-language"]?.slice(0, 2) || "en";
  const workbook = await reportService.exportReportsToExcelService(
    req.query,
    locale,
  );

  const filename = `reports_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
});

export const getReportsPdf = asyncHandler(async (req, res) => {
  const locale =
    req.locale || req.headers?.["accept-language"]?.slice(0, 2) || "en";
  const doc = await reportService.exportReportsToPdfService(req.query, locale);

  const filename = `reports_export_${new Date().toISOString().slice(0, 10)}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res)
  doc.end(); 
});