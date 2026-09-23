import * as DBService from "../../../db/db.service.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hash.security.js";
import { generateEncryption } from "../../../utils/security/encryption.security.js";
import { generateLoginCredentials } from "../../../utils/security/token.security.js";
import { baseRoleEnum } from "../../../utils/Enums/role.enum.js";
import { userStatusEnum } from "../../../utils/Enums/userStatus.enum.js";

export const teacherSignupService = async (body, file) => {
  const {
    fullName,
    firstName,
    lastName,
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

  const cvUrl = file ? file.relativeDestination : null;

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

  const resolvedFullName =
    fullName?.trim() ||
    (firstName && lastName
      ? `${firstName} ${lastName}`.trim()
      : firstName || lastName || "Teacher");

  const createdTeacher = await DBService.create({
    model: "teacher",
    data: {
      experienceYears: Number(experienceYears) || 0,
      cvUrl,
      linkedinUrl: linkedinUrl || null,
      user: {
        create: {
          email: normalizedEmail,
          fullName: resolvedFullName,
          password: hashPassword,
          phone: encPhone,
          roleId: role?.id || null,
          status: userStatusEnum.PENDING_REVIEW,
          confirmEmail: false,
        },
      },
      translations: {
        create: [
          {
            locale: locale || "ar",
            subject: subject.trim(),
            headline: headline ? headline.trim() : null,
            bio: bio ? bio.trim() : null,
          },
        ],
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
      translations: {
        select: {
          locale: true,
          subject: true,
          headline: true,
          bio: true,
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
        include: {
          translations: true,
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
