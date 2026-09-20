import { PrismaClient } from "@prisma/client";
import { seedRoles } from "./seeders/roles.seed.js";
import { seedPermissions } from "./seeders/permission.seed.js";
import { seedAdmin } from "./seeders/admin.seed.js";
import { seedCategories } from "./seeders/categories.seed.js";
import { seedTeachers } from "./seeders/teachers.seed.js";
import { seedStudents } from "./seeders/students.seed.js";
import { seedCourses } from "./seeders/courses.seed.js";
import { seedEnrollments } from "./seeders/enrollments.seed.js";
import { seedActivityLogs } from "./seeders/activityLogs.seed.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...\n");

  // 1. Roles (no dependencies)
  const roles = await seedRoles(prisma);

  // 2. Permissions + assign to roles (depends on roles)
  await seedPermissions(prisma, roles);

  // 3. Admin (independent)
  await seedAdmin(prisma);

  // 4. Categories (independent)
  const categories = await seedCategories(prisma);

  // 5. Teachers (depends on roles)
  const teachers = await seedTeachers(prisma, roles);

  // 6. Students (depends on roles)
  const students = await seedStudents(prisma, roles);

  // 7. Courses (depends on teachers + categories)
  const courses = await seedCourses(prisma, teachers, categories);

  // 8. Enrollments (depends on students + courses)
  await seedEnrollments(prisma, students, courses);

  // 9. Activity Logs (independent)
  await seedActivityLogs(prisma);

  console.log("\n✅ Database seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });