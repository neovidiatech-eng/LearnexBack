import * as db from "../../db/db.service.js";
import { commissionType as commissionTypeEnum } from "../Enums/commissionType.enum.js";
import { walletEnum } from "../Enums/wallet.enum.js";

/**
 * Fetch the commission settings from AppSetting.
 * Falls back to default PERCENTAGE: 10 if not configured.
 */
export const getCommissionSettings = async (tx = db) => {
  const setting = await tx.findFirst({
    model: "appSetting",
    select: {
      commissionType: true,
      commissionValue: true,
    },
  });

  return {
    commissionType: setting?.commissionType || commissionTypeEnum.PERCENTAGE,
    commissionValue: Number(setting?.commissionValue ?? 10),
  };
};

/**
 * Calculate the commission split for a course item.
 * @param {object} params
 * @param {number} params.price - The paid amount of the course
 * @param {object} params.settings - { commissionType, commissionValue }
 * @param {boolean} [params.hasTeacher=true] - whether there is an instructor/teacher to receive payout
 * @returns {object} { price, platformCommission, teacherEarnings, commissionType, commissionValue }
 */
export const calculateCommissionSplit = ({
  price = 0,
  settings,
  hasTeacher = true,
}) => {
  const numPrice = Math.max(0, Number(price) || 0);

  if (numPrice === 0) {
    return {
      price: 0,
      platformCommission: 0,
      teacherEarnings: 0,
      commissionType: settings?.commissionType || commissionTypeEnum.PERCENTAGE,
      commissionValue: Number(settings?.commissionValue ?? 10),
    };
  }

  // If there is no teacher associated with the course, 100% belongs to the platform
  if (!hasTeacher) {
    return {
      price: numPrice,
      platformCommission: numPrice,
      teacherEarnings: 0,
      commissionType: settings?.commissionType || commissionTypeEnum.PERCENTAGE,
      commissionValue: Number(settings?.commissionValue ?? 10),
    };
  }

  const commType = settings?.commissionType || commissionTypeEnum.PERCENTAGE;
  const commVal = Number(settings?.commissionValue ?? 10);

  let platformCommission = 0;
  if (commType === commissionTypeEnum.PERCENTAGE) {
    platformCommission = Math.round((numPrice * (commVal / 100)) * 100) / 100;
  } else if (commType === commissionTypeEnum.FIXED) {
    platformCommission = Math.min(numPrice, commVal);
  } else {
    // Default fallback: 10%
    platformCommission = Math.round((numPrice * 0.1) * 100) / 100;
  }

  // Ensure bounds: 0 <= platformCommission <= numPrice
  platformCommission = Math.max(0, Math.min(numPrice, platformCommission));
  const teacherEarnings = Math.round((numPrice - platformCommission) * 100) / 100;

  return {
    price: numPrice,
    platformCommission,
    teacherEarnings,
    commissionType: commType,
    commissionValue: commVal,
  };
};

/**
 * Credit system (platform) wallet.
 * Supports both uppercase "SYSTEM" and lowercase "system".
 */
export const creditSystemWallet = async ({ tx, amount }) => {
  const numAmount = Math.max(0, Number(amount) || 0);
  if (numAmount === 0) return null;

  let wallet = await tx.findFirst({
    model: "wallet",
    where: {
      OR: [
        { type: walletEnum.SYSTEM },
        { type: "system" },
      ],
    },
  });

  if (!wallet) {
    wallet = await tx.create({
      model: "wallet",
      data: {
        type: walletEnum.SYSTEM,
        balance: numAmount,
      },
    });
  } else {
    wallet = await tx.updateOne({
      model: "wallet",
      where: { id: wallet.id },
      data: {
        balance: Number(wallet.balance || 0) + numAmount,
      },
    });
  }

  return wallet;
};

/**
 * Credit teacher wallet by teacher's user ID.
 */
export const creditTeacherWallet = async ({ tx, userId, amount }) => {
  const numAmount = Math.max(0, Number(amount) || 0);
  if (numAmount === 0 || !userId) return null;

  let wallet = await tx.findFirst({
    model: "wallet",
    where: { userId },
  });

  if (!wallet) {
    wallet = await tx.create({
      model: "wallet",
      data: {
        userId,
        type: walletEnum.TEACHER,
        balance: numAmount,
      },
    });
  } else {
    wallet = await tx.updateOne({
      model: "wallet",
      where: { id: wallet.id },
      data: {
        balance: Number(wallet.balance || 0) + numAmount,
      },
    });
  }

  return wallet;
};

