const rolesData = [
  { name: "ADMIN", slug: "admin" },
  { name: "TEACHER", slug: "teacher" },
  { name: "STUDENT", slug: "student" },
];

export async function seedRoles(prisma) {
  console.log("🌱 Seeding roles...");

  const roles = [];
  for (const roleData of rolesData) {
    const existingTranslation = await prisma.roleTranslation.findFirst({
      where: {
        lang: "en",
        OR: [{ name: roleData.name }, { slug: roleData.slug }],
      },
      include: { role: true },
    });

    let role;
    if (existingTranslation) {
      role = existingTranslation.role;
    } else {
      role = await prisma.role.create({
        data: {
          roleTranslations: {
            create: [
              {
                name: roleData.name,
                slug: roleData.slug,
                lang: "en",
              },
            ],
          },
        },
      });
    }

    roles.push({ ...role, name: roleData.name });
  }

  console.log(`✅ Seeded ${roles.length} roles`);
  return roles;
}