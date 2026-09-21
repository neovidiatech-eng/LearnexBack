const permissionsData = [
  { code: "users:read", name: "Read Users", resource: "users", action: "read" },
  { code: "users:create", name: "Create Users", resource: "users", action: "create" },
  { code: "users:update", name: "Update Users", resource: "users", action: "update" },
  { code: "users:delete", name: "Delete Users", resource: "users", action: "delete" },

  { code: "courses:read", name: "Read Courses", resource: "courses", action: "read" },
  { code: "courses:create", name: "Create Courses", resource: "courses", action: "create" },
  { code: "courses:update", name: "Update Courses", resource: "courses", action: "update" },
  { code: "courses:delete", name: "Delete Courses", resource: "courses", action: "delete" },
  { code: "courses:publish", name: "Publish Courses", resource: "courses", action: "publish" },

  { code: "enrollments:read", name: "Read Enrollments", resource: "enrollments", action: "read" },
  { code: "enrollments:create", name: "Create Enrollments", resource: "enrollments", action: "create" },
  { code: "enrollments:update", name: "Update Enrollments", resource: "enrollments", action: "update" },
  { code: "enrollments:delete", name: "Delete Enrollments", resource: "enrollments", action: "delete" },

  { code: "categories:read", name: "Read Categories", resource: "categories", action: "read" },
  { code: "categories:create", name: "Create Categories", resource: "categories", action: "create" },
  { code: "categories:update", name: "Update Categories", resource: "categories", action: "update" },
  { code: "categories:delete", name: "Delete Categories", resource: "categories", action: "delete" },

  { code: "roles:read", name: "Read Roles", resource: "roles", action: "read" },
  { code: "roles:create", name: "Create Roles", resource: "roles", action: "create" },
  { code: "roles:update", name: "Update Roles", resource: "roles", action: "update" },
  { code: "roles:delete", name: "Delete Roles", resource: "roles", action: "delete" },
  { code: "permissions:assign", name: "Assign Permissions", resource: "permissions", action: "assign" },

  { code: "staff:read", name: "Read Staff", resource: "staff", action: "read" },
  { code: "staff:create", name: "Create Staff", resource: "staff", action: "create" },
  { code: "staff:update", name: "Update Staff", resource: "staff", action: "update" },
  { code: "staff:delete", name: "Delete Staff", resource: "staff", action: "delete" },
];

const rolePermissionsMap = {
  ADMIN: permissionsData.map((p) => p.code),
  TEACHER: [
    "courses:read",
    "courses:create",
    "courses:update",
    "courses:delete",
    "courses:publish",
    "enrollments:read",
    "categories:read",
  ],
  STUDENT: [
    "courses:read",
    "enrollments:read",
    "enrollments:create",
    "categories:read",
  ],
};

export async function seedPermissions(prisma, roles) {
  console.log("🌱 Seeding permissions...");

  const permissions = [];
  for (const perm of permissionsData) {
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

  for (const [roleName, codes] of Object.entries(rolePermissionsMap)) {
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