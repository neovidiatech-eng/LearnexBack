const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function seedAdmin() {
  console.log("🌱 Seeding admin...");

  const hashedPassword = await bcrypt.hash("Admin@123456", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@learnex.com" },
    update: {},
    create: {
      email: "admin@learnex.com",
      password: hashedPassword,
      fullName: "Super Admin",
    },
  });

  console.log(`✅ Admin seeded: ${admin.email}`);
  return admin;
}

module.exports = { seedAdmin };
