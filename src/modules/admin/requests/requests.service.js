import * as db from "../../../db/db.service.js";
import {
  requestReferenceModelEnum,
  requestStatusEnum,
  requestTypeEnum,
} from "../../../utils/Enums/request.enum.js";
import { CertificateStatus } from "../../../utils/Enums/teacherCertificate.enum.js";
import { teacherCourseStatusEnum } from "../../../utils/Enums/teacherCourse.enum.js";
import { userStatusEnum } from "../../../utils/Enums/userStatus.enum.js";

export const getRequestStatsService = async (query = {}) => {
  const { tab } = query;
  const where = tab && tab !== "all" ? { tab } : {};
  const [total, pending, approved, rejected] = await Promise.all([
    db.count({ model: "systemRequest", where }),
    db.count({
      model: "systemRequest",
      where: { ...where, status: requestStatusEnum.PENDING },
    }),
    db.count({
      model: "systemRequest",
      where: { ...where, status: requestStatusEnum.APPROVED },
    }),
    db.count({
      model: "systemRequest",
      where: { ...where, status: requestStatusEnum.REJECTED },
    }),
  ]);
  return { total, pending, approved, rejected };
};

export const getAllRequestsService = async (query = {}) => {
  const {
    tab,
    type,
    priority,
    status,
    search = "",
    page = 1,
    limit = 10,
  } = query;
  const where = {
    ...(tab && tab !== "all" ? { tab } : {}),
    ...(type ? { type } : {}),
    ...(priority ? { priority } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            {
              requester: {
                fullName: { contains: search, mode: "insensitive" },
              },
            },
            {
              requester: {
                email: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const result = await db.findManyWithPaginationAndCount({
    model: "systemRequest",
    where,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    orderBy: { createdAt: "desc" },
    include: {
      requester: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });
  return {
    requests: result.items,
    pagination: result.pagination,
  };
};

export const getRequestByIdService = async (requestId) => {
  const request = await db.findOne({
    model: "systemRequest",
    where: { id: requestId },
    include: {
      requester: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  if (!request) {
    const error = new Error("REQUEST_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  return request;
};

export const approveRequestService = async (requestId) => {
  const request = await db.findOne({
    model: "systemRequest",
    where: { id: requestId },
  });

  if (!request) {
    const error = new Error("REQUEST_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (request.status !== requestStatusEnum.PENDING) {
    const error = new Error("REQUEST_ALREADY_PROCESSED");
    error.cause = 400;
    throw error;
  }

  if (
    request.type === requestTypeEnum.BECOME_INSTRUCTOR &&
    request.referenceModel === requestReferenceModelEnum.TEACHER
  ) {
    const teacher = await db.findFirst({
      model: "teacher",
      where: { id: request.referenceId },
      select: { id: true },
    });

    if (!teacher) {
      const error = new Error("TEACHER_NOT_FOUND");
      error.cause = 404;
      throw error;
    }

    await db.updateOne({
      model: "teacher",
      where: { id: teacher.id },
      data: {
        rejectionReason: null,
        user: {
          update: {
            status: userStatusEnum.ACTIVE,
            confirmEmail: true,
          },
        },
      },
    });
  }

  if (
    request.type === requestTypeEnum.COURSE_APPROVAL &&
    request.referenceModel === requestReferenceModelEnum.TEACHER_COURSE
  ) {
    const course = await db.findFirst({
      model: "teacherCourse",
      where: { id: request.referenceId },
      select: { id: true },
    });

    if (!course) {
      const error = new Error("TEACHER_COURSE_NOT_FOUND");
      error.cause = 404;
      throw error;
    }

    await db.updateOne({
      model: "teacherCourse",
      where: { id: course.id },
      data: {
        status: teacherCourseStatusEnum.APPROVED,
        rejectionReason: null,
      },
    });
  }

  if (
    request.type === requestTypeEnum.VERIFICATION &&
    request.referenceModel === requestReferenceModelEnum.TEACHER_CERTIFICATE
  ) {
    const certificate = await db.findFirst({
      model: "teacherCertificate",
      where: { id: request.referenceId },
      select: { id: true },
    });

    if (!certificate) {
      const error = new Error("TEACHER_CERTIFICATE_NOT_FOUND");
      error.cause = 404;
      throw error;
    }

    await db.updateOne({
      model: "teacherCertificate",
      where: { id: certificate.id },
      data: {
        status: CertificateStatus.VERIFIED,
        rejectionReason: null,
      },
    });
  }
  //Student

  return await db.updateOne({
    model: "systemRequest",
    where: { id: requestId },
    data: {
      status: requestStatusEnum.APPROVED,
    },
  });
};

export const rejectRequestService = async (requestId, body = {}) => {
  const { rejectionReason } = body;

  const request = await db.findOne({
    model: "systemRequest",
    where: { id: requestId },
  });

  if (!request) {
    const error = new Error("REQUEST_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (request.status !== requestStatusEnum.PENDING) {
    const error = new Error("REQUEST_ALREADY_PROCESSED");
    error.cause = 400;
    throw error;
  }

  if (
    request.type === requestTypeEnum.BECOME_INSTRUCTOR &&
    request.referenceModel === requestReferenceModelEnum.TEACHER
  ) {
    const teacher = await db.findFirst({
      model: "teacher",
      where: { id: request.referenceId },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    if (!teacher) {
      const error = new Error("TEACHER_NOT_FOUND");
      error.cause = 404;
      throw error;
    }
    const previousDetails =
      request.details &&
      typeof request.details === "object" &&
      !Array.isArray(request.details)
        ? request.details
        : {};

    const rejectedRequest = await db.updateOne({
      model: "systemRequest",
      where: { id: requestId },
      data: {
        status: requestStatusEnum.REJECTED,
        rejectionReason: rejectionReason || null,
        details: {
          ...previousDetails,
          requesterSnapshot: {
            userId: teacher.userId,
            teacherId: teacher.id,
            fullName: teacher.user?.fullName ?? null,
            email: teacher.user?.email ?? null,
            profilePhoto: teacher.user?.profilePhoto ?? null,
          },
        },
      },
    });
    await db.updateOne({
      model: "teacher",
      where: { id: teacher.id },
      data: {
        rejectionReason: null,
        user: {
          update: {
            status: userStatusEnum.SUSPENDED,
            confirmEmail: true,
          },
        },
      },
    });
    await db.deleteOne({
      model: "user",
      where: { id: teacher.userId },
    });
    return rejectedRequest;
  }

  if (
    request.type === requestTypeEnum.COURSE_APPROVAL &&
    request.referenceModel === requestReferenceModelEnum.TEACHER_COURSE
  ) {
    const course = await db.findFirst({
      model: "teacherCourse",
      where: { id: request.referenceId },
      select: { id: true },
    });

    if (!course) {
      const error = new Error("TEACHER_COURSE_NOT_FOUND");
      error.cause = 404;
      throw error;
    }

    await db.updateOne({
      model: "teacherCourse",
      where: { id: course.id },
      data: {
        status: teacherCourseStatusEnum.REJECTED,
        rejectionReason: null,
      },
    });
  }

  if (
    request.type === requestTypeEnum.VERIFICATION &&
    request.referenceModel === requestReferenceModelEnum.TEACHER_CERTIFICATE
  ) {
    const certificate = await db.findFirst({
      model: "teacherCertificate",
      where: { id: request.referenceId },
      select: { id: true },
    });

    if (!certificate) {
      const error = new Error("TEACHER_CERTIFICATE_NOT_FOUND");
      error.cause = 404;
      throw error;
    }

    await db.updateOne({
      model: "teacherCertificate",
      where: { id: certificate.id },
      data: {
        status: CertificateStatus.REJECTED,
        rejectionReason: null,
      },
    });
  }
  return await db.updateOne({
    model: "systemRequest",
    where: { id: requestId },
    data: {
      status: requestStatusEnum.REJECTED,
      rejectionReason,
    },
  });
};
