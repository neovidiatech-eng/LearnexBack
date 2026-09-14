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
import { ROLES } from "../../utils/Permissions/permissions.js";

export const signupService = async (userData) => {
  const {
    email,
    fullName,
    firstName,
    lastName,
    password,
    phone,
    subject,
    experienceYears,
    bio,
    linkedinUrl,
    roleName = ROLES.STUDENT,
  } = userData;

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
  const encPhone = phone ? await generateEncryption({ plainText: phone }) : null;
  const otp = customAlphabet("0123456789", 6)();
  const confirmEmailOtp = await generateHash({ plainText: otp });

  const nameParts = fullName ? fullName.trim().split(/\s+/) : [];
  const userFirstName = firstName || nameParts[0] || "User";
  const userLastName = lastName || nameParts.slice(1).join(" ") || "Account";

  const role = await DBService.findFirst({
    model: "role",
    where: { name: roleName },
    select: { id: true },
  });

  const isTeacher = roleName === ROLES.TEACHER;

  const createdUser = await DBService.create({
    model: "user",
    data: {
      email,
      firstName: userFirstName,
      lastName: userLastName,
      password: hashPassword,
      phone: encPhone,
      roleId: role?.id || null,
      status: userStatusEnum.PENDING_VERIFICATION,
      confirmEmailOtp,
      ...(isTeacher
        ? {
            teacher: {
              create: {
                subject: subject || "General",
                experienceYears: Number(experienceYears) || 0,
                bio,
                linkedinUrl,
              },
            },
          }
        : {
            student: {
              create: {},
            },
          }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      teacher: isTeacher
        ? {
            select: {
              subject: true,
              experienceYears: true,
              bio: true,
              linkedinUrl: true,
            },
          }
        : false,
      student: !isTeacher
        ? {
            select: {
              id: true,
              dateOfBirth: true,
              notes: true,
            },
          }
        : false,
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
          name: true,
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
      confirmEmail: null,
      confirmEmailOtp: {
        not: null,
      },
    },
  });

  if (!user) {
    const error = new Error("ACCOUNT_ALREADY_VERIFIED_OR_NOT_FOUND");
    error.cause = 400;
    throw error;
  }

  const isOtpValid = await compareHash({
    plainText: otp,
    hashValue: user.confirmEmailOtp,
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
      confirmEmail: new Date(),
      confirmEmailOtp: null,
      status: userStatusEnum.ACTIVE,
    },
  });

  return { verified: true };
};

export const getNewCredentialsService = async (user) => {
  const credentials = await generateLoginCredentials({ user });
  return { credentials };
};
