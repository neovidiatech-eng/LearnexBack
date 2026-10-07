import {
  PERMISSIONS_DATA,
  ROLE_PERMISSIONS_MAP,
} from "../../src/Constants/rolePermissions.constants.js";

export async function seedPermissions(prisma, roles) {
  console.log("🌱 Seeding permissions...");

  const permissions = [];
  for (const perm of PERMISSIONS_DATA) {
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
  const rolesMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

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