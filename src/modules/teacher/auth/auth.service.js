import * as DBService from "../../../db/db.service.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hash.security.js";
import { generateEncryption } from "../../../utils/security/encryption.security.js";
import { generateLoginCredentials } from "../../../utils/security/token.security.js";
import { baseRoleEnum } from "../../../utils/Enums/role.enum.js";
import { userStatusEnum } from "../../../utils/Enums/userStatus.enum.js";
import { customAlphabet } from "nanoid";
import { emailEvent } from "../../../utils/events/email.event.js";
import { deleteCache, getCache, setCache } from "../../../db/redis.service.js";

export const teacherSignupService = async (body, reqFiles) => {
  const {
    fullName,
    email,
    password,
    phone,
    experienceYears,
    linkedinUrl,
    subject,
    headline,
    bio,
    locale = "ar",
  } = body;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await DBService.findFirst({
    model: "user",
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("EMAIL_ALREADY_EXISTS");
    error.cause = 409;
    throw error;
  }

  const cvUrl = reqFiles?.cvUrl?.[0]?.relativeDestination || null;
  const introVideoUrl =
    reqFiles?.introVideoUrl?.[0]?.relativeDestination || null;

  const hashPassword = await generateHash({ plainText: password });
  const encPhone = phone
    ? await generateEncryption({ plainText: phone.trim() })
    : null;

  const role = await DBService.findFirst({
    model: "role",
    where: {
      OR: [
        { slug: baseRoleEnum.TEACHER },
        { roleTranslations: { some: { name: baseRoleEnum.TEACHER } } },
      ],
    },
    select: { id: true },
  });

  const createdTeacher = await DBService.create({
    model: "teacher",
    data: {
      subject: subject.trim(),
      headline: headline ? headline.trim() : null,
      bio: bio ? bio.trim() : null,
      experienceYears: Number(experienceYears) || 0,
      cvUrl,
      introVideoUrl,
      linkedinUrl: linkedinUrl || null,
      user: {
        create: {
          email: normalizedEmail,
          fullName: fullName.trim(),
          password: hashPassword,
          phone: encPhone,
          roleId: role?.id || null,
          status: userStatusEnum.PENDING_REVIEW,
          confirmEmail: false,
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          status: true,
          role: {
            select: {
              id: true,
              roleTranslations: {
                select: { name: true },
              },
            },
          },
          createdAt: true,
        },
      },
    },
  });

  return createdTeacher;
};

export const teacherLoginService = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await DBService.findFirst({
    model: "user",
    where: { email: normalizedEmail },
    include: {
      role: {
        select: {
          id: true,
          roleTranslations: {
            select: { name: true },
          },
        },
      },
      teacher: {
        select: {
          id: true,
          subject: true,
          experienceYears: true,
          headline: true,
          bio: true,
          isAvailable: true,
          avgRating: true,
          totalStudentsCount: true,
          reviewsCount: true,
          totalCoursesCount: true,
          cvUrl: true,
          referralCode: true,
          linkedinUrl: true,
          sessionPrice50Min: true,
          currency: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user || !user.teacher) {
    const error = new Error("INVALID_CREDENTIALS");
    error.cause = 400;
    throw error;
  }

  if (user.status === userStatusEnum.PENDING_REVIEW) {
    const error = new Error("ACCOUNT_UNDER_REVIEW");
    error.cause = 403;
    throw error;
  }

  if (user.status !== userStatusEnum.ACTIVE) {
    const error = new Error("ACCOUNT_NOT_ACTIVE");
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

export const getNewCredentialsService = async (user) => {
  const credentials = await generateLoginCredentials({ user });
  return { credentials };
};

export const forgotPasswordService = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await DBService.findFirst({
    model: "user",
    where: { email: normalizedEmail },
  });
  if (!user) {
    const error = new Error("ACCOUNT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  const otp = customAlphabet("0123456789", 6)();
  const hashOtp = await generateHash({ plainText: otp });
  await setCache({
    key: `forgotPassword:${normalizedEmail}:otp`,
    value: hashOtp,
    ttlInSeconds: 60 * 10,
  });
  emailEvent.emit("sendForgotPassword", {
    to: normalizedEmail,
    otp,
    title: "Forgot-Password",
  });
  return { email: normalizedEmail };
};

export const resetPasswordService = async ({ email, otp, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await DBService.findFirst({
    model: "user",
    where: { email: normalizedEmail },
  });
  if (!user) {
    const error = new Error("ACCOUNT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  const cachedOtp = await getCache({
    key: `forgotPassword:${normalizedEmail}:otp`,
  });
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
  const hashPassword = await generateHash({ plainText: password });
  await DBService.updateOne({
    model: "user",
    where: { id: user.id },
    data: {
      password: hashPassword,
    },
  });
  await deleteCache(`forgotPassword:${normalizedEmail}:otp`);
  return { success: true };
};
