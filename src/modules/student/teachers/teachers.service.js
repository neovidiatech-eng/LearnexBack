import * as db from "../../../db/db.service.js";
export const getAllTeachersService = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  subject,
} = {}) => {
  const where = {
    ...(status ? { user: { status } } : {}),
    ...(subject ? { subject: { contains: subject, mode: "insensitive" } } : {}),
    ...(search
      ? {
        OR: [
          { subject: { contains: search, mode: "insensitive" } },
          {
            user: {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      }
      : {}),
  };

  const select = {
    id: true,
    subject: true,
    bio: true,
    avgRating: true,
    reviewsCount: true,
    totalCoursesCount: true,
    experienceYears: true,
    user: {
      select: {
        id: true,
        fullName: true,
        profilePhoto: true,
      },
    },
  };

  const result = await db.findManyWithPaginationAndCount({
    model: "teacher",
    where,
    page,
    limit,
    orderBy: { createdAt: "desc" },
    select,
  });

  return {
    teachers: result.items,
    pagination: result.pagination,
  };
};
export const getTeacherByIdService = async (teacherId) => {
  const select = {
    id: true,
    subject: true,
    avgRating: true,
    totalStudentsCount: true,
    totalCoursesCount: true,
    experienceYears: true,
    bio: true,
    linkedinUrl: true,
    cvUrl: true,
    introVideoUrl: true,
    createdAt: true,
    courses: {
      where: { status: "APPROVED" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        totalHours: true,
        wallPaper: true,
        status: true,
        createdAt: true,
      },
    },
    user: {
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        country: true,
        status: true,
        profilePhoto: true,
        courses: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            thumbnail: true,
            originalPrice: true,
            salePrice: true,
            durationHours: true,
            totalLessonsCount: true,
            translations: true,
          },
        },
      },
    },
  };
  const teacher = await db.findFirst({
    model: "teacher",
    where: { id: teacherId },
    select,
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return teacher;
};

// export const addTeacherReviewService = async (userId, teacherId, body) => {
//   const { rating, comment, bookingId } = body;

//   const teacher = await db.findFirst({
//     model: "teacher",
//     where: { id: teacherId },
//   });

//   if (!teacher) {
//     const error = new Error("TEACHER_NOT_FOUND");
//     error.cause = 404;
//     throw error;
//   }

//   if (teacher.userId === userId) {
//     const error = new Error("CANNOT_REVIEW_YOURSELF");
//     error.cause = 400;
//     throw error;
//   }

//   const review = await db.upsertOne({
//     model: "teacherReview",
//     where: {
//       studentId_teacherId: {
//         studentId: userId,
//         teacherId,
//       },
//     },
//     update: {
//       rating: Number(rating),
//       comment,
//       ...(bookingId && { bookingId }),
//     },
//     create: {
//       studentId: userId,
//       teacherId,
//       rating: Number(rating),
//       comment,
//       bookingId: bookingId || null,
//       isHidden: false,
//     },
//   });



// const { avgRating, reviewsCount } = await recalculateReview({
//   model: "teacherReview",
//   where: { teacherId, isHidden: false },
//   parentModel: "teacher",
//   parentId: teacherId,
// });

//   return { review, avgRating, reviewsCount };
// };
