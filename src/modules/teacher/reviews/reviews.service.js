import * as db from "../../../db/db.service.js";

export const getReviewsService = async (
  userId,
  page = 1,
  limit = 10,
  search = "",
  locale = "en",
) => {
 const where = {
   ...(search
     ? {
         OR: [{ rating: { contains: search, mode: "insensitive" } }],
       }
         : {}),
     userId
 };
    const reviews = await db.findManyWithPaginationAndCount({
      model: "teacherReview",
      where,
      limit,
      page,
      orderBy: { createdAt: "desc" },
    });
  return reviews;
};

