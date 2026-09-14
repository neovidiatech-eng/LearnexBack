/**
 * Centralized Permission Constants for LearnX LMS
 * Format: resource:action
 */

export const PERMISSIONS_V2 = {
  DASHBOARD: {
    READ: "dashboard:read",
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
    DELETE: "reviews:delete",
  },

  // Settings & Policies
  SETTINGS: {
    READ: "settings:read",
    UPDATE: "settings:update",
  },
};
