import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { coursesType } from "../../src/utils/Enums/teacherCourse.enum.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

export async function seedStudentCertificates(
  prisma,
  students = [],
  courses = [],
  teacherCourses = []
) {
  console.log("🌱 Seeding student certificates...");

  // 1. Resolve Students
  let studentRecords = students;
  if (!studentRecords || studentRecords.length === 0) {
    studentRecords = await prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  // 2. Resolve Platform Courses
  let courseRecords = courses;
  if (!courseRecords || courseRecords.length === 0) {
    courseRecords = await prisma.course.findMany({
      take: 10,
      orderBy: { createdAt: "asc" },
    });
  }

  // 3. Resolve Teacher Courses
  let teacherCourseRecords = teacherCourses;
  if (!teacherCourseRecords || teacherCourseRecords.length === 0) {
    teacherCourseRecords = await prisma.teacherCourse.findMany({
      take: 10,
      orderBy: { createdAt: "asc" },
    });
  }

  if (studentRecords.length === 0) {
    console.log("⚠️ No students found to assign certificates. Skipping.");
    return [];
  }

  const resolveStudentId = (s) => {
    // If it's a User object with a student relation
    if (s.student?.id) return s.student.id;
    // If it's already a Student object
    if (s.id) return s.id;
    return null;
  };

  const getStudentName = (s) => {
    return s.user?.fullName || s.fullName || "Student";
  };

  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // We assign certificates ensuring each courseId is unique
  // (per Prisma schema: courseId String @unique)
  const certificatesToSeed = [];

  // Certificate 1: Student 2 (Karim Mostafa) -> Platform Course 2 (Flutter)
  if (studentRecords[2] && courseRecords[2]) {
    certificatesToSeed.push({
      studentId: resolveStudentId(studentRecords[2]),
      studentName: getStudentName(studentRecords[2]),
      courseType: coursesType.COURSE,
      courseId: courseRecords[2].id,
      courseTitle: "Mobile App Development with Flutter",
      achivedAt: daysAgo(10),
    });
  }

  // Certificate 2: Student 1 (Nour Khaled) -> Platform Course 1 (Data Science & ML)
  if (studentRecords[1] && courseRecords[1]) {
    certificatesToSeed.push({
      studentId: resolveStudentId(studentRecords[1]),
      studentName: getStudentName(studentRecords[1]),
      courseType: coursesType.COURSE,
      courseId: courseRecords[1].id,
      courseTitle: "Data Science & Machine Learning",
      achivedAt: daysAgo(15),
    });
  }

  // Certificate 3: Student 0 (Youssef Mahmoud) -> Platform Course 0 (Web Development)
  if (studentRecords[0] && courseRecords[0]) {
    certificatesToSeed.push({
      studentId: resolveStudentId(studentRecords[0]),
      studentName: getStudentName(studentRecords[0]),
      courseType: coursesType.COURSE,
      courseId: courseRecords[0].id,
      courseTitle: "Complete Web Development Bootcamp",
      achivedAt: daysAgo(25),
    });
  }

  // Certificate 4: Student 3 (Aya Samy) -> Teacher Course 0
  if (studentRecords[3] && teacherCourseRecords[0]) {
    certificatesToSeed.push({
      studentId: resolveStudentId(studentRecords[3]),
      studentName: getStudentName(studentRecords[3]),
      courseType: coursesType.TEACHER_COURSE,
      courseId: teacherCourseRecords[0].id,
      courseTitle: teacherCourseRecords[0].name || "Teacher Course 1",
      achivedAt: daysAgo(5),
    });
  }

  // Certificate 5: Student 4 (Hassan Fathy) -> Teacher Course 1
  if (studentRecords[4] && teacherCourseRecords[1]) {
    certificatesToSeed.push({
      studentId: resolveStudentId(studentRecords[4]),
      studentName: getStudentName(studentRecords[4]),
      courseType: coursesType.TEACHER_COURSE,
      courseId: teacherCourseRecords[1].id,
      courseTitle: teacherCourseRecords[1].name || "Teacher Course 2",
      achivedAt: daysAgo(2),
    });
  }

  const seededCertificates = [];
  for (const cert of certificatesToSeed) {
    if (!cert.studentId || !cert.courseId) continue;

    const created = await prisma.certificates.upsert({
      where: {
        courseId: cert.courseId,
      },
      update: {
        studentId: cert.studentId,
        courseType: cert.courseType,
        achivedAt: cert.achivedAt,
      },
      create: {
        studentId: cert.studentId,
        courseType: cert.courseType,
        courseId: cert.courseId,
        achivedAt: cert.achivedAt,
      },
    });

    seededCertificates.push(created);
    console.log(
      `  📜 Certificate seeded: ${cert.studentName} for [${cert.courseType}] "${cert.courseTitle}"`
    );
  }

  console.log(`✅ Seeded ${seededCertificates.length} student certificates`);
  return seededCertificates;
}

async function standalone() {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { default: pg } = await import("pg");

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🚀 Starting standalone student certificates seeder...\n");
    await seedStudentCertificates(prisma);
    console.log("\n🎉 Student certificates seeding completed successfully!");
  } catch (err) {
    console.error("❌ Student certificates seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("studentCertificates.seed.js")) {
  standalone();
}
