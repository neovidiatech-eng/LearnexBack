import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

export async function seedReviews(prisma, students = [], teachers = [], courses = []) {
  console.log("🌱 Seeding reviews for courses and teachers...");

  // If students not supplied, fetch from DB
  let studentUsers = students;
  if (!studentUsers || studentUsers.length === 0) {
    studentUsers = await prisma.user.findMany({
      where: {
        student: { isNot: null },
      },
      include: {
        student: true,
      },
      take: 10,
    });
  }

  // If teachers not supplied, fetch from DB
  let teacherList = teachers;
  if (!teacherList || teacherList.length === 0) {
    teacherList = await prisma.teacher.findMany({
      include: {
        user: true,
      },
      take: 10,
    });
  }

  // If courses not supplied, fetch from DB
  let courseList = courses;
  if (!courseList || courseList.length === 0) {
    courseList = await prisma.course.findMany({
      take: 10,
    });
  }

  if (studentUsers.length === 0) {
    console.warn("⚠️ No students found to seed reviews.");
    return { courseReviews: [], teacherReviews: [] };
  }

  // Helper to extract teacher id
  const resolveTeacherId = (t) => (t.teacher ? t.teacher.id : t.id);

  // ═══════════════════════════════════════════════════════════════
  // 1. Seed Course Reviews (تقييمات الكورسات)
  // ═══════════════════════════════════════════════════════════════
  const courseReviewsData = [];

  if (courseList.length > 0) {
    // Course 0
    if (studentUsers[0] && courseList[0]) {
      courseReviewsData.push({
        studentId: studentUsers[0].id,
        courseId: courseList[0].id,
        rating: 5,
        comment: "One of the best programming courses I have ever taken! The explanations are clear and the projects are very practical.",
        isHidden: false,
      });
    }

    if (studentUsers[1] && courseList[0]) {
      courseReviewsData.push({
        studentId: studentUsers[1].id,
        courseId: courseList[0].id,
        rating: 5,
        comment: "دورة ممتازة وشاملة لكل ما يحتاجه مطور الويب، الشرح مبسط وسهل المتابعة والتطبيق العملي رائع جداً.",
        isHidden: false,
      });
    }

    if (studentUsers[2] && courseList[0]) {
      courseReviewsData.push({
        studentId: studentUsers[2].id,
        courseId: courseList[0].id,
        rating: 4,
        comment: "Great content and well-structured curriculum. Loved the real-world hands-on assignments.",
        isHidden: false,
      });
    }

    if (studentUsers[3] && courseList[0]) {
      courseReviewsData.push({
        studentId: studentUsers[3].id,
        courseId: courseList[0].id,
        rating: 5,
        comment: "شرح رائع وواضح، استفدت كثيراً من التطبيقات العملية والمشاريع المرفقة وأنصح به بشدة.",
        isHidden: false,
      });
    }

    // Course 1
    if (studentUsers[1] && courseList[1]) {
      courseReviewsData.push({
        studentId: studentUsers[1].id,
        courseId: courseList[1].id,
        rating: 5,
        comment: "Fantastic data science track! Helped me land my first data analyst interview with full confidence.",
        isHidden: false,
      });
    }

    if (studentUsers[0] && courseList[1]) {
      courseReviewsData.push({
        studentId: studentUsers[0].id,
        courseId: courseList[1].id,
        rating: 4,
        comment: "Very thorough walkthrough of python data science tools. The ML algorithms section was great.",
        isHidden: false,
      });
    }

    if (studentUsers[4] && courseList[1]) {
      courseReviewsData.push({
        studentId: studentUsers[4].id,
        courseId: courseList[1].id,
        rating: 4,
        comment: "محتوى علمي متميز وقوي، والتطبيقات على مكتبات الذكاء الاصطناعي كانت دقيقة وسهلة الاستيعاب.",
        isHidden: false,
      });
    }

    // Course 2
    if (studentUsers[2] && courseList[2]) {
      courseReviewsData.push({
        studentId: studentUsers[2].id,
        courseId: courseList[2].id,
        rating: 5,
        comment: "بناء تطبيقات الموبايل كان ممتعاً وسهلاً بفضل أسلوب المدرب المحترف والأمثلة الحية.",
        isHidden: false,
      });
    }

    if (studentUsers[3] && courseList[2]) {
      courseReviewsData.push({
        studentId: studentUsers[3].id,
        courseId: courseList[2].id,
        rating: 4,
        comment: "High quality production and clear step-by-step guidance for anyone starting mobile app dev.",
        isHidden: false,
      });
    }
  }

  const seededCourseReviews = [];
  for (const review of courseReviewsData) {
    const created = await prisma.courseReview.upsert({
      where: {
        studentId_courseId: {
          studentId: review.studentId,
          courseId: review.courseId,
        },
      },
      update: {
        rating: review.rating,
        comment: review.comment,
        isHidden: review.isHidden ?? false,
      },
      create: {
        studentId: review.studentId,
        courseId: review.courseId,
        rating: review.rating,
        comment: review.comment,
        isHidden: review.isHidden ?? false,
      },
    });
    seededCourseReviews.push(created);
  }

  // Recalculate Course avgRating and reviewsCount
  const reviewedCourseIds = [...new Set(courseReviewsData.map((r) => r.courseId))];
  for (const cId of reviewedCourseIds) {
    const reviews = await prisma.courseReview.findMany({
      where: { courseId: cId, isHidden: false },
      select: { rating: true },
    });
    const reviewsCount = reviews.length;
    const avgRating = reviewsCount
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(2))
      : 0;

    await prisma.course.update({
      where: { id: cId },
      data: { avgRating, reviewsCount },
    });
  }

  console.log(`✅ Seeded ${seededCourseReviews.length} course reviews across ${reviewedCourseIds.length} courses`);

  // ═══════════════════════════════════════════════════════════════
  // 2. Seed Teacher Reviews with bookingId (تقييمات المدرسين والجلسات)
  // ═══════════════════════════════════════════════════════════
  const teacherReviewsData = [];

  if (teacherList.length > 0) {
    // Teacher 0 (Ahmed Hassan)
    const teacher0Id = resolveTeacherId(teacherList[0]);
    if (teacher0Id) {
      if (studentUsers[0]) {
        teacherReviewsData.push({
          studentId: studentUsers[0].id,
          teacherId: teacher0Id,
          rating: 5,
          comment: "Eng. Ahmed is an exceptional teacher. Very responsive in live mentoring sessions and makes complex topics feel intuitive.",
          bookingId: "b001a111-7777-4444-9999-000000000001",
          isHidden: false,
        });
      }
      if (studentUsers[1]) {
        teacherReviewsData.push({
          studentId: studentUsers[1].id,
          teacherId: teacher0Id,
          rating: 5,
          comment: "أستاذ أحمد متميز جداً، الجلسة الاستشارية كانت مفيدة للغاية وساعدتني في حل مشاكل الكود الصعبة.",
          bookingId: "b001a111-7777-4444-9999-000000000002",
          isHidden: false,
        });
      }
      if (studentUsers[2]) {
        teacherReviewsData.push({
          studentId: studentUsers[2].id,
          teacherId: teacher0Id,
          rating: 4,
          comment: "Patient, knowledgeable, and always brings industry best practices to our 1-to-1 session.",
          bookingId: "b001a111-7777-4444-9999-000000000003",
          isHidden: false,
        });
      }
    }

    // Teacher 1 (Sara Ibrahim)
    if (teacherList[1]) {
      const teacher1Id = resolveTeacherId(teacherList[1]);
      if (teacher1Id) {
        if (studentUsers[1]) {
          teacherReviewsData.push({
            studentId: studentUsers[1].id,
            teacherId: teacher1Id,
            rating: 5,
            comment: "Dr. Sara is phenomenal in Data Science and Machine Learning. Her practical session insights were invaluable.",
            bookingId: "b002a222-7777-4444-9999-000000000004",
            isHidden: false,
          });
        }
        if (studentUsers[4]) {
          teacherReviewsData.push({
            studentId: studentUsers[4].id,
            teacherId: teacher1Id,
            rating: 5,
            comment: "جلسة التوجيه كانت ممتازة ومباشرة، شرحت خوارزميات الذكاء الاصطناعي بشكل مبسط ومفهوم.",
            bookingId: "b002a222-7777-4444-9999-000000000005",
            isHidden: false,
          });
        }
        if (studentUsers[3]) {
          teacherReviewsData.push({
            studentId: studentUsers[3].id,
            teacherId: teacher1Id,
            rating: 4,
            comment: "Insightful private consultation, clear examples, and very engaging teaching method.",
            bookingId: "b002a222-7777-4444-9999-000000000006",
            isHidden: false,
          });
        }
      }
    }

    // Teacher 2 (Omar Ali)
    if (teacherList[2]) {
      const teacher2Id = resolveTeacherId(teacherList[2]);
      if (teacher2Id) {
        if (studentUsers[2]) {
          teacherReviewsData.push({
            studentId: studentUsers[2].id,
            teacherId: teacher2Id,
            rating: 5,
            comment: "Great mobile development mentor! Walked me through debugging native crash logs step-by-step.",
            bookingId: "b003a333-7777-4444-9999-000000000007",
            isHidden: false,
          });
        }
        if (studentUsers[0]) {
          teacherReviewsData.push({
            studentId: studentUsers[0].id,
            teacherId: teacher2Id,
            rating: 4,
            comment: "مدرس رائع وخبرته العملية واضحة، ساعدني في تهيئة تطبيق React Native للرفع على المتاجر.",
            bookingId: "b003a333-7777-4444-9999-000000000008",
            isHidden: false,
          });
        }
      }
    }
  }

  const seededTeacherReviews = [];
  for (const review of teacherReviewsData) {
    const created = await prisma.teacherReview.upsert({
      where: {
        studentId_teacherId: {
          studentId: review.studentId,
          teacherId: review.teacherId,
        },
      },
      update: {
        rating: review.rating,
        comment: review.comment,
        bookingId: review.bookingId ?? null,
        isHidden: review.isHidden ?? false,
      },
      create: {
        studentId: review.studentId,
        teacherId: review.teacherId,
        rating: review.rating,
        comment: review.comment,
        bookingId: review.bookingId ?? null,
        isHidden: review.isHidden ?? false,
      },
    });
    seededTeacherReviews.push(created);
  }

  // Recalculate Teacher avgRating and reviewsCount
  const reviewedTeacherIds = [...new Set(teacherReviewsData.map((r) => r.teacherId))];
  for (const tId of reviewedTeacherIds) {
    const reviews = await prisma.teacherReview.findMany({
      where: { teacherId: tId, isHidden: false },
      select: { rating: true },
    });
    const reviewsCount = reviews.length;
    const avgRating = reviewsCount
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(2))
      : 0;

    await prisma.teacher.update({
      where: { id: tId },
      data: { avgRating, reviewsCount },
    });
  }

  console.log(`✅ Seeded ${seededTeacherReviews.length} teacher/session reviews (with bookingId) across ${reviewedTeacherIds.length} teachers`);

  return {
    courseReviews: seededCourseReviews,
    teacherReviews: seededTeacherReviews,
  };
}

async function standalone() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🚀 Starting standalone reviews seeder...\n");
    await seedReviews(prisma);
    console.log("\n🎉 Reviews seeding completed successfully!");
  } catch (err) {
    console.error("❌ Reviews seeding failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("reviews.seed.js")) {
  standalone();
}
