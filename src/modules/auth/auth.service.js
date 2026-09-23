import * as DBService from "../../db/db.service.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import { generateEncryption } from "../../utils/security/encryption.security.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";
import { customAlphabet } from "nanoid";
import { emailEvent } from "../../utils/events/email.event.js";
import { userStatusEnum } from "../../utils/Enums/userStatus.enum.js";
import { baseRoleEnum } from "../../utils/Enums/role.enum.js";
import { getCache, setCache } from "../../db/redis.service.js";

export const studentSignup = async (userData) => {
  const { email, fullName, password, phone } = userData;

  const existingUser = await DBService.findFirst({
    model: "user",
    where: { email },
  });

  if (existingUser) {
    const error = new Error("EMAIL_ALREADY_EXISTS");
    error.cause = 409;
    throw error;
  }

  const hashPassword = await generateHash({ plainText: password });
  const encPhone = phone
    ? await generateEncryption({ plainText: phone })
    : null;
  const otp = customAlphabet("0123456789", 6)();
  const confirmEmailOtp = await generateHash({ plainText: otp });
  await setCache({
    key: `email:${email}:otp`,
    value: confirmEmailOtp,
    ttlInSeconds: 60 * 5,
  });

  const role = await DBService.findFirst({
    model: "role",
    where: {
      OR: [
        { slug: baseRoleEnum.STUDENT },
        { roleTranslations: { some: { name: baseRoleEnum.STUDENT } } },
      ],
    },
    select: { id: true },
  });

  const createdUser = await DBService.create({
    model: "user",
    data: {
      email,
      fullName,
      password: hashPassword,
      phone: encPhone,
      role: role?.id ? { connect: { id: role.id } } : undefined,
      status: userStatusEnum.PENDING_VERIFICATION,
      confirmEmail: false,
      student: {
        create: {},
      },
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: {
        select: {
          id: true,
          roleTranslations: {
            select: { name: true },
          },
        },
      },
      student: {
        select: {
          id: true,
          dateOfBirth: true,
          notes: true,
        },
      },
      provider: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  emailEvent.emit("confirmEmail", { to: email, otp });

  return createdUser;
};

export const loginService = async ({ email, password }) => {
  const user = await DBService.findFirst({
    model: "user",
    where: { email },
    include: {
      role: {
        select: {
          id: true,
          roleTranslations: {
            select: { name: true },
          },
        },
      },
      teacher: true,
      student: true,
    },
  });

  if (!user) {
    const error = new Error("INVALID_CREDENTIALS");
    error.cause = 400;
    throw error;
  }

  if (!user.confirmEmail) {
    const error = new Error("ACCOUNT_NOT_VERIFIED");
    error.cause = 403;
    throw error;
  }

  const isPasswordValid = await compareHash({
    plainText: password,
    hashValue: user.password,
  });

  if (!isPasswordValid) {
    const error = new Error("INVALID_CREDENTIALS");
    error.cause = 400;
    throw error;
  }

  const credentials = await generateLoginCredentials({ user });
  return { credentials };
};

export const confirmEmailService = async ({ email, otp }) => {
  const user = await DBService.findFirst({
    model: "user",
    where: {
      email,
      confirmEmail: false,
    },
  });

  if (!user) {
    const error = new Error("ACCOUNT_ALREADY_VERIFIED_OR_NOT_FOUND");
    error.cause = 400;
    throw error;
  }

  const cachedOtp = await getCache({ key: `email:${email}:otp` });

  if (!cachedOtp) {
    const error = new Error("INVALID_OTP");
    error.cause = 400;
    throw error;
  }

  const isOtpValid = await compareHash({
    plainText: otp,
    hashValue: cachedOtp,
  });

  if (!isOtpValid) {
    const error = new Error("INVALID_OTP");
    error.cause = 400;
    throw error;
  }

  await DBService.updateOne({
    model: "user",
    where: { email },
    data: {
      confirmEmail: true,
      status: userStatusEnum.ACTIVE,
    },
  });

  return { verified: true };
};

export const getNewCredentialsService = async (user) => {
  const credentials = await generateLoginCredentials({ user });
  return { credentials };
};
