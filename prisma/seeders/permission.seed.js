import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  PERMISSIONS_DATA,
  ROLE_PERMISSIONS_MAP,
} from "../../src/Constants/rolePermissions.constants.js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

export async function seedPermissions(prisma, roles) {
  console.log("🌱 Seeding permissions...");

  const permissions = [];
  for (const perm of PERMISSIONS_DATA) {
    console.log(perm.code);
    
    const upserted = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    permissions.push(upserted);
  }

  console.log(`✅ Seeded ${permissions.length} permissions`);

  console.log("🌱 Assigning permissions to roles...");
  const permMap = Object.fromEntries(permissions.map((p) => [p.code, p.id]));
  const rolesMap = Object.fromEntries(
    roles.map((r) => [(r.slug || r.name)?.toUpperCase(), r.id]),
  );

  for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS_MAP)) {
    const roleId = rolesMap[roleName];
    if (!roleId) continue;

    for (const code of codes) {
      const permissionId = permMap[code];
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  console.log("✅ Role permissions assigned");
  return permissions;
}

async function standalone() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in environment or .env file.");
    process.exitCode = 1;
    return;
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const roles = await prisma.role.findMany({
      select: { id: true, slug: true },
    });
    console.log(`Found ${roles.length} roles:`, roles.map((r) => r.slug));
    await seedPermissions(prisma, roles);
  } catch (error) {
    console.error("❌ Permission seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("permission.seed.js")) {
  standalone();
}
