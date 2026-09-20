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
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "LOGOUT",
    module: "Auth",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },
  {
    userName: "Youssef Mahmoud",
    role: "STUDENT",
    action: "LOGIN",
    module: "Auth",
    status: "SUCCESS",
    ipAddress: "197.32.14.55",
  },
  {
    userName: "Unknown",
    role: "GUEST",
    action: "LOGIN",
    module: "Auth",
    status: "FAILED",
    ipAddress: "203.0.113.42",
  },
  {
    userName: "Nour Khaled",
    role: "STUDENT",
    action: "REGISTER",
    module: "Auth",
    status: "SUCCESS",
    ipAddress: "197.32.14.88",
  },
  {
    userName: "Karim Mostafa",
    role: "STUDENT",
    action: "RESET_PASSWORD",
    module: "Auth",
    status: "SUCCESS",
    ipAddress: "41.65.200.10",
  },

  // User management actions
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "CREATE_USER",
    module: "Users",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "UPDATE_USER",
    module: "Users",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "DELETE_USER",
    module: "Users",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "BAN_USER",
    module: "Users",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },

  // Course actions
  {
    userName: "Ahmed Saber",
    role: "TEACHER",
    action: "CREATE_COURSE",
    module: "Courses",
    status: "SUCCESS",
    ipAddress: "197.52.100.21",
  },
  {
    userName: "Ahmed Saber",
    role: "TEACHER",
    action: "UPDATE_COURSE",
    module: "Courses",
    status: "SUCCESS",
    ipAddress: "197.52.100.21",
  },
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "DELETE_COURSE",
    module: "Courses",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },
  {
    userName: "Sara Ibrahim",
    role: "TEACHER",
    action: "PUBLISH_COURSE",
    module: "Courses",
    status: "SUCCESS",
    ipAddress: "197.52.100.45",
  },
  {
    userName: "Ahmed Saber",
    role: "TEACHER",
    action: "PUBLISH_COURSE",
    module: "Courses",
    status: "FAILED",
    ipAddress: "197.52.100.21",
  },

  // Enrollment actions
  {
    userName: "Youssef Mahmoud",
    role: "STUDENT",
    action: "ENROLL_COURSE",
    module: "Enrollments",
    status: "SUCCESS",
    ipAddress: "197.32.14.55",
  },
  {
    userName: "Nour Khaled",
    role: "STUDENT",
    action: "ENROLL_COURSE",
    module: "Enrollments",
    status: "SUCCESS",
    ipAddress: "197.32.14.88",
  },
  {
    userName: "Aya Samy",
    role: "STUDENT",
    action: "ENROLL_COURSE",
    module: "Enrollments",
    status: "SUCCESS",
    ipAddress: "41.65.201.77",
  },
  {
    userName: "Karim Mostafa",
    role: "STUDENT",
    action: "COMPLETE_COURSE",
    module: "Enrollments",
    status: "SUCCESS",
    ipAddress: "41.65.200.10",
  },

  // Role & permission actions
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "CREATE_ROLE",
    module: "Roles",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "ASSIGN_PERMISSION",
    module: "Permissions",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "REVOKE_PERMISSION",
    module: "Permissions",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },

  // Category actions
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "CREATE_CATEGORY",
    module: "Categories",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },
  {
    userName: "Super Admin",
    role: "ADMIN",
    action: "UPDATE_CATEGORY",
    module: "Categories",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
  },

  // Profile actions
  {
    userName: "Hassan Fathy",
    role: "STUDENT",
    action: "UPDATE_PROFILE",
    module: "Profile",
    status: "SUCCESS",
    ipAddress: "197.32.88.100",
  },
  {
    userName: "Sara Ibrahim",
    role: "TEACHER",
    action: "UPDATE_PROFILE",
    module: "Profile",
    status: "SUCCESS",
    ipAddress: "197.52.100.45",
  },
  {
    userName: "Aya Samy",
    role: "STUDENT",
    action: "CHANGE_PASSWORD",
    module: "Profile",
    status: "SUCCESS",
    ipAddress: "41.65.201.77",
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
