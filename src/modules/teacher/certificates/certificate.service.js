import * as db from "../../../db/db.service.js";
import { deleteFile } from "../../../utils/multer/file.utils.js";
import { emailEvent } from "../../../utils/events/email.event.js";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

export const createCertificateService = async (userId, body, file) => {
  const { type, title, issuer, issueYear } = body;
  if (!file) {
    const error = new Error("FILE_IS_REQUIRED");
    error.cause = 400;
    throw error;
  }
  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
        },
      },
    },
  });
  if (!teacher) {
    if (file.relativeDestination) deleteFile(file.relativeDestination);
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  const fileType = file.mimetype === "application/pdf" ? "PDF" : "IMAGE";
  const fileSize = formatFileSize(file.size);
  const certificate = await db.create({
    model: "teacherCertificate",
    data: {
      teacherId: teacher.id,
      type,
      title,
      issuer,
      issueYear: Number(issueYear),
      fileUrl: file.relativeDestination,
      fileType,
      fileSize,
      status: "PENDING",
    },
  });

  if (teacher.user?.email) {
    emailEvent.emit("certificateUploaded", {
      to: teacher.user.email,
      name: teacher.user.fullName,
      certificateTitle: certificate.title,
      issuer: certificate.issuer,
    });
  }

  return certificate;
};


export const getCertificateByIdService = async (userId, certificateId) => {
  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
  });
  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const certificate = await db.findFirst({
    model: "teacherCertificate",
    where: {
      id: certificateId,
      teacherId: teacher.id,
    },
  });

  if (!certificate) {
    const error = new Error("CERTIFICATE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return certificate;
};

export const getCertificatesService = async (userId, query = {}) => {
  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
  });
  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const { type, status } = query;
  const where = {
    teacherId: teacher.id,
    ...(type && { type }),
    ...(status && { status }),
  };

  const certificates = await db.findMany({
    model: "teacherCertificate",
    where,
    orderBy: { createdAt: "desc" },
  });
  
  return certificates;
};

export const deleteCertificateService = async (userId, certificateId) => {
  const teacher = await db.findFirst({
    model: "teacher",
    where: { userId },
  });
  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const certificate = await db.findFirst({
    model: "teacherCertificate",
    where: {
      id: certificateId,
      teacherId: teacher.id,
    },
  });

  if (!certificate) {
    const error = new Error("CERTIFICATE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (certificate.fileUrl) {
    deleteFile(certificate.fileUrl);
  }

  await db.deleteOne({
    model: "teacherCertificate",
    where: { id: certificate.id },
  });

  return { success: true };
};

