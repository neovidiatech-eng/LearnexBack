import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

import { seedRoles } from "./seeders/roles.seed.js";
import { seedPermissions } from "./seeders/permission.seed.js";
import { seedAdmin } from "./seeders/admin.seed.js";
import { seedCategories } from "./seeders/categories.seed.js";
import { seedTeachers } from "./seeders/teachers.seed.js";
import { seedStudents } from "./seeders/students.seed.js";
import { seedCourses } from "./seeders/courses.seed.js";
import { seedEnrollments } from "./seeders/enrollments.seed.js";
import { seedActivityLogs } from "./seeders/activityLogs.seed.js";
import { seedNotifications } from "./seeders/notifications.seed.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🚀 Starting database seeding...\n");

  // 1. Roles (no dependencies)
  const roles = await seedRoles(prisma);

  // 2. Permissions + assign to roles (depends on roles)
  await seedPermissions(prisma, roles);

  // 3. Admin (independent)
  const admin = await seedAdmin(prisma);

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

  // 10. Notifications (depends on students + teachers + admin)
  await seedNotifications(prisma, students, teachers, admin);

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