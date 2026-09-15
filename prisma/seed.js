const { PrismaClient } = require("@prisma/client");
const { seedRoles } = require("./seeders/roles.seed");
const { seedPermissions } = require("./seeders/permission.seed");
const { seedAdmin } = require("./seeders/admin.seed");
const { seedCategories } = require("./seeders/categories.seed");
const { seedTeachers } = require("./seeders/teachers.seed");
const { seedStudents } = require("./seeders/students.seed");
const { seedCourses } = require("./seeders/courses.seed");
const { seedEnrollments } = require("./seeders/enrollments.seed");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...\n");

  // 1. Roles (no dependencies)
  const roles = await seedRoles();

  // 2. Permissions + assign to roles (depends on roles)
  await seedPermissions(roles);

  // 3. Admin (independent)
  await seedAdmin();

  // 4. Categories (independent)
  const categories = await seedCategories();

  // 5. Teachers (depends on roles)
  const teachers = await seedTeachers(roles);

  // 6. Students (depends on roles)
  const students = await seedStudents(roles);

  // 7. Courses (depends on teachers + categories)
  const courses = await seedCourses(teachers, categories);

  // 8. Enrollments (depends on students + courses)
  await seedEnrollments(students, courses);

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
