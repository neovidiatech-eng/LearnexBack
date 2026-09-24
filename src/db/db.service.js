import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getClient = (model, prismaClient = prisma) => {
  const client = prismaClient[model];
  if (!client) {
    throw new Error("MODEL_NOT_FOUND");
  }
  return client;
};

/**
 * Creates a db-style wrapper around a Prisma interactive transaction client.
 * This lets controllers use tx.findFirst(), tx.create(), tx.updateOne(), etc.
 */
const createTxWrapper = (prismaClient) => ({
  findMany: ({ model, where = {}, filter, include, select, orderBy, take, skip }) =>
    getClient(model, prismaClient).findMany({
      where: where || filter || {},
      ...(orderBy ? { orderBy } : {}),
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
      ...(take !== undefined ? { take } : {}),
      ...(skip !== undefined ? { skip } : {}),
    }),

  findOne: ({ model, where, filter, include, select }) =>
    getClient(model, prismaClient).findUnique({
      where: where || filter,
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    }),

  findFirst: ({ model, where, filter, include, select }) =>
    getClient(model, prismaClient).findFirst({
      where: where || filter,
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    }),

  create: ({ model, data, include, select }) =>
    getClient(model, prismaClient).create({
      data,
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    }),

  createMany: ({ model, data, include, select }) =>
    getClient(model, prismaClient).createMany({
      data,
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    }),

  updateOne: ({ model, where, filter, data, include, select }) =>
    getClient(model, prismaClient).update({
      where: where || filter,
      data,
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    }),

  updateMany: ({ model, where, filter, data }) =>
    getClient(model, prismaClient).updateMany({ where: where || filter, data }),

  upsertOne: ({ model, where, filter, update, create, include, select }) =>
    getClient(model, prismaClient).upsert({
      where: where || filter,
      update,
      create,
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    }),

  deleteMany: ({ model, where = {}, filter }) =>
    getClient(model, prismaClient).deleteMany({ where: where || filter || {} }),

  deleteOne: ({ model, where = {}, filter, include, select }) =>
    getClient(model, prismaClient).delete({
      where: where || filter || {},
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    }),

  count: ({ model, where = {}, filter }) =>
    getClient(model, prismaClient).count({ where: where || filter || {} }),
});

/**
 * Supports two calling styles:
 *   1. Array  → db.transaction([db.create(...), db.updateOne(...)])
 *   2. Callback → db.transaction(async (tx) => { await tx.create(...); })
 */
export const transaction = async (actionsOrCallback) => {
  if (typeof actionsOrCallback === "function") {
    return await prisma.$transaction(async (prismaClient) => {
      const tx = createTxWrapper(prismaClient);
      return await actionsOrCallback(tx);
    });
  }
  return await prisma.$transaction(actionsOrCallback);
};

export const findMany = ({
  model,
  where = {},
  filter,
  include,
  select,
  orderBy,
  take,
  skip,
}) => {
  return getClient(model).findMany({
    where: where || filter || {},
    ...(include ? { include } : {}),
    ...(select ? { select } : {}),
    ...(orderBy ? { orderBy } : {}),
    ...(take !== undefined ? { take } : {}),
    ...(skip !== undefined ? { skip } : {}),
  });
};

export const findManyWithPaginationAndCount = async ({
  model,
  where = {},
  filter,
  page = 1,
  limit = 20,
  orderBy = { createdAt: "desc" },
  select,
  include,
}) => {
  const client = getClient(model);
  const targetWhere = where || filter || {};

  const take = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const p = Math.max(Number(page) || 1, 1);
  const skip = (p - 1) * take;

  const [items, totalItems] = await Promise.all([
    client.findMany({
      where: targetWhere,
      take,
      skip,
      orderBy,
      ...(select ? { select } : {}),
      ...(include ? { include } : {}),
    }),
    client.count({ where: targetWhere }),
  ]);

  const totalPages = Math.ceil(totalItems / take);
  const hasNextPage = p < totalPages;

  return {
    items,
    pagination: { page: p, limit: take, totalItems, totalPages, hasNextPage },
  };
};
export const queryRaw = (query,...values)=>{
    return prisma.$queryRaw(query,...values);
}

export const create = ({ model, data, include, select }) => {
  return getClient(model).create({
    data,
    ...(include ? { include } : {}),
    ...(select ? { select } : {}),
  });
};

export const createMany = ({ model, data, include, select }) => {
  return getClient(model).createMany({
    data,
    ...(include ? { include } : {}),
    ...(select ? { select } : {}),
  });
};

export const findOne = ({ model, where, filter, include, select }) => {
  return getClient(model).findUnique({
    where: where || filter,
    ...(include ? { include } : {}),
    ...(select ? { select } : {}),
  });
};

export const findFirst = ({ model, where, filter, include, select }) => {
  return getClient(model).findFirst({
    where: where || filter,
    ...(include ? { include } : {}),
    ...(select ? { select } : {}),
  });
};

export const updateOne = ({ model, where, filter, data, include, select }) => {
  return getClient(model).update({
    where: where || filter,
    data,
    ...(include ? { include } : {}),
    ...(select ? { select } : {}),
  });
};

export const updateMany = ({ model, where, filter, data }) => {
  return getClient(model).updateMany({ where: where || filter, data });
};

export const upsertOne = ({
  model,
  where,
  filter,
  update,
  create,
  include,
  select,
}) => {
  return getClient(model).upsert({
    where: where || filter,
    update,
    create,
    ...(include ? { include } : {}),
    ...(select ? { select } : {}),
  });
};

export const deleteMany = ({ model, where = {}, filter }) => {
  return getClient(model).deleteMany({ where: where || filter || {} });
};

export const deleteOne = ({ model, where = {}, filter, include, select }) => {
  return getClient(model).delete({
    where: where || filter || {},
    ...(include ? { include } : {}),
    ...(select ? { select } : {}),
  });
};

export const count = ({ model, where = {}, filter }) => {
  return getClient(model).count({ where: where || filter || {} });
};

export const groupBy = ({
  model,
  by,
  where,
  filter,
  _count,
  _sum,
  _avg,
  _min,
  _max,
}) => {
  return getClient(model).groupBy({
    by,
    ...(where || filter ? { where: where || filter } : {}),
    ...(_count ? { _count } : {}),
    ...(_sum ? { _sum } : {}),
    ...(_avg ? { _avg } : {}),
    ...(_min ? { _min } : {}),
    ...(_max ? { _max } : {}),
  });
};

export default {
  getClient,
  createTxWrapper,
  transaction,
  findMany,
  findManyWithPaginationAndCount,
  create,
  createMany,
  findOne,
  findFirst,
  updateOne,
  updateMany,
  upsertOne,
  deleteMany,
  deleteOne,
  count,
  groupBy,
  queryRaw
};
