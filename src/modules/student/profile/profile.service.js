import * as db from "../../../db/db.service.js";
import { deleteFile, deleteFiles } from "../../../utils/multer/file.utils.js";
import {
  decryptEncription,
  generateEncryption,
} from "../../../utils/security/encryption.security.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
export const getProfileService = async (userId) => {
  const student = await db.findFirst({
    model: "student",
    where: { userId },
    select: {
      dateOfBirth: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profilePhoto: true,
          coverPhoto: true,
          status: true,
        },
      },
    },
  });
  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  if (student.user?.phone) {
    student.user.phone = await decryptEncription({
      cipherText: student.user.phone,
    });
  }
  return student;
};

export const updateProfileService = async (userId, body) => {
  const { fullName, email, phone } = body;
  const student = await db.findFirst({
    model: "student",
    where: { userId },
    include: { user: true },
  });
  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  if (email && email.toLowerCase().trim() !== student.user.email) {
    const emailExist = await db.findFirst({
      model: "user",
      where: { email: email.toLowerCase().trim(), id: { not: userId } },
    });
    if (emailExist) {
      const error = new Error("EMAIL_ALREADY_EXISTS");
      error.cause = 409;
      throw error;
    }
  }
  const updatedStudent = await db.updateOne({
    model: "student",
    where: { id: student.id },
    data: {
      user: {
        update: {
          ...(fullName !== undefined && { fullName: fullName.trim() }),
          ...(email !== undefined && { email: email.toLowerCase().trim() }),
          ...(phone !== undefined && {
            phone: await generateEncryption({ plainText: phone }),
          }),
        },
      },
    },
    select: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });
  return updatedStudent;
};

export const changePasswordService = async (userId, body) => {
  const { oldPassword, password } = body;
  const student = await db.findFirst({
    model: "student",
    where: { userId },
    include: { user: true },
  });
  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  if (
    !(await compareHash({
      plainText: oldPassword,
      hashValue: student.user.password,
    }))
  ) {
    const error = new Error("INVALID_OLD_PASSWORD");
    error.cause = 400;
    throw error;
  }
  const updatedStudent = await db.updateOne({
    model: "student",
    where: { id: student.id },
    data: {
      user: {
        update: {
          ...(password !== undefined && { password:await generateHash({plainText:password}) }),
         
        },
      },
    },
   
  });
  return updatedStudent;
};
export const updateImageProfileService = async (userId, reqFiles) => {
  const user = await db.findFirst({
    model: "user",
    where: { id: userId },
    select: {
      id: true,
      profilePhoto: true,
      coverPhoto: true,
    },
  });
  if (!user) {
    const error = new Error("USER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  const newCoverPhoto = reqFiles.coverPhoto?.[0].relativeDestination;
  const newProfilePhoto = reqFiles.profilePhoto?.[0].relativeDestination;
  const updatedUser = await db.updateOne({
    model: "user",
    where: { id: userId },
    data: {
      ...(newCoverPhoto && { coverPhoto: newCoverPhoto }),
      ...(newProfilePhoto && { profilePhoto: newProfilePhoto }),
    },
    select: {
      id: true,
      coverPhoto: true,
      profilePhoto: true,
    },
  });
  if (newCoverPhoto && user.coverPhoto) {
    deleteFile(user.coverPhoto);
  }
  if (newProfilePhoto && user.profilePhoto) {
    deleteFile(user.profilePhoto);
  }
  return updatedUser;
};

export const deleteProfileService = async (userId) => {
  const student = await db.findFirst({
    model: "student",
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          profilePhoto: true,
          coverPhoto: true,
        },
      },
    },
  });

  if (!student) {
    const error = new Error("STUDENT_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const filesToDelete = [];
  if (student.user?.profilePhoto) filesToDelete.push(student.user.profilePhoto);
  if (student.user?.coverPhoto) filesToDelete.push(student.user.coverPhoto);
  deleteFiles(filesToDelete);

  await db.deleteOne({
    model: "user",
    where: { id: userId },
  });

  return { success: true };
};
