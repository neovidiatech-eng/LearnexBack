import { Router } from "express";
import * as financeController from "./finance.controller.js";
import * as financeValidation from "./finance.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.use(authentication());

// 1. Finance Dashboard Overview (Cards, Top courses breakdown, 12-month trend, Recent transactions)
router.get(
  "/",
  authorize(PERMISSIONS_V2.FINANCE.READ),
  validation(financeValidation.getFinanceOverview),
  financeController.getFinanceOverview
);

router.get(
  "/overview",
  authorize(PERMISSIONS_V2.FINANCE.READ),
  validation(financeValidation.getFinanceOverview),
  financeController.getFinanceOverview
);

router.get(
  "/dashboard",
  authorize(PERMISSIONS_V2.FINANCE.READ),
  validation(financeValidation.getFinanceOverview),
  financeController.getFinanceOverview
);

// 2. Export to Excel ("تصدير" button)
router.get(
  "/export",
  authorize(PERMISSIONS_V2.FINANCE.EXPORT),
  validation(financeValidation.exportTransactions),
  financeController.exportTransactionsExcel
);

// 3. Transactions List Table ("أحدث المعاملات")
router.get(
  "/transactions",
  authorize(PERMISSIONS_V2.FINANCE.READ),
  validation(financeValidation.getTransactions),
  financeController.getTransactions
);

// 4. Single Transaction Details
router.get(
  "/transactions/:id",
  authorize(PERMISSIONS_V2.FINANCE.READ),
  validation(financeValidation.getTransactionById),
  financeController.getTransactionById
);

export default router;

