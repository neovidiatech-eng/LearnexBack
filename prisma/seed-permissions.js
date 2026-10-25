import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { seedPermissions } from "./seeders/permission.seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Role model has no `name` column — only `id` and `slug`.
// permission.seed.js maps roles by slug.toUpperCase(), so this is all we need.
const roles = await prisma.role.findMany({
  select: { id: true, slug: true },
});

console.log(`Found ${roles.length} roles:`, roles.map((r) => r.slug));

await seedPermissions(prisma, roles);
await prisma.$disconnect();
await pool.end();
