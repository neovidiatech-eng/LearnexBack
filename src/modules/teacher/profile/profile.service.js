import * as db from "../../../db/db.service.js";
import { deleteFile, deleteFiles } from "../../../utils/multer/file.utils.js";
import {
  decryptEncription,
  generateEncryption,
} from "../../../utils/security/encryption.security.js";

export const toggleVisibilityService = async (userId, isAvailable) => {
  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  let newStatus;
  if (isAvailable !== undefined) {
    if (typeof isAvailable === "string") {
      newStatus = isAvailable.toLowerCase() === "true";
    } else {
      newStatus = Boolean(isAvailable);
    }
  } else {
    newStatus = !teacher.isAvailable;
  }

  const updatedTeacher = await db.updateOne({
    model: "teacher",
    where: { id: teacher.id },
    data: {
      isAvailable: newStatus,
    },
    select: {
      id: true,
      isAvailable: true,
      updatedAt: true,
    },
  });

  return updatedTeacher;
};

export const getProfileService = async (userId) => {
  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
    select: {
      id: true,
      subject: true,
      headline: true,
      bio: true,
      experienceYears: true,
      cvUrl: true,
      linkedinUrl: true,
      isAvailable: true,
      sessionPrice50Min: true,
      currency: true,
      avgRating: true,
      totalStudentsCount: true,
      reviewsCount: true,
      totalCoursesCount: true,
      referralCode: true,
      certificates: {
        select: {
          id: true,
          title: true,
          issuer: true,
          issueDate: true,
          fileUrl: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          country: true,
          profilePhoto: true,
          coverPhoto: true,
        },
      },
    },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (teacher.user?.phone) {
    teacher.user.phone = await decryptEncription({
      cipherText: teacher.user.phone,
    });
  }

  return teacher;
};

export const updateProfileService = async (userId, body) => {
  const {
    fullName,
    email,
    phone,
    country,
    subject,
    headline,
    bio,
    experienceYears,
    linkedinUrl,
  } = body;

  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
    include: { user: true },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (email && email.toLowerCase().trim() !== teacher.user.email) {
    const emailExist = await db.findFirst({
      model: "user",
      where: {
        email: email.toLowerCase().trim(),
        id: { not: userId },
      },
    });

    if (emailExist) {
      const error = new Error("EMAIL_ALREADY_EXISTS");
      error.cause = 409;
      throw error;
    }
  }

  const updatedData = await db.updateOne({
    model: "teacher",
    where: { id: teacher.id },
    data: {
      ...(fullName !== undefined && { fullName: fullName.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(phone !== undefined && { phone }),
      ...(country !== undefined && { country }),
      ...(subject !== undefined && { subject }),
      ...(headline !== undefined && { headline }),
      ...(bio !== undefined && { bio }),
      ...(experienceYears !== undefined && { experienceYears }),
      ...(linkedinUrl !== undefined && { linkedinUrl }),
    },
    select: {
      id: true,
      subject: true,
      headline: true,
      bio: true,
      experienceYears: true,
      isAvailable: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          country: true,
        },
      },
    },
  });

  return updatedData;
};

export const updateSessionPriceService = async (userId, body) => {
  const { sessionPrice50Min } = body;

  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
    include: { user: true },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }



  const updatedData = await db.updateOne({
    model: "teacher",
    where: { id: teacher.id },
    data: {
      ...(sessionPrice50Min !== undefined && { sessionPrice50Min }),
    },
    select: {
      id: true,
      userId: true,
      sessionPrice50Min: true,
      currency:true,
    },
  });

  return updatedData;
};

export const updateImageProfileService = async (userId, reqFiles) => {
  const user = await db.findFirst({
    model: "user",
    where: { id: userId },
    select: { id: true, profilePhoto: true, coverPhoto: true },
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
      profilePhoto: true,
      coverPhoto: true,
    },
  });
  if (newCoverPhoto&& user.coverPhoto) {
    deleteFile(user.coverPhoto);
  }
  if (newProfilePhoto&& user.profilePhoto) {
    deleteFile(user.profilePhoto);
  }
  return updatedUser;
};


export const deleteProfileService = async (userId) => {
  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId }, 
    include: {
      user: {
        select: {
          id: true,
          profilePhoto: true,
          coverPhoto: true,
        },
      },
      certificates: {
        select: {
          fileUrl: true,
        },
      },
      courses: {
        select: {
          wallPaper: true,
          sections: {
            select: {
              items: {
                select: {
                  materialLink: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const filesToDelete = [];

  if (teacher.user?.profilePhoto) filesToDelete.push(teacher.user.profilePhoto);
  if (teacher.user?.coverPhoto) filesToDelete.push(teacher.user.coverPhoto);

  if (teacher.cvUrl) filesToDelete.push(teacher.cvUrl);

  if (teacher.certificates?.length > 0) {
    teacher.certificates.forEach((cert) => {
      if (cert.fileUrl) filesToDelete.push(cert.fileUrl);
    });
  }

  if (teacher.courses?.length > 0) {
    teacher.courses.forEach((course) => {
      if (course.wallPaper) filesToDelete.push(course.wallPaper);
      
      course.sections?.forEach((section) => {
        section.items?.forEach((item) => {
          if (item.materialLink) filesToDelete.push(item.materialLink);
        });
      });
    });
  }

  deleteFiles(filesToDelete);

  await db.deleteOne({
    model: "user",
    where: { id: teacher.userId },
  });

  return { success: true };
};
