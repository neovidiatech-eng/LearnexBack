const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rolesData = [
  {
    name: "ADMIN",
    description: "Full system access",
    isSystem: true,
  },
  {
    name: "TEACHER",
    description: "Can create and manage courses",
    isSystem: true,
  },
  {
    name: "STUDENT",
    description: "Can enroll in courses",
    isSystem: true,
  },
];

async function seedRoles() {
  console.log("🌱 Seeding roles...");

  const roles = [];
  for (const role of rolesData) {
    const upserted = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    roles.push(upserted);
  }

  console.log(`✅ Seeded ${roles.length} roles`);
  return roles;
}

module.exports = { seedRoles };
