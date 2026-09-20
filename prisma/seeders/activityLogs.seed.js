const activityLogsData = [
  // Auth actions
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "LOGIN",
    module: "Auth",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },
];

export async function seedActivityLogs(prisma) {
  console.log("🌱 Seeding activity logs...");

  const logs = [];
  for (const log of activityLogsData) {
    const created = await prisma.activityLog.create({
      data: {
        userName: log.userName,
        role: log.role,
        action: log.action,
        module: log.module,
        status: log.status,
        ipAddress: log.ipAddress ?? null,
        actorId: null,
      },
    });
    logs.push(created);
  }

  console.log(`✅ Seeded ${logs.length} activity logs`);
  return logs;
}
