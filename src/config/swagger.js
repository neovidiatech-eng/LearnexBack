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
    { name: "Notifications", description: "Notification management" },
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
    // TEACHER ITEMS  (/api/v1/teacher/sections/:sectionId/items)
    // ───────────────────────────────────────────────────────────
    "/api/v1/teacher/sections/{sectionId}/items": {
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
                  materialType: { type: "string", example: "video", description: "e.g. video, pdf, quiz" },
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
