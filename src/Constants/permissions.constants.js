/**
 * Centralized Permission Constants for LearnX LMS
 * Format: resource:action
 */

export const PERMISSIONS_V2 = {
  DASHBOARD: {
    READ: "dashboard:read",
  },

  REPORTS: {
    READ: "reports:read",
  },

  CALENDAR: {
    READ: "calendar:read",
  },
  // Category Management
  CATEGORIES: {
    READ: "categories:read",
    CREATE: "categories:create",
    UPDATE: "categories:update",
    DELETE: "categories:delete",
  },

  // Course Management
  COURSES: {
    READ: "courses:read",
    CREATE: "courses:create",
    UPDATE: "courses:update",
    DELETE: "courses:delete",
  },

  // Section Management
  SECTIONS: {
    READ: "sections:read",
    CREATE: "sections:create",
    UPDATE: "sections:update",
    DELETE: "sections:delete",
  },

  // Lesson Management
  LESSONS: {
    READ: "lessons:read",
    CREATE: "lessons:create",
    UPDATE: "lessons:update",
    DELETE: "lessons:delete",
  },

  // Students Management
  STUDENTS: {
    READ: "students:read",
    CREATE: "students:create",
    UPDATE: "students:update",
    DELETE: "students:delete",
  },

  // Teachers / Instructors Management
  TEACHERS: {
    READ: "teachers:read",
    CREATE: "teachers:create",
    UPDATE: "teachers:update",
    DELETE: "teachers:delete",
    READ_MY_STUDENTS: "teachers:read_my_students",
  },
  OFFERS: {
    READ: "offers:read",
    CREATE: "offers:create",
    UPDATE: "offers:update",
    DELETE: "offers:delete",
  },

  // Staff Management
  STAFF: {
    READ: "staff:read",
    CREATE: "staff:create",
    UPDATE: "staff:update",
    DELETE: "staff:delete",
  },

  // Role Management
  ROLES: {
    READ: "roles:read",
    CREATE: "roles:create",
    UPDATE: "roles:update",
    DELETE: "roles:delete",
    ASSIGN: "roles:assign",
    PERMISSION: "roles:permissions",
  },

  // Permission Management
  PERMISSIONS: {
    READ: "permissions:read",
    CREATE: "permissions:create",
    UPDATE: "permissions:update",
    DELETE: "permissions:delete",
  },

  // Enrollments Management
  ENROLLMENTS: {
    READ: "enrollments:read",
    MANAGE: "enrollments:manage",
  },

  // Reviews Management
  REVIEWS: {
    READ: "reviews:read",
    UPDATE: "reviews:update",
    DELETE: "reviews:delete",
  },

  WORK_HOURS: {
    READ: "workHours:read",
    UPDATE: "workHours:update",
  },

  // Settings & Policies
  SETTINGS: {
    READ: "settings:read",
    UPDATE: "settings:update",
  },
  PLANS: {
    READ: "plans:read",
    CREATE: "plans:create",
    UPDATE: "plans:update",
    DELETE: "plans:delete",
    ASSIGN: "plans:assign",
    GET_MY_PLANS: "plans:get_my_plans",
    BUY_PLAN: "plans:buy_plan",
  },

  SESSIONS: {
    READ: "sessions:read",
    CREATE: "sessions:create",
    UPDATE: "sessions:update",
    DELETE: "sessions:delete",
    JOIN: "sessions:join",
    START: "sessions:start",
    END: "sessions:end",
  },
  SESSIONREQUESTS: {
    CREATE: "sessionRequests:create",
    CANCEL: "sessionRequests:cancel",
    VIEW: "sessionRequests:view",
    ACCEPT: "sessionRequests:accept",
    REJECT: "sessionRequests:reject",
  },

  // Chat Management
  CHAT: {
    READ: "chat:read",
    CREATE: "chat:create",
    DELETE: "chat:delete",
  },
  TICKETS: {
    READ: "tickets:read",
    CREATE: "tickets:create",
    UPDATE: "tickets:update",
    DELETE: "tickets:delete",
    READ_OWN: "tickets:read_own",
    READ_ALL: "tickets:read_all",
    CLOSE: "tickets:close",
    REOPEN: "tickets:reopen",
    ASSIGN:"tickets:assign"
   }
 };

