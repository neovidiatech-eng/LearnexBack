import * as db from "../../../db/db.service.js";

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
    const teacher = await db.findFirst({ model: "teacher", where: { userId } })
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
        return certificate;

};
