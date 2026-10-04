import swaggerUi from "swagger-ui-express";

// ═══════════════════════════════════════════════════════════════
//  Reusable parameter/schema helpers
// ═══════════════════════════════════════════════════════════════
const uuidParam = (name, description) => ({
  in: "path",
  name,
  required: true,
  schema: { type: "string", format: "uuid" },
  description,
  example: "550e8400-e29b-41d4-a716-446655440000",
});

const paginationParams = [
  { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 }, description: "Page number" },
  { in: "query", name: "limit", schema: { type: "integer", minimum: 1, default: 10 }, description: "Results per page" },
  { in: "query", name: "search", schema: { type: "string" }, description: "Search keyword" },
];

const bearerSecurity = [{ BearerAuth: [] }];

const msgResponse = (example) => ({
  type: "object",
  properties: { message: { type: "string", example } },
});

const dataResponse = (example) => ({
  type: "object",
  properties: {
    message: { type: "string", example },
    data: { type: "object" },
  },
});

const listResponse = () => ({
  type: "object",
  properties: { data: { type: "array", items: { type: "object" } } },
});

const json200 = (schema) => ({
  200: {
    description: "Success",
    content: { "application/json": { schema } },
  },
  401: { description: "Unauthorized" },
});

const json201 = (schema) => ({
  201: {
    description: "Created successfully",
    content: { "application/json": { schema } },
  },
  400: { description: "Validation error" },
  401: { description: "Unauthorized" },
});

// ═══════════════════════════════════════════════════════════════
//  Full OpenAPI spec
// ═══════════════════════════════════════════════════════════════
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "LearnX LMS API Documentation 🚀",
    version: "1.0.0",
    description: "Interactive API documentation for LearnX Learning Management System (LMS)",
    contact: { name: "LearnX Team" },
  },
  servers: [
    { url: "https://learnx.agro-plus.net", description: "Production Server" },
    { url: "http://localhost:3015", description: "Docker Local Server" },
    { url: "http://localhost:3000", description: "Local Development Server" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token: Bearer <token>",
      },
    },
  },
  tags: [
    { name: "Auth", description: "Student / general authentication" },
    { name: "Teacher Auth", description: "Teacher registration & login" },
    { name: "Teacher Profile", description: "Teacher profile management" },
    { name: "Teacher Courses", description: "Teacher course management" },
    { name: "Teacher Sections", description: "Teacher section management" },
    { name: "Teacher Items", description: "Teacher course item management" },
    { name: "Teacher Quizzes", description: "Teacher quiz & question management" },
    { name: "Teacher Certificates", description: "Teacher certificate management" },
    { name: "Admin Auth", description: "Admin authentication" },
    { name: "Admin Students", description: "Admin student management" },
    { name: "Admin Teachers", description: "Admin teacher management" },
    { name: "Admin Categories", description: "Admin category management" },
    { name: "Admin Courses", description: "Admin course management" },
    { name: "Admin Staff", description: "Admin staff management" },
    { name: "Admin Roles", description: "Admin role management" },
    { name: "Admin Coupons", description: "Admin coupon management" },
    { name: "Admin Offers", description: "Admin offer management" },
    { name: "Admin Activity Logs", description: "System activity logs" },
    { name: "Admin Settings", description: "Admin app settings & CMS management" },
    { name: "Notifications", description: "Notification management" },
    { name: "Student Profile", description: "Student profile management" },
    { name: "Student Courses", description: "Student course favorites" },
    { name: "Student Teachers", description: "Browse teachers" },
    { name: "Student Cart", description: "Student shopping cart management" },
    { name: "Settings", description: "Public app settings & pages" },
  ],
  paths: {

    // ───────────────────────────────────────────────────────────
    // AUTH  (/api/v1/auth)
    // ───────────────────────────────────────────────────────────
    "/api/v1/auth/signup/student": {
      post: {
        summary: "Student signup",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password", "confirmPassword", "phone"],
                properties: {
                  fullName: { type: "string", example: "Ahmed Mohamed" },
                  email: { type: "string", format: "email", example: "student@learnx.com" },
                  password: { type: "string", format: "password", example: "Password@123!" },
                  confirmPassword: { type: "string", format: "password", example: "Password@123!" },
                  phone: { type: "string", example: "+201012345678" },
                },
              },
            },
          },
        },
        responses: {
          ...json201(msgResponse("Signup successful")),
          409: { description: "Email already exists" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        summary: "Login (student / any role)",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "student@learnx.com" },
                  password: { type: "string", format: "password", example: "Password@123!" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("Login successful")),
          404: { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/auth/confirm-email": {
      patch: {
        summary: "Confirm student email with OTP",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp"],
                properties: {
                  email: { type: "string", format: "email", example: "student@learnx.com" },
                  otp: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(msgResponse("Email confirmed")),
          400: { description: "Invalid or expired OTP" },
        },
      },
    },
    "/api/v1/auth/refresh-token": {
      get: {
        summary: "Refresh access token",
        tags: ["Auth"],
        security: bearerSecurity,
        responses: json200(dataResponse("Token refreshed")),
      },
    },
    "/api/v1/auth/forgot-password": {
      post: {
        summary: "Request a password reset OTP",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", example: "student@learnx.com" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(msgResponse("OTP sent to email")),
          404: { description: "Email not found" },
        },
      },
    },
    "/api/v1/auth/reset-password": {
      patch: {
        summary: "Reset password using OTP",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp", "password", "confirmPassword"],
                properties: {
                  email: { type: "string", format: "email", example: "student@learnx.com" },
                  otp: { type: "string", example: "123456" },
                  password: { type: "string", format: "password", example: "NewPassword@123!" },
                  confirmPassword: { type: "string", format: "password", example: "NewPassword@123!" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(msgResponse("Password reset successfully")),
          400: { description: "Invalid or expired OTP" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // STUDENT PROFILE  (/api/v1/student/me)
    // ───────────────────────────────────────────────────────────
    "/api/v1/student/me/profile": {
      get: {
        summary: "Get student profile",
        tags: ["Student Profile"],
        security: bearerSecurity,
        responses: json200(dataResponse("Profile retrieved")),
      },
      patch: {
        summary: "Update student profile",
        tags: ["Student Profile"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string", example: "Ahmed Mohamed" },
                  phone: { type: "string", example: "+201012345678" },
                  country: { type: "string", example: "EG" },
                  dateOfBirth: { type: "string", format: "date", example: "1998-05-15" },
                  preferredLanguage: { type: "string", enum: ["ar", "en"], example: "ar" },
                },
              },
            },
          },
        },
        responses: json200(dataResponse("Profile updated")),
      },
      delete: {
        summary: "Delete student account",
        tags: ["Student Profile"],
        security: bearerSecurity,
        responses: {
          204: { description: "Account deleted" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/student/me/change-password": {
      patch: {
        summary: "Change student password",
        tags: ["Student Profile"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword", "confirmPassword"],
                properties: {
                  currentPassword: { type: "string", format: "password", example: "OldPassword@123!" },
                  newPassword: { type: "string", format: "password", example: "NewPassword@123!" },
                  confirmPassword: { type: "string", format: "password", example: "NewPassword@123!" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(msgResponse("Password changed")),
          400: { description: "Wrong current password" },
        },
      },
    },
    "/api/v1/student/me/profile-image": {
      patch: {
        summary: "Update student profile/cover photo",
        tags: ["Student Profile"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  profilePhoto: { type: "string", format: "binary", description: "Profile photo" },
                  coverPhoto: { type: "string", format: "binary", description: "Cover photo" },
                },
              },
            },
          },
        },
        responses: json200(msgResponse("Images updated")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // STUDENT COURSES  (/api/v1/student/courses)
    // ───────────────────────────────────────────────────────────
    "/api/v1/student/courses/favorites": {
      get: {
        summary: "Get student favourite courses",
        tags: ["Student Courses"],
        security: bearerSecurity,
        parameters: [
          ...paginationParams,
          { in: "query", name: "locale", schema: { type: "string", enum: ["ar", "en"], default: "ar" }, description: "Translation locale" },
        ],
        responses: json200(listResponse()),
      },
    },
    "/api/v1/student/courses/{courseId}/favorite": {
      patch: {
        summary: "Toggle course favourite",
        tags: ["Student Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["isFavourite"],
                properties: {
                  isFavourite: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("COURSE_ADDED_TO_FAVORITES")),
          404: { description: "Course not found" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // STUDENT TEACHERS  (/api/v1/student/teachers)
    // ───────────────────────────────────────────────────────────
    "/api/v1/student/teachers": {
      get: {
        summary: "Browse all teachers",
        tags: ["Student Teachers"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/student/teachers/{teacherId}": {
      get: {
        summary: "Get teacher profile by ID",
        tags: ["Student Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        responses: {
          ...json200(dataResponse("Teacher retrieved")),
          404: { description: "Teacher not found" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // PUBLIC SETTINGS  (/api/v1/settings)
    // ───────────────────────────────────────────────────────────
    "/api/v1/settings/app-info": {
      get: {
        summary: "Get public app info (name, logo, contact…)",
        tags: ["Settings"],
        security: bearerSecurity,
        responses: json200(dataResponse("App info retrieved")),
      },
    },
    "/api/v1/settings/pages": {
      get: {
        summary: "Get all public CMS pages",
        tags: ["Settings"],
        responses: json200(listResponse()),
      },
    },
    "/api/v1/settings/pages/{slug}": {
      get: {
        summary: "Get a CMS page by slug",
        tags: ["Settings"],
        security: bearerSecurity,
        parameters: [
          { in: "path", name: "slug", required: true, schema: { type: "string" }, example: "about-us", description: "Page slug" },
        ],
        responses: {
          ...json200(dataResponse("Page retrieved")),
          404: { description: "Page not found" },
        },
      },
    },
    "/api/v1/settings/language": {
      patch: {
        summary: "Change preferred language",
        tags: ["Settings"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["language"],
                properties: {
                  language: { type: "string", enum: ["ar", "en", "fr"], example: "ar" },
                },
              },
            },
          },
        },
        responses: json200(msgResponse("Language updated")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // TEACHER AUTH  (/api/v1/teacher/auth)
    // ───────────────────────────────────────────────────────────
    "/api/v1/teacher/auth/signup": {
      post: {
        summary: "Teacher signup (with CV upload)",
        tags: ["Teacher Auth"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["email", "password", "phone", "subject"],
                properties: {
                  fullName: { type: "string", example: "Dr. Mohamed Ali" },
                  firstName: { type: "string", example: "Mohamed" },
                  lastName: { type: "string", example: "Ali" },
                  email: { type: "string", format: "email", example: "teacher@learnx.com" },
                  password: { type: "string", format: "password", example: "Password@123!" },
                  phone: { type: "string", example: "+201012345678" },
                  subject: { type: "string", example: "Mathematics" },
                  experienceYears: { type: "integer", minimum: 0, example: 5 },
                  linkedinUrl: { type: "string", format: "uri", example: "https://linkedin.com/in/user" },
                  headline: { type: "string", example: "Senior Math Teacher" },
                  bio: { type: "string", example: "10 years of teaching experience..." },
                  locale: { type: "string", enum: ["ar", "en"], default: "ar" },
                  cv: { type: "string", format: "binary", description: "CV file (PDF or image, max 10MB)" },
                },
              },
            },
          },
        },
        responses: {
          ...json201(msgResponse("Teacher application submitted (Pending Admin Review)")),
          409: { description: "Email already exists" },
        },
      },
    },
    "/api/v1/teacher/auth/login": {
      post: {
        summary: "Teacher login",
        tags: ["Teacher Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "teacher@learnx.com" },
                  password: { type: "string", format: "password", example: "Password@123!" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("Login successful")),
          403: { description: "Account under review or inactive" },
          404: { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/teacher/auth/refresh-token": {
      get: {
        summary: "Refresh teacher access token",
        tags: ["Teacher Auth"],
        security: bearerSecurity,
        responses: json200(dataResponse("Token refreshed")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // TEACHER CERTIFICATES  (/api/v1/teacher/certificates)
    // ───────────────────────────────────────────────────────────
    "/api/v1/teacher/certificates": {
      post: {
        summary: "Upload a teacher certificate",
        tags: ["Teacher Certificates"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["type", "title", "issuer", "issueYear", "file"],
                properties: {
                  type: { type: "string", enum: ["ACADEMIC", "PROFESSIONAL", "OTHER"], example: "ACADEMIC" },
                  title: { type: "string", example: "Bachelor of Computer Science" },
                  issuer: { type: "string", example: "Cairo University" },
                  issueYear: { type: "integer", example: 2020 },
                  file: { type: "string", format: "binary", description: "Certificate file (PDF or image, max 15MB)" },
                },
              },
            },
          },
        },
        responses: {
          ...json201(dataResponse("Certificate uploaded")),
          404: { description: "Teacher not found" },
        },
      },
      get: {
        summary: "Get all teacher certificates",
        tags: ["Teacher Certificates"],
        security: bearerSecurity,
        parameters: [
          { in: "query", name: "status", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] }, description: "Filter by status" },
        ],
        responses: json200(listResponse()),
      },
    },
    "/api/v1/teacher/certificates/{id}": {
      get: {
        summary: "Get certificate by ID",
        tags: ["Teacher Certificates"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Certificate ID")],
        responses: {
          ...json200(dataResponse("Certificate retrieved")),
          404: { description: "Certificate not found" },
        },
      },
      delete: {
        summary: "Delete a certificate",
        tags: ["Teacher Certificates"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Certificate ID")],
        responses: {
          ...json200(msgResponse("Certificate deleted")),
          404: { description: "Certificate not found" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // TEACHER PROFILE  (/api/v1/teacher/me)
    // ───────────────────────────────────────────────────────────
    "/api/v1/teacher/me/profile": {
      get: {
        summary: "Get teacher profile",
        tags: ["Teacher Profile"],
        security: bearerSecurity,
        responses: json200(dataResponse("Profile retrieved")),
      },
      patch: {
        summary: "Update teacher profile",
        tags: ["Teacher Profile"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string", example: "Dr. Mohamed Ali" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string", example: "+201012345678" },
                  country: { type: "string", example: "Egypt" },
                  subject: { type: "string", example: "Mathematics" },
                  headline: { type: "string", example: "Senior Math Teacher" },
                  bio: { type: "string", example: "10 years experience..." },
                  experienceYears: { type: "integer", minimum: 0 },
                  linkedinUrl: { type: "string", format: "uri" },
                  sessionPrice50Min: { type: "number", minimum: 0, example: 50 },
                  currency: { type: "string", example: "EGP" },
                },
              },
            },
          },
        },
        responses: json200(dataResponse("Profile updated")),
      },
    },
    "/api/v1/teacher/me/cover-image": {
      patch: {
        summary: "Update teacher cover image",
        tags: ["Teacher Profile"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["coverImage"],
                properties: {
                  coverImage: { type: "string", format: "binary", description: "Image file" },
                },
              },
            },
          },
        },
        responses: json200(msgResponse("Cover image updated")),
      },
    },
    "/api/v1/teacher/me/visibility": {
      patch: {
        summary: "Toggle teacher profile visibility",
        tags: ["Teacher Profile"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  isAvailable: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: json200(msgResponse("Visibility updated")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // TEACHER COURSES  (/api/v1/teacher/courses)
    // ───────────────────────────────────────────────────────────
    "/api/v1/teacher/courses": {
      post: {
        summary: "Create a new course",
        tags: ["Teacher Courses"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "description", "price", "totalHours"],
                properties: {
                  name: { type: "string", example: "Introduction to JavaScript" },
                  description: { type: "string", example: "Learn JavaScript from scratch" },
                  price: { type: "number", example: 49.99 },
                  totalHours: { type: "integer", minimum: 0, example: 20 },
                  wallPaper: { type: "string", format: "binary", description: "Course cover image" },
                },
              },
            },
          },
        },
        responses: {
          ...json201(dataResponse("COURSE_CREATED_SUCCESS")),
          404: { description: "Teacher not found" },
        },
      },
      get: {
        summary: "Get all teacher courses",
        tags: ["Teacher Courses"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: {
          ...json200(listResponse()),
          404: { description: "Teacher not found" },
        },
      },
    },
    "/api/v1/teacher/courses/{id}": {
      get: {
        summary: "Get course by ID",
        tags: ["Teacher Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Course ID")],
        responses: {
          ...json200(dataResponse("Course retrieved")),
          404: { description: "Course or teacher not found" },
        },
      },
      patch: {
        summary: "Update a course",
        tags: ["Teacher Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Course ID")],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Advanced JavaScript" },
                  description: { type: "string" },
                  price: { type: "number", example: 59.99 },
                  totalHours: { type: "integer", minimum: 0, example: 25 },
                  wallPaper: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("COURSE_UPDATED_SUCCESS")),
          404: { description: "Course or teacher not found" },
        },
      },
      delete: {
        summary: "Delete a course",
        tags: ["Teacher Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Course ID")],
        responses: {
          ...json200(msgResponse("COURSE_DELETED_SUCCESS")),
          404: { description: "Course or teacher not found" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // TEACHER SECTIONS  (/api/v1/teacher/sections)
    // ───────────────────────────────────────────────────────────
    "/api/v1/teacher/sections/{courseId}": {
      post: {
        summary: "Create a new section in a course",
        tags: ["Teacher Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "order"],
                properties: {
                  name: { type: "string", example: "Getting Started" },
                  order: { type: "integer", minimum: 1, example: 1 },
                },
              },
            },
          },
        },
        responses: {
          ...json201(dataResponse("SECTION_CREATED_SUCCESS")),
          404: { description: "Course or teacher not found" },
        },
      },
      get: {
        summary: "Get all sections for a course",
        tags: ["Teacher Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        responses: {
          ...json200(listResponse()),
          404: { description: "Course or teacher not found" },
        },
      },
    },
    "/api/v1/teacher/sections/{courseId}/reorder": {
      patch: {
        summary: "Reorder sections within a course",
        tags: ["Teacher Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sections"],
                properties: {
                  sections: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["id", "order"],
                      properties: {
                        id: { type: "string", format: "uuid" },
                        order: { type: "integer", minimum: 1 },
                      },
                    },
                    example: [{ id: "660e8400-e29b-41d4-a716-446655440001", order: 2 }],
                  },
                },
              },
            },
          },
        },
        responses: {
          ...json200(msgResponse("SECTIONS_REORDERED_SUCCESS")),
          404: { description: "Course or teacher not found" },
        },
      },
    },
    "/api/v1/teacher/sections/{courseId}/{sectionId}": {
      get: {
        summary: "Get a section by ID",
        tags: ["Teacher Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID"), uuidParam("sectionId", "Section ID")],
        responses: {
          ...json200(dataResponse("Section retrieved")),
          404: { description: "Section or teacher not found" },
        },
      },
      patch: {
        summary: "Update a section",
        tags: ["Teacher Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID"), uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  name: { type: "string", example: "Advanced Concepts" },
                  order: { type: "integer", minimum: 1, example: 3 },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("SECTION_UPDATED_SUCCESS")),
          400: { description: "At least one field is required" },
          404: { description: "Section or teacher not found" },
        },
      },
      delete: {
        summary: "Delete a section",
        tags: ["Teacher Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID"), uuidParam("sectionId", "Section ID")],
        responses: {
          ...json200(msgResponse("SECTION_DELETED_SUCCESS")),
          404: { description: "Section or teacher not found" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // TEACHER ITEMS  (/api/v1/teacher/items)
    // ───────────────────────────────────────────────────────────
    "/api/v1/teacher/items/{sectionId}": {
      post: {
        summary: "Create a new item in a section",
        tags: ["Teacher Items"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "materialType"],
                properties: {
                  title: { type: "string", example: "Introduction Video" },
                  description: { type: "string", example: "Course overview" },
                  materialType: { type: "string", enum: ["VIDEO", "PDF"], example: "VIDEO", description: "Material type" },
                  materialLink: { type: "string", format: "binary", description: "Upload material file" },
                  order: { type: "integer", minimum: 1, example: 1 },
                },
              },
            },
          },
        },
        responses: {
          ...json201(dataResponse("Item created successfully")),
          404: { description: "Section or teacher not found" },
        },
      },
    },
    "/api/v1/teacher/items/{sectionId}/items": {
      get: {
        summary: "Get all items in a section",
        tags: ["Teacher Items"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        responses: {
          ...json200(listResponse()),
          404: { description: "Section or teacher not found" },
        },
      },
    },
    "/api/v1/teacher/items/{sectionId}/{itemId}": {
      get: {
        summary: "Get an item by ID",
        tags: ["Teacher Items"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID"), uuidParam("itemId", "Item ID")],
        responses: {
          ...json200(dataResponse("Item retrieved")),
          404: { description: "Item or section not found" },
        },
      },
      patch: {
        summary: "Update an item",
        tags: ["Teacher Items"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID"), uuidParam("itemId", "Item ID")],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Updated Video Title" },
                  description: { type: "string" },
                  materialType: { type: "string", enum: ["VIDEO", "PDF"] },
                  materialLink: { type: "string", format: "binary", description: "Replace material file" },
                  order: { type: "integer", minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("Item updated")),
          404: { description: "Item or section not found" },
        },
      },
      delete: {
        summary: "Delete an item",
        tags: ["Teacher Items"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID"), uuidParam("itemId", "Item ID")],
        responses: {
          ...json200(msgResponse("Item deleted")),
          404: { description: "Item or section not found" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // TEACHER QUIZZES  (/api/v1/teacher/quizes)
    // ───────────────────────────────────────────────────────────
    "/api/v1/teacher/quizes/{sectionId}/quiz": {
      post: {
        summary: "Create a quiz for a section",
        tags: ["Teacher Quizzes"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "duration", "passingScore", "questions"],
                properties: {
                  title: { type: "string", example: "JavaScript Basics Quiz" },
                  description: { type: "string", example: "Test your JS knowledge" },
                  duration: { type: "integer", minimum: 1, example: 30, description: "Duration in minutes" },
                  passingScore: { type: "integer", minimum: 0, maximum: 100, example: 70, description: "Minimum score to pass (0-100)" },
                  questions: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["type", "text"],
                      properties: {
                        type: { type: "string", enum: ["MCQ", "TRUE_FALSE", "WRITTEN"], example: "MCQ" },
                        text: { type: "string", example: "What is JavaScript?" },
                        options: {
                          type: "array",
                          minItems: 2,
                          items: {
                            type: "object",
                            required: ["text", "isCorrect"],
                            properties: {
                              text: { type: "string", example: "A programming language" },
                              isCorrect: { type: "boolean", example: true },
                            },
                          },
                          description: "Required for MCQ and TRUE_FALSE types",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          ...json201(dataResponse("Quiz created successfully")),
          404: { description: "Section or teacher not found" },
        },
      },
      patch: {
        summary: "Update a quiz",
        tags: ["Teacher Quizzes"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  title: { type: "string", example: "Updated Quiz Title" },
                  description: { type: "string", example: "Updated description" },
                  duration: { type: "integer", minimum: 1, example: 45 },
                  passingScore: { type: "integer", minimum: 1, maximum: 100, example: 75 },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("Quiz updated")),
          400: { description: "At least one field is required" },
          404: { description: "Quiz or section not found" },
        },
      },
    },
    "/api/v1/teacher/quizes/{sectionId}/quize/{questionId}": {
      patch: {
        summary: "Update a question in a quiz",
        tags: ["Teacher Quizzes"],
        security: bearerSecurity,
        parameters: [
          uuidParam("sectionId", "Section ID"),
          uuidParam("questionId", "Question ID"),
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  text: { type: "string", example: "Updated question text?", description: "New question text" },
                  correctOptionId: { type: "string", format: "uuid", description: "ID of the correct option" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("Question updated")),
          404: { description: "Question or section not found" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN AUTH  (/api/v1/admin/auth)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/auth/login": {
      post: {
        summary: "Admin login",
        tags: ["Admin Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "admin@learnx.com" },
                  password: { type: "string", format: "password", example: "Password@123!" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("Login successful")),
          404: { description: "Invalid login data" },
        },
      },
    },
    "/api/v1/admin/auth/refresh-token": {
      get: {
        summary: "Refresh admin access token",
        tags: ["Admin Auth"],
        security: bearerSecurity,
        responses: json200(dataResponse("Token refreshed")),
      },
    },
    "/api/v1/admin/auth/logout": {
      post: {
        summary: "Admin logout",
        tags: ["Admin Auth"],
        security: bearerSecurity,
        responses: json200(msgResponse("Logged out successfully")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN STUDENTS  (/api/v1/admin/students)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/students": {
      post: {
        summary: "Create a student",
        tags: ["Admin Students"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password", "phone"],
                properties: {
                  fullName: { type: "string", example: "Ahmed Mohamed" },
                  email: { type: "string", format: "email", example: "student@learnx.com" },
                  password: { type: "string", format: "password", example: "Password@123!" },
                  phone: { type: "string", example: "+201012345678" },
                },
              },
            },
          },
        },
        responses: {
          ...json201(dataResponse("Student created")),
          409: { description: "Email already exists" },
        },
      },
      get: {
        summary: "Get all students",
        tags: ["Admin Students"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/students/export": {
      get: {
        summary: "Export students as file",
        tags: ["Admin Students"],
        security: bearerSecurity,
        responses: { 200: { description: "File download" } },
      },
    },
    "/api/v1/admin/students/{studentId}": {
      get: {
        summary: "Get student by ID",
        tags: ["Admin Students"],
        security: bearerSecurity,
        parameters: [uuidParam("studentId", "Student ID")],
        responses: {
          ...json200(dataResponse("Student retrieved")),
          404: { description: "Student not found" },
        },
      },
      patch: {
        summary: "Update student",
        tags: ["Admin Students"],
        security: bearerSecurity,
        parameters: [uuidParam("studentId", "Student ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { fullName: { type: "string" }, phone: { type: "string" } } },
            },
          },
        },
        responses: json200(dataResponse("Student updated")),
      },
      delete: {
        summary: "Delete student",
        tags: ["Admin Students"],
        security: bearerSecurity,
        parameters: [uuidParam("studentId", "Student ID")],
        responses: json200(msgResponse("Student deleted")),
      },
    },
    "/api/v1/admin/students/{studentId}/status": {
      patch: {
        summary: "Change student status",
        tags: ["Admin Students"],
        security: bearerSecurity,
        parameters: [uuidParam("studentId", "Student ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["status"], properties: { status: { type: "string", example: "ACTIVE" } } },
            },
          },
        },
        responses: json200(msgResponse("Status updated")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN TEACHERS  (/api/v1/admin/teachers)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/teachers": {
      post: {
        summary: "Create a teacher",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "phone", "subject"],
                properties: {
                  fullName: { type: "string", example: "Dr. Ahmed" },
                  email: { type: "string", format: "email", example: "teacher@learnx.com" },
                  password: { type: "string", format: "password", example: "Password@123!" },
                  phone: { type: "string", example: "+201012345678" },
                  subject: { type: "string", example: "Physics" },
                },
              },
            },
          },
        },
        responses: json201(dataResponse("Teacher created")),
      },
      get: {
        summary: "Get all teachers",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/teachers/export": {
      get: {
        summary: "Export teachers as file",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        responses: { 200: { description: "File download" } },
      },
    },
    "/api/v1/admin/teachers/{teacherId}": {
      get: {
        summary: "Get teacher by ID",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        responses: {
          ...json200(dataResponse("Teacher retrieved")),
          404: { description: "Teacher not found" },
        },
      },
      patch: {
        summary: "Update teacher",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { fullName: { type: "string" }, subject: { type: "string" } } },
            },
          },
        },
        responses: json200(dataResponse("Teacher updated")),
      },
      delete: {
        summary: "Delete teacher",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        responses: json200(msgResponse("Teacher deleted")),
      },
    },
    "/api/v1/admin/teachers/{teacherId}/assign-courses": {
      patch: {
        summary: "Assign courses to a teacher",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["courseIds"],
                properties: { courseIds: { type: "array", items: { type: "string", format: "uuid" } } },
              },
            },
          },
        },
        responses: json200(msgResponse("Courses assigned")),
      },
    },
    "/api/v1/admin/teachers/{teacherId}/cv": {
      patch: {
        summary: "Update teacher CV",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["cvUrl"],
                properties: { cvUrl: { type: "string", format: "binary", description: "New CV file" } },
              },
            },
          },
        },
        responses: json200(msgResponse("CV updated")),
      },
    },
    "/api/v1/admin/teachers/requests/{teacherId}/approve": {
      patch: {
        summary: "Approve teacher signup request",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        responses: json200(msgResponse("Teacher approved")),
      },
    },
    "/api/v1/admin/teachers/requests/{teacherId}/reject": {
      patch: {
        summary: "Reject teacher signup request",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { reason: { type: "string", example: "Incomplete documents" } } },
            },
          },
        },
        responses: json200(msgResponse("Teacher rejected")),
      },
    },
    "/api/v1/admin/teachers/certificate/{certificateId}/verify": {
      patch: {
        summary: "Verify a teacher certificate",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("certificateId", "Certificate ID")],
        responses: {
          ...json200(msgResponse("Certificate verified")),
          404: { description: "Certificate not found" },
        },
      },
    },
    "/api/v1/admin/teachers/certificate/{certificateId}/reject": {
      patch: {
        summary: "Reject a teacher certificate",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("certificateId", "Certificate ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { reason: { type: "string", example: "Certificate is not valid" } },
              },
            },
          },
        },
        responses: {
          ...json200(msgResponse("Certificate rejected")),
          404: { description: "Certificate not found" },
        },
      },
    },
    "/api/v1/admin/teachers/{courseId}/change-status": {
      patch: {
        summary: "Change teacher-course status (approve/reject)",
        tags: ["Admin Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "TeacherCourse ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["APPROVED", "REJECTED"], example: "APPROVED" },
                  rejectionReason: { type: "string", example: "Content quality issue", description: "Required when status is REJECTED" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("Status updated")),
          404: { description: "Course not found" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN CATEGORIES  (/api/v1/admin/categories)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/categories": {
      get: {
        summary: "Get all categories",
        tags: ["Admin Categories"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
      post: {
        summary: "Create a category",
        tags: ["Admin Categories"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Programming" },
                  image: { type: "string", format: "binary", description: "Category image" },
                },
              },
            },
          },
        },
        responses: json201(dataResponse("Category created")),
      },
    },
    "/api/v1/admin/categories/{categoryId}": {
      get: {
        summary: "Get category by ID",
        tags: ["Admin Categories"],
        security: bearerSecurity,
        parameters: [uuidParam("categoryId", "Category ID")],
        responses: json200(dataResponse("Category retrieved")),
      },
      patch: {
        summary: "Update category",
        tags: ["Admin Categories"],
        security: bearerSecurity,
        parameters: [uuidParam("categoryId", "Category ID")],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Updated Name" },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: json200(dataResponse("Category updated")),
      },
      delete: {
        summary: "Delete category",
        tags: ["Admin Categories"],
        security: bearerSecurity,
        parameters: [uuidParam("categoryId", "Category ID")],
        responses: json200(msgResponse("Category deleted")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN COURSES  (/api/v1/admin/courses)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/courses": {
      post: {
        summary: "Create a course",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "description", "price"],
                properties: {
                  name: { type: "string", example: "Full Stack Bootcamp" },
                  description: { type: "string", example: "Learn everything about web dev" },
                  price: { type: "number", example: 299.99 },
                  thumbnail: { type: "string", format: "binary", description: "Course thumbnail image" },
                  previewVideo: { type: "string", format: "binary", description: "Course preview video (max 100MB)" },
                },
              },
            },
          },
        },
        responses: json201(dataResponse("Course created")),
      },
      get: {
        summary: "Get all courses",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/courses/{courseId}": {
      get: {
        summary: "Get course by ID",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        responses: json200(dataResponse("Course retrieved")),
      },
      patch: {
        summary: "Update course",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  thumbnail: { type: "string", format: "binary" },
                  previewVideo: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: json200(dataResponse("Course updated")),
      },
      delete: {
        summary: "Delete course",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        responses: json200(msgResponse("Course deleted")),
      },
    },
    "/api/v1/admin/courses/{courseId}/status": {
      patch: {
        summary: "Update course status",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: { status: { type: "string", example: "PUBLISHED" } },
              },
            },
          },
        },
        responses: json200(msgResponse("Status updated")),
      },
    },
    "/api/v1/admin/courses/{courseId}/sections": {
      post: {
        summary: "Create a section in a course (Admin)",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string", example: "Module 1" }, order: { type: "integer", example: 1 } },
              },
            },
          },
        },
        responses: json201(dataResponse("Section created")),
      },
    },
    "/api/v1/admin/courses/sections/{sectionId}": {
      patch: {
        summary: "Update a course section (Admin)",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { name: { type: "string" }, order: { type: "integer" } } },
            },
          },
        },
        responses: json200(dataResponse("Section updated")),
      },
      delete: {
        summary: "Delete a course section (Admin)",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        responses: json200(msgResponse("Section deleted")),
      },
    },
    "/api/v1/admin/courses/sections/{sectionId}/lessons": {
      post: {
        summary: "Create a lesson in a section (Admin)",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: { title: { type: "string", example: "Lesson 1" }, order: { type: "integer", example: 1 } },
              },
            },
          },
        },
        responses: json201(dataResponse("Lesson created")),
      },
    },
    "/api/v1/admin/courses/lessons/{lessonId}": {
      patch: {
        summary: "Update a lesson (Admin)",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("lessonId", "Lesson ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { title: { type: "string" }, order: { type: "integer" } } },
            },
          },
        },
        responses: json200(dataResponse("Lesson updated")),
      },
      delete: {
        summary: "Delete a lesson (Admin)",
        tags: ["Admin Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("lessonId", "Lesson ID")],
        responses: json200(msgResponse("Lesson deleted")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN STAFF  (/api/v1/admin/staff)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/staff": {
      post: {
        summary: "Create a staff member",
        tags: ["Admin Staff"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password", "roleId"],
                properties: {
                  fullName: { type: "string", example: "Sara Ahmed" },
                  email: { type: "string", format: "email", example: "staff@learnx.com" },
                  password: { type: "string", format: "password", example: "Password@123!" },
                  roleId: { type: "string", format: "uuid", description: "Assigned role ID" },
                },
              },
            },
          },
        },
        responses: json201(dataResponse("Staff created")),
      },
      get: {
        summary: "Get all staff members",
        tags: ["Admin Staff"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/staff/roles": {
      get: {
        summary: "Get available staff roles",
        tags: ["Admin Staff"],
        security: bearerSecurity,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/staff/export": {
      get: {
        summary: "Export staff list as file",
        tags: ["Admin Staff"],
        security: bearerSecurity,
        responses: { 200: { description: "File download" } },
      },
    },
    "/api/v1/admin/staff/{staffId}": {
      get: {
        summary: "Get staff member by ID",
        tags: ["Admin Staff"],
        security: bearerSecurity,
        parameters: [uuidParam("staffId", "Staff ID")],
        responses: json200(dataResponse("Staff member retrieved")),
      },
      patch: {
        summary: "Update staff member",
        tags: ["Admin Staff"],
        security: bearerSecurity,
        parameters: [uuidParam("staffId", "Staff ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { fullName: { type: "string" }, roleId: { type: "string" } } },
            },
          },
        },
        responses: json200(dataResponse("Staff updated")),
      },
      delete: {
        summary: "Delete staff member",
        tags: ["Admin Staff"],
        security: bearerSecurity,
        parameters: [uuidParam("staffId", "Staff ID")],
        responses: json200(msgResponse("Staff deleted")),
      },
    },
    "/api/v1/admin/staff/{staffId}/status": {
      patch: {
        summary: "Change staff member status",
        tags: ["Admin Staff"],
        security: bearerSecurity,
        parameters: [uuidParam("staffId", "Staff ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["status"], properties: { status: { type: "string", example: "ACTIVE" } } },
            },
          },
        },
        responses: json200(msgResponse("Status updated")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN ROLES  (/api/v1/admin/roles)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/roles": {
      post: {
        summary: "Create a role",
        tags: ["Admin Roles"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "permissions"],
                properties: {
                  name: { type: "string", example: "Moderator" },
                  permissions: { type: "array", items: { type: "string" }, example: ["students.read", "courses.read"] },
                },
              },
            },
          },
        },
        responses: json201(dataResponse("Role created")),
      },
      get: {
        summary: "Get all roles",
        tags: ["Admin Roles"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/roles/{roleId}": {
      get: {
        summary: "Get role by ID",
        tags: ["Admin Roles"],
        security: bearerSecurity,
        parameters: [uuidParam("roleId", "Role ID")],
        responses: json200(dataResponse("Role retrieved")),
      },
      patch: {
        summary: "Update role",
        tags: ["Admin Roles"],
        security: bearerSecurity,
        parameters: [uuidParam("roleId", "Role ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  permissions: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: json200(dataResponse("Role updated")),
      },
      delete: {
        summary: "Delete role",
        tags: ["Admin Roles"],
        security: bearerSecurity,
        parameters: [uuidParam("roleId", "Role ID")],
        responses: json200(msgResponse("Role deleted")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN COUPONS  (/api/v1/admin/coupons)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/coupons": {
      post: {
        summary: "Create a coupon",
        tags: ["Admin Coupons"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "discountType", "discountValue"],
                properties: {
                  code: { type: "string", example: "SAVE20" },
                  discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"], example: "PERCENTAGE" },
                  discountValue: { type: "number", example: 20 },
                  expiresAt: { type: "string", format: "date-time", example: "2025-12-31T23:59:59Z" },
                  maxUsage: { type: "integer", example: 100 },
                },
              },
            },
          },
        },
        responses: json201(dataResponse("Coupon created")),
      },
      get: {
        summary: "Get all coupons",
        tags: ["Admin Coupons"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/coupons/{id}": {
      get: {
        summary: "Get coupon by ID",
        tags: ["Admin Coupons"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Coupon ID")],
        responses: json200(dataResponse("Coupon retrieved")),
      },
      patch: {
        summary: "Update coupon",
        tags: ["Admin Coupons"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Coupon ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  discountValue: { type: "number" },
                  expiresAt: { type: "string", format: "date-time" },
                  maxUsage: { type: "integer" },
                },
              },
            },
          },
        },
        responses: json200(dataResponse("Coupon updated")),
      },
      delete: {
        summary: "Delete coupon",
        tags: ["Admin Coupons"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Coupon ID")],
        responses: json200(msgResponse("Coupon deleted")),
      },
    },
    "/api/v1/admin/coupons/{id}/toggle-status": {
      patch: {
        summary: "Toggle coupon active/inactive status",
        tags: ["Admin Coupons"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Coupon ID")],
        responses: json200(msgResponse("Coupon status toggled")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN OFFERS  (/api/v1/admin/offers)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/offers": {
      post: {
        summary: "Create an offer",
        tags: ["Admin Offers"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "discountPercentage"],
                properties: {
                  title: { type: "string", example: "Summer Sale" },
                  discountPercentage: { type: "number", minimum: 0, maximum: 100, example: 30 },
                  startDate: { type: "string", format: "date-time" },
                  endDate: { type: "string", format: "date-time" },
                  courseIds: { type: "array", items: { type: "string", format: "uuid" } },
                },
              },
            },
          },
        },
        responses: json201(dataResponse("Offer created")),
      },
      get: {
        summary: "Get all offers",
        tags: ["Admin Offers"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/offers/{offerId}": {
      get: {
        summary: "Get offer by ID",
        tags: ["Admin Offers"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer ID")],
        responses: json200(dataResponse("Offer retrieved")),
      },
      patch: {
        summary: "Update offer",
        tags: ["Admin Offers"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { title: { type: "string" }, discountPercentage: { type: "number" } },
              },
            },
          },
        },
        responses: json200(dataResponse("Offer updated")),
      },
      delete: {
        summary: "Delete offer",
        tags: ["Admin Offers"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer ID")],
        responses: json200(msgResponse("Offer deleted")),
      },
    },
    "/api/v1/admin/offers/{offerId}/status": {
      patch: {
        summary: "Change offer status",
        tags: ["Admin Offers"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["status"], properties: { status: { type: "string", example: "ACTIVE" } } },
            },
          },
        },
        responses: json200(msgResponse("Offer status updated")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN ACTIVITY LOGS  (/api/v1/admin/activityLogs)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/activityLogs": {
      get: {
        summary: "Get all activity logs",
        tags: ["Admin Activity Logs"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/activityLogs/stats": {
      get: {
        summary: "Get activity log statistics",
        tags: ["Admin Activity Logs"],
        security: bearerSecurity,
        responses: json200(dataResponse("Stats retrieved")),
      },
    },
    "/api/v1/admin/activityLogs/{id}": {
      get: {
        summary: "Get activity log by ID",
        tags: ["Admin Activity Logs"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Activity Log ID")],
        responses: json200(dataResponse("Log retrieved")),
      },
    },

    // ───────────────────────────────────────────────────────────
    // ADMIN SETTINGS  (/api/v1/admin/settings)
    // ───────────────────────────────────────────────────────────
    "/api/v1/admin/settings/app-info": {
      patch: {
        summary: "Update app info (name, logo, contact…)",
        tags: ["Admin Settings"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  logo_url: { type: "string", format: "binary", description: "App logo image" },
                  appName: { type: "string", example: "LearnX" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string", example: "+201012345678" },
                },
              },
            },
          },
        },
        responses: json200(dataResponse("App info updated")),
      },
    },
    "/api/v1/admin/settings/pages": {
      get: {
        summary: "Get all CMS pages (admin)",
        tags: ["Admin Settings"],
        security: bearerSecurity,
        responses: json200(listResponse()),
      },
    },
    "/api/v1/admin/settings/pages/{slug}": {
      patch: {
        summary: "Update a CMS page by slug",
        tags: ["Admin Settings"],
        security: bearerSecurity,
        parameters: [
          { in: "path", name: "slug", required: true, schema: { type: "string" }, example: "about-us", description: "Page slug" },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "About Us" },
                  content: { type: "string", example: "<h1>About Us</h1>" },
                  locale: { type: "string", enum: ["ar", "en", "fr"], example: "ar" },
                },
              },
            },
          },
        },
        responses: {
          ...json200(dataResponse("Page updated")),
          404: { description: "Page not found" },
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // NOTIFICATIONS  (/api/v1/notification)
    // ───────────────────────────────────────────────────────────
    "/api/v1/notification": {
      get: {
        summary: "Get all notifications",
        tags: ["Notifications"],
        security: bearerSecurity,
        parameters: paginationParams,
        responses: json200(listResponse()),
      },
      post: {
        summary: "Create / send a notification",
        tags: ["Notifications"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "body"],
                properties: {
                  title: { type: "string", example: "New course available!" },
                  body: { type: "string", example: "Check out our latest course on Python." },
                  targetUserIds: { type: "array", items: { type: "string", format: "uuid" }, description: "Optional - send to specific users" },
                },
              },
            },
          },
        },
        responses: json201(msgResponse("Notification sent")),
      },
    },
    "/api/v1/notification/read-all": {
      patch: {
        summary: "Mark all notifications as read",
        tags: ["Notifications"],
        security: bearerSecurity,
        responses: json200(msgResponse("All notifications marked as read")),
      },
    },
    "/api/v1/notification/{id}/read": {
      patch: {
        summary: "Mark a notification as read",
        tags: ["Notifications"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Notification ID")],
        responses: json200(msgResponse("Notification marked as read")),
      },
    },
    "/api/v1/notification/{id}": {
      delete: {
        summary: "Delete a notification",
        tags: ["Notifications"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Notification ID")],
        responses: json200(msgResponse("Notification deleted")),
      },
    },
    "/api/v1/student/cart": {
      get: {
        summary: "Get student cart",
        description: "Returns the authenticated student's cart with enriched item details (course title, thumbnail, instructor). Locale is controlled via `locale` query param or `Accept-Language` header.",
        tags: ["Student Cart"],
        security: bearerSecurity,
        parameters: [
          { in: "query", name: "locale", schema: { type: "string", enum: ["ar", "en"], default: "ar" }, description: "Translation locale" },
        ],
        responses: {
          ...json200({
            type: "object",
            properties: {
              message: { type: "string", example: "SUCCESS" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
                  totalItems: { type: "integer", example: 2 },
                  totalPrice: { type: "integer", example: 350 },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        type: { type: "string", enum: ["COURSE", "TEACHER_COURSE"] },
                        itemId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                        course: { type: "object", description: "Enriched course details" },
                      },
                    },
                  },
                },
              },
            },
          }),
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/v1/student/cart/add": {
      post: {
        summary: "Add item to cart",
        description: "Adds a COURSE or TEACHER_COURSE to the student's cart. Validates that the course is published/approved, is not free (for COURSE type), and the student is not already enrolled.",
        tags: ["Student Cart"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["type", "itemId"],
                properties: {
                  type: { type: "string", enum: ["COURSE", "TEACHER_COURSE"], example: "COURSE", description: "Type of item to add" },
                  itemId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000", description: "Course or TeacherCourse ID" },
                },
              },
            },
          },
        },
        responses: {
          ...json201({
            type: "object",
            properties: {
              message: { type: "string", example: "ITEM_ADDED_TO_CART" },
              data: { type: "object", description: "Updated cart object" },
            },
          }),
          400: { description: "Course not published / free course / invalid type" },
          401: { description: "Unauthorized" },
          409: { description: "Item already in cart or already enrolled" },
        },
      },
    },

    "/api/v1/student/cart/remove/{itemId}": {
      delete: {
        summary: "Remove item from cart",
        description: "Removes a single CartItem by its own ID (not the course ID). Cart totals are recalculated automatically.",
        tags: ["Student Cart"],
        security: bearerSecurity,
        parameters: [uuidParam("itemId", "CartItem ID (not the course ID)")],
        responses: {
          ...json200({
            type: "object",
            properties: {
              message: { type: "string", example: "ITEM_REMOVED_FROM_CART" },
              data: { type: "object", description: "Updated cart object" },
            },
          }),
          401: { description: "Unauthorized" },
          404: { description: "Cart or item not found" },
        },
      },
    },

    "/api/v1/student/cart/clear": {
      delete: {
        summary: "Clear cart",
        description: "Removes all items from the student's cart and resets totals to zero.",
        tags: ["Student Cart"],
        security: bearerSecurity,
        responses: {
          ...json200({
            type: "object",
            properties: {
              message: { type: "string", example: "CART_CLEARED" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  totalItems: { type: "integer", example: 0 },
                  totalPrice: { type: "integer", example: 0 },
                  items: { type: "array", items: {}, example: [] },
                },
              },
            },
          }),
          401: { description: "Unauthorized" },
          404: { description: "Cart not found" },
        },
      },
    },
  },
};

export const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "LearnX API Docs",
    })
  );

  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
