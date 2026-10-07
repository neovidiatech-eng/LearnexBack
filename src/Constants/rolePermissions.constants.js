import { PERMISSIONS_V2 } from "./permissions.constants.js";

// All distinct permission codes from PERMISSIONS_V2
export const ALL_PERMISSION_CODES = Object.values(PERMISSIONS_V2).flatMap(
  (group) => Object.values(group),
);

// Formatted metadata for each permission for DB seeding and display
export const PERMISSIONS_DATA = [
  // Dashboard
  { code: PERMISSIONS_V2.DASHBOARD.READ, name: "Read Dashboard Analytics", resource: "dashboard", action: "read" },

  // Categories
  { code: PERMISSIONS_V2.CATEGORIES.READ, name: "Read Categories", resource: "categories", action: "read" },
  { code: PERMISSIONS_V2.CATEGORIES.CREATE, name: "Create Categories", resource: "categories", action: "create" },
  { code: PERMISSIONS_V2.CATEGORIES.UPDATE, name: "Update Categories", resource: "categories", action: "update" },
  { code: PERMISSIONS_V2.CATEGORIES.DELETE, name: "Delete Categories", resource: "categories", action: "delete" },

  // Courses
  { code: PERMISSIONS_V2.COURSES.READ, name: "Read Courses", resource: "courses", action: "read" },
  { code: PERMISSIONS_V2.COURSES.CREATE, name: "Create Courses", resource: "courses", action: "create" },
  { code: PERMISSIONS_V2.COURSES.UPDATE, name: "Update Courses", resource: "courses", action: "update" },
  { code: PERMISSIONS_V2.COURSES.DELETE, name: "Delete Courses", resource: "courses", action: "delete" },

  // Sections
  { code: PERMISSIONS_V2.SECTIONS.READ, name: "Read Sections", resource: "sections", action: "read" },
  { code: PERMISSIONS_V2.SECTIONS.CREATE, name: "Create Sections", resource: "sections", action: "create" },
  { code: PERMISSIONS_V2.SECTIONS.UPDATE, name: "Update Sections", resource: "sections", action: "update" },
  { code: PERMISSIONS_V2.SECTIONS.DELETE, name: "Delete Sections", resource: "sections", action: "delete" },

  // Lessons
  { code: PERMISSIONS_V2.LESSONS.READ, name: "Read Lessons", resource: "lessons", action: "read" },
  { code: PERMISSIONS_V2.LESSONS.CREATE, name: "Create Lessons", resource: "lessons", action: "create" },
  { code: PERMISSIONS_V2.LESSONS.UPDATE, name: "Update Lessons", resource: "lessons", action: "update" },
  { code: PERMISSIONS_V2.LESSONS.DELETE, name: "Delete Lessons", resource: "lessons", action: "delete" },

  // Students
  { code: PERMISSIONS_V2.STUDENTS.READ, name: "Read Students", resource: "students", action: "read" },
  { code: PERMISSIONS_V2.STUDENTS.CREATE, name: "Create Students", resource: "students", action: "create" },
  { code: PERMISSIONS_V2.STUDENTS.UPDATE, name: "Update Students", resource: "students", action: "update" },
  { code: PERMISSIONS_V2.STUDENTS.DELETE, name: "Delete Students", resource: "students", action: "delete" },

  // Teachers
  { code: PERMISSIONS_V2.TEACHERS.READ, name: "Read Teachers", resource: "teachers", action: "read" },
  { code: PERMISSIONS_V2.TEACHERS.CREATE, name: "Create Teachers", resource: "teachers", action: "create" },
  { code: PERMISSIONS_V2.TEACHERS.UPDATE, name: "Update Teachers", resource: "teachers", action: "update" },
  { code: PERMISSIONS_V2.TEACHERS.DELETE, name: "Delete Teachers", resource: "teachers", action: "delete" },
  { code: PERMISSIONS_V2.TEACHERS.READ_MY_STUDENTS, name: "Read My Students", resource: "teachers", action: "read_my_students" },

  // Offers
  { code: PERMISSIONS_V2.OFFERS.READ, name: "Read Offers", resource: "offers", action: "read" },
  { code: PERMISSIONS_V2.OFFERS.CREATE, name: "Create Offers", resource: "offers", action: "create" },
  { code: PERMISSIONS_V2.OFFERS.UPDATE, name: "Update Offers", resource: "offers", action: "update" },
  { code: PERMISSIONS_V2.OFFERS.DELETE, name: "Delete Offers", resource: "offers", action: "delete" },

  // Staff
  { code: PERMISSIONS_V2.STAFF.READ, name: "Read Staff", resource: "staff", action: "read" },
  { code: PERMISSIONS_V2.STAFF.CREATE, name: "Create Staff", resource: "staff", action: "create" },
  { code: PERMISSIONS_V2.STAFF.UPDATE, name: "Update Staff", resource: "staff", action: "update" },
  { code: PERMISSIONS_V2.STAFF.DELETE, name: "Delete Staff", resource: "staff", action: "delete" },

  // Roles
  { code: PERMISSIONS_V2.ROLES.READ, name: "Read Roles", resource: "roles", action: "read" },
  { code: PERMISSIONS_V2.ROLES.CREATE, name: "Create Roles", resource: "roles", action: "create" },
  { code: PERMISSIONS_V2.ROLES.UPDATE, name: "Update Roles", resource: "roles", action: "update" },
  { code: PERMISSIONS_V2.ROLES.DELETE, name: "Delete Roles", resource: "roles", action: "delete" },
  { code: PERMISSIONS_V2.ROLES.ASSIGN, name: "Assign Roles", resource: "roles", action: "assign" },

  // Permissions
  { code: PERMISSIONS_V2.PERMISSIONS.READ, name: "Read Permissions", resource: "permissions", action: "read" },
  { code: PERMISSIONS_V2.PERMISSIONS.CREATE, name: "Create Permissions", resource: "permissions", action: "create" },
  { code: PERMISSIONS_V2.PERMISSIONS.UPDATE, name: "Update Permissions", resource: "permissions", action: "update" },
  { code: PERMISSIONS_V2.PERMISSIONS.DELETE, name: "Delete Permissions", resource: "permissions", action: "delete" },

  // Enrollments
  { code: PERMISSIONS_V2.ENROLLMENTS.READ, name: "Read Enrollments", resource: "enrollments", action: "read" },
  { code: PERMISSIONS_V2.ENROLLMENTS.MANAGE, name: "Manage Enrollments", resource: "enrollments", action: "manage" },

  // Reviews
  { code: PERMISSIONS_V2.REVIEWS.READ, name: "Read Reviews", resource: "reviews", action: "read" },
  { code: PERMISSIONS_V2.REVIEWS.DELETE, name: "Delete Reviews", resource: "reviews", action: "delete" },

  // Work Hours
  { code: PERMISSIONS_V2.WORK_HOURS.READ, name: "Read Work Hours", resource: "workHours", action: "read" },
  { code: PERMISSIONS_V2.WORK_HOURS.UPDATE, name: "Update Work Hours", resource: "workHours", action: "update" },

  // Settings
  { code: PERMISSIONS_V2.SETTINGS.READ, name: "Read Settings", resource: "settings", action: "read" },
  { code: PERMISSIONS_V2.SETTINGS.UPDATE, name: "Update Settings", resource: "settings", action: "update" },
];

export const ROLE_PERMISSIONS_MAP = {
  ADMIN: ALL_PERMISSION_CODES,
  TEACHER: [
    // Teachers Profile & Resources
    PERMISSIONS_V2.TEACHERS.READ,
    PERMISSIONS_V2.TEACHERS.CREATE,
    PERMISSIONS_V2.TEACHERS.UPDATE,
    PERMISSIONS_V2.TEACHERS.DELETE,
    PERMISSIONS_V2.TEACHERS.READ_MY_STUDENTS,

    // Work Hours
    PERMISSIONS_V2.WORK_HOURS.READ,
    PERMISSIONS_V2.WORK_HOURS.UPDATE,

    // Courses & Content Management
    PERMISSIONS_V2.COURSES.READ,
    PERMISSIONS_V2.COURSES.CREATE,
    PERMISSIONS_V2.COURSES.UPDATE,
    PERMISSIONS_V2.COURSES.DELETE,
    PERMISSIONS_V2.SECTIONS.READ,
    PERMISSIONS_V2.SECTIONS.CREATE,
    PERMISSIONS_V2.SECTIONS.UPDATE,
    PERMISSIONS_V2.SECTIONS.DELETE,
    PERMISSIONS_V2.LESSONS.READ,
    PERMISSIONS_V2.LESSONS.CREATE,
    PERMISSIONS_V2.LESSONS.UPDATE,
    PERMISSIONS_V2.LESSONS.DELETE,

    // General Access
    PERMISSIONS_V2.ENROLLMENTS.READ,
    PERMISSIONS_V2.CATEGORIES.READ,
    PERMISSIONS_V2.REVIEWS.READ,
  ],
  STUDENT: [
    PERMISSIONS_V2.STUDENTS.READ,
    PERMISSIONS_V2.STUDENTS.CREATE,
    PERMISSIONS_V2.STUDENTS.UPDATE,
    PERMISSIONS_V2.STUDENTS.DELETE,
    PERMISSIONS_V2.COURSES.READ,
    PERMISSIONS_V2.ENROLLMENTS.READ,
    PERMISSIONS_V2.CATEGORIES.READ,
    PERMISSIONS_V2.REVIEWS.READ,
  ],
};
