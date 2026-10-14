import * as db from "../../../db/db.service.js";
import {
  requestStatusEnum,
  requestTabEnum,
} from "../../../utils/Enums/request.enum.js";
export const getRequestStatsService = async (query = {}) => {
  const { tab } = query;
  const [total, pending, approved, rejected] = await Promise.all([
    db.count({ model: "systemRequest", where: { tab } }),
    db.count({
      model: "systemRequest",
      where: { tab, status: requestStatusEnum.PENDING },
    }),
    db.count({
      model: "systemRequest",
      where: { tab, status: requestStatusEnum.APPROVED },
    }),
    db.count({
      model: "systemRequest",
      where: { tab, status: requestStatusEnum.REJECTED },
    }),
  ]);
  return { total, pending, approved, rejected };
};

export const getAllRequestsService = async (query = {}) => {
  const {
    tab = requestTabEnum.STUDENT,
    type,
    priority,
    status,
    search = "",
    page = 1,
    limit = 10,
  } = query;
  const where = {
    tab,
    type,
    priority,
    status,
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
        where: { requestId },
    });

  if (!request) {
    const error = new Error("REQUEST_NOT_FOUND");
    error.cause = 404;
    throw error;
    }
    return request
};
export const approveRequestService = async (requestId) => {};
