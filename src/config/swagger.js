import swaggerUi from "swagger-ui-express";

// ═══════════════════════════════════════════════════════════════
//  Reusable Parameter & Helper Definitions
// ═══════════════════════════════════════════════════════════════
const uuidParam = (name, description, example = "550e8400-e29b-41d4-a716-446655440000") => ({
  in: "path",
  name,
  required: true,
  schema: { type: "string", format: "uuid" },
  description,
  example,
});

const stringPathParam = (name, description, example = "slug-name") => ({
  in: "path",
  name,
  required: true,
  schema: { type: "string" },
  description,
  example,
});

const paginationQueryParams = [
  {
    in: "query",
    name: "page",
    schema: { type: "integer", minimum: 1, default: 1 },
    description: "Page number for pagination",
    example: 1,
  },
  {
    in: "query",
    name: "limit",
    schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
    description: "Number of records per page",
    example: 10,
  },
  {
    in: "query",
    name: "search",
    schema: { type: "string" },
    description: "Search keyword",
    example: "JavaScript",
  },
];

const localeQueryParam = {
  in: "query",
  name: "locale",
  schema: { type: "string", enum: ["ar", "en", "fr"], default: "ar" },
  description: "Response language / translation locale",
  example: "ar",
};

const bearerSecurity = [{ BearerAuth: [] }];

// Reusable standard responses
const standardResponses = {
  200: (schemaRef, description = "Request completed successfully") => ({
    200: {
      description,
      content: { "application/json": { schema: schemaRef } },
    },
  }),
  201: (schemaRef, description = "Resource created successfully") => ({
    201: {
      description,
      content: { "application/json": { schema: schemaRef } },
    },
  }),
  204: (description = "Deleted successfully (No content)") => ({
    204: { description },
  }),
  400: {
    description: "Validation error or Bad Request",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
      },
    },
  },
  401: {
    description: "Unauthorized (Missing or invalid access token)",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UnauthorizedErrorResponse" },
      },
    },
  },
  403: {
    description: "Forbidden (Insufficient permissions or account inactive/pending)",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ForbiddenErrorResponse" },
      },
    },
  },
  404: {
    description: "Resource Not Found",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/NotFoundErrorResponse" },
      },
    },
  },
  409: {
    description: "Conflict (Email already exists, unique constraint violation)",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ConflictErrorResponse" },
      },
    },
  },
  500: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/InternalServerErrorResponse" },
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
//  Full OpenAPI Specification (3.0.0)
// ═══════════════════════════════════════════════════════════════
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "LearnX LMS API Documentation 🚀",
    version: "1.0.0",
    description: `
# 📚 LearnX Learning Management System API

Welcome to the **LearnX LMS** interactive API documentation. This reference provides frontend developers with full visibility over all routes, schemas, headers, authentication flows, error codes, and sample payloads.

---

### 🔑 Test Accounts & Default Seed Credentials

Use these pre-seeded credentials to quickly authenticate and test endpoints:

| Role | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| 👑 **Super Admin** | \`admin@learnex.com\` | \`Admin@123456\` | Full admin privileges (Users, Courses, Staff, Roles, CMS, Settings) |
| 👨‍🏫 **Teacher 1** | \`ahmed.hassan@learnex.com\` | \`Teacher@123456\` | Web Development Instructor (Approved & Active) |
| 👨‍🏫 **Teacher 2** | \`sara.ibrahim@learnex.com\` | \`Teacher@123456\` | Data Science Instructor (Approved & Active) |
| 👨‍🏫 **Teacher 3** | \`omar.ali@learnex.com\` | \`Teacher@123456\` | Mobile Development Instructor (Approved & Active) |
| 🎓 **Student 1** | \`youssef.mahmoud@learnex.com\` | \`Student@123456\` | Active Student with active enrollments & cart |
| 🎓 **Student 2** | \`nour.khaled@learnex.com\` | \`Student@123456\` | Active Student |
| 🎓 **Student 3** | \`karim.mostafa@learnex.com\` | \`Student@123456\` | Active Student |

---

### 🛡️ Authentication Guide (Bearer JWT)

1. Call the corresponding login endpoint:
   - **Admin:** \`POST /api/v1/admin/auth/login\`
   - **Teacher:** \`POST /api/v1/teacher/auth/login\`
   - **Student:** \`POST /api/v1/student/auth/login\`
2. Retrieve the \`accessToken\` from the response.
3. Click the **Authorize** 🔓 button at the top right of this page and enter:
   \`\`\`text
   Bearer <your_access_token>
   \`\`\`
4. When access token expires, pass the \`refreshToken\` in the \`Authorization\` header to the corresponding \`/refresh-token\` route to get a new pair.

---

### 🌐 Global Headers & Localization

- \`Authorization\`: \`Bearer <jwt_token>\` (For authenticated routes)
- \`Accept-Language\`: \`ar\` (Arabic, default) | \`en\` (English) | \`fr\` (French)
- \`Content-Type\`: \`application/json\` or \`multipart/form-data\` (for file uploads)

---

### 📦 Standard Response Architecture

- **Success Response Structure:**
  \`\`\`json
  {
    "message": "SUCCESS_MESSAGE_KEY",
    "data": { ... }
  }
  \`\`\`
- **Standard Error Response:**
  \`\`\`json
  {
    "message": "ERROR_MESSAGE_KEY",
    "status": 400,
    "success": false
  }
  \`\`\`
- **Validation Error (HTTP 400):**
  \`\`\`json
  {
    "error_message": "VALIDATION_ERROR",
    "validationError": [
      {
        "key": "body",
        "details": [
          { "message": "Email is required", "path": "email" }
        ]
      }
    ]
  }
  \`\`\`
    `,
    contact: {
      name: "LearnX Tech Team",
      email: "support@learnex.com",
    },
  },
  servers: [
    { url: "https://learnx.agro-plus.net", description: "Production Server" },
    { url: "http://localhost:3000", description: "Local Development Server (Port 3000)" },
    { url: "http://localhost:3015", description: "Docker Local Server (Port 3015)" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
    },
    schemas: {
      // ─────────────────────────────────────────────────────────
      // Base / Shared Response Schemas
      // ─────────────────────────────────────────────────────────
      SuccessMessageResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "OPERATION_SUCCESSFUL" },
        },
      },
      GenericSuccessDataResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: { type: "object", description: "Response payload data" },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          totalCount: { type: "integer", example: 45 },
          totalPages: { type: "integer", example: 5 },
          currentPage: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          hasNextPage: { type: "boolean", example: true },
          hasPrevPage: { type: "boolean", example: false },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        properties: {
          error_message: { type: "string", example: "VALIDATION_ERROR" },
          validationError: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string", example: "body" },
                details: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "EMAIL_REQUIRED" },
                      path: { type: "string", example: "email" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      UnauthorizedErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "UNAUTHORIZED" },
          status: { type: "integer", example: 401 },
          success: { type: "boolean", example: false },
        },
      },
      ForbiddenErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "FORBIDDEN" },
          status: { type: "integer", example: 403 },
          success: { type: "boolean", example: false },
        },
      },
      NotFoundErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "RESOURCE_NOT_FOUND" },
          status: { type: "integer", example: 404 },
          success: { type: "boolean", example: false },
        },
      },
      ConflictErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "EMAIL_ALREADY_EXISTS" },
          status: { type: "integer", example: 409 },
          success: { type: "boolean", example: false },
        },
      },
      InternalServerErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "INTERNAL_SERVER_ERROR" },
          status: { type: "integer", example: 500 },
          success: { type: "boolean", example: false },
        },
      },

      // ─────────────────────────────────────────────────────────
      // 🎓 Student DTOs
      // ─────────────────────────────────────────────────────────
      StudentSignupDTO: {
        type: "object",
        required: ["fullName", "email", "password", "confirmPassword", "phone"],
        properties: {
          fullName: { type: "string", example: "Youssef Mahmoud" },
          email: { type: "string", format: "email", example: "student@learnex.com" },
          password: { type: "string", format: "password", example: "Student@123456" },
          confirmPassword: { type: "string", format: "password", example: "Student@123456" },
          phone: { type: "string", example: "+201334567890" },
        },
      },
      LoginDTO: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "student@learnex.com" },
          password: { type: "string", format: "password", example: "Student@123456" },
        },
      },
      ConfirmEmailDTO: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email", example: "student@learnex.com" },
          otp: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
        },
      },
      ForgotPasswordDTO: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "student@learnex.com" },
        },
      },
      ResetPasswordDTO: {
        type: "object",
        required: ["email", "otp", "password", "confirmPassword"],
        properties: {
          email: { type: "string", format: "email", example: "student@learnex.com" },
          otp: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
          password: { type: "string", format: "password", example: "NewPassword@123!" },
          confirmPassword: { type: "string", format: "password", example: "NewPassword@123!" },
        },
      },
      StudentUpdateProfileDTO: {
        type: "object",
        properties: {
          fullName: { type: "string", example: "Youssef Mahmoud Updated" },
          email: { type: "string", format: "email", example: "youssef.updated@learnex.com" },
          phone: { type: "string", example: "+201334567890" },
          dateOfBirth: { type: "string", format: "date", example: "1998-05-15" },
        },
      },
      StudentChangePasswordDTO: {
        type: "object",
        required: ["oldPassword", "password"],
        properties: {
          oldPassword: { type: "string", format: "password", example: "Student@123456" },
          password: { type: "string", format: "password", example: "NewPass@123456" },
        },
      },
      StudentAddToCartDTO: {
        type: "object",
        required: ["type", "itemId"],
        properties: {
          type: { type: "string", enum: ["COURSE", "TEACHER_COURSE"], example: "COURSE" },
          itemId: { type: "string", format: "uuid", example: "8d94f276-88cf-4ef8-a5b7-7e61d85f7911" },
        },
      },

      // ─────────────────────────────────────────────────────────
      // 👨‍🏫 Teacher DTOs
      // ─────────────────────────────────────────────────────────
      TeacherSignupDTO: {
        type: "object",
        required: ["email", "password", "phone", "subject"],
        properties: {
          fullName: { type: "string", example: "Dr. Ahmed Hassan" },
          firstName: { type: "string", example: "Ahmed" },
          lastName: { type: "string", example: "Hassan" },
          email: { type: "string", format: "email", example: "ahmed.hassan@learnex.com" },
          password: { type: "string", format: "password", example: "Teacher@123456" },
          phone: { type: "string", example: "+201001234567" },
          subject: { type: "string", example: "Web Development" },
          experienceYears: { type: "integer", minimum: 0, example: 7 },
          linkedinUrl: { type: "string", format: "uri", example: "https://linkedin.com/in/ahmed-hassan" },
          headline: { type: "string", example: "Senior Full Stack Instructor" },
          bio: { type: "string", example: "7+ years teaching React, Node.js, and Modern Web Architecture." },
          locale: { type: "string", enum: ["ar", "en"], default: "ar" },
          cvUrl: { type: "string", format: "binary", description: "CV file (PDF, Doc, Image up to 100MB)" },
          introVideoUrl: { type: "string", format: "binary", description: "Intro video file" },
        },
      },
      TeacherUpdateProfileDTO: {
        type: "object",
        properties: {
          fullName: { type: "string", example: "Ahmed Hassan" },
          email: { type: "string", format: "email", example: "ahmed.hassan@learnex.com" },
          phone: { type: "string", example: "+201001234567" },
          country: { type: "string", example: "EG" },
          subject: { type: "string", example: "Full Stack Web Development" },
          headline: { type: "string", example: "Lead Software Architect & Educator" },
          bio: { type: "string", example: "Over a decade of industry and mentorship experience." },
          experienceYears: { type: "integer", example: 8 },
          linkedinUrl: { type: "string", format: "uri", example: "https://linkedin.com/in/ahmed-hassan" },
          sessionPrice50Min: { type: "number", example: 45.00 },
          currency: { type: "string", example: "USD" },
        },
      },
      TeacherCertificateCreateDTO: {
        type: "object",
        required: ["type", "title", "issuer", "issueYear", "file"],
        properties: {
          type: { type: "string", enum: ["ACADEMIC", "PROFESSIONAL", "OTHER"], example: "ACADEMIC" },
          title: { type: "string", example: "B.Sc. in Computer Engineering" },
          issuer: { type: "string", example: "Cairo University" },
          issueYear: { type: "integer", example: 2020 },
          file: { type: "string", format: "binary", description: "Certificate file (PDF or Image, max 15MB)" },
        },
      },
      TeacherCourseCreateDTO: {
        type: "object",
        required: ["name", "description", "price", "totalHours"],
        properties: {
          name: { type: "string", example: "Modern React & Next.js Masterclass" },
          description: { type: "string", example: "Comprehensive course from basic JS to full stack SSR apps." },
          price: { type: "number", example: 49.99 },
          totalHours: { type: "integer", minimum: 0, example: 35 },
          wallPaper: { type: "string", format: "binary", description: "Course wallpaper / cover image" },
        },
      },
      TeacherSectionCreateDTO: {
        type: "object",
        required: ["name", "order"],
        properties: {
          name: { type: "string", example: "Section 1: Foundations & Architecture" },
          order: { type: "integer", minimum: 1, example: 1 },
        },
      },
      TeacherSectionReorderDTO: {
        type: "object",
        required: ["sections"],
        properties: {
          sections: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "order"],
              properties: {
                id: { type: "string", format: "uuid", example: "9f3f983a-86c3-42e1-88f6-5e58129df2be" },
                order: { type: "integer", example: 1 },
              },
            },
          },
        },
      },
      TeacherItemCreateDTO: {
        type: "object",
        required: ["title", "materialType"],
        properties: {
          title: { type: "string", example: "Lesson 1: Introduction & Tooling" },
          description: { type: "string", example: "Overview of required dev environments and prerequisites." },
          materialType: { type: "string", enum: ["VIDEO", "PDF"], example: "VIDEO" },
          materialLink: { type: "string", format: "binary", description: "Video or PDF material file" },
          order: { type: "integer", minimum: 1, example: 1 },
        },
      },
      TeacherQuizCreateDTO: {
        type: "object",
        required: ["title", "duration", "passingScore", "questions"],
        properties: {
          title: { type: "string", example: "Module 1 Assessment Quiz" },
          description: { type: "string", example: "Test your understanding of core concepts." },
          duration: { type: "integer", description: "Duration in minutes", example: 20 },
          passingScore: { type: "integer", minimum: 0, maximum: 100, example: 70 },
          questions: {
            type: "array",
            items: {
              type: "object",
              required: ["type", "text"],
              properties: {
                type: { type: "string", enum: ["MCQ", "TRUE_FALSE", "WRITTEN"], example: "MCQ" },
                text: { type: "string", example: "What is Virtual DOM in React?" },
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["text", "isCorrect"],
                    properties: {
                      text: { type: "string", example: "A lightweight JavaScript representation of the DOM" },
                      isCorrect: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      TeacherGradeSubmissionDTO: {
        type: "object",
        required: ["grades"],
        properties: {
          grades: {
            type: "array",
            items: {
              type: "object",
              required: ["answerId", "isCorrect"],
              properties: {
                answerId: { type: "string", format: "uuid", example: "d9e8f7a6-b5c4-3d2e-1f0a-9876543210ab" },
                isCorrect: { type: "boolean", example: true },
                feedback: { type: "string", example: "Great explanation of concepts!" },
              },
            },
          },
        },
      },

      // ─────────────────────────────────────────────────────────
      // 👑 Admin DTOs
      // ─────────────────────────────────────────────────────────
      AdminStudentCreateDTO: {
        type: "object",
        required: ["firstName", "lastName", "email", "password"],
        properties: {
          firstName: { type: "string", example: "Nour" },
          lastName: { type: "string", example: "Khaled" },
          email: { type: "string", format: "email", example: "nour.khaled@learnex.com" },
          password: { type: "string", format: "password", example: "Student@123456" },
          phone: { type: "string", example: "+201445678901" },
          country: { type: "string", example: "EG" },
          dateOfBirth: { type: "string", format: "date", example: "2000-09-22" },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED"], default: "ACTIVE" },
          notes: { type: "string", example: "Aspiring Data Science student." },
          courseIds: {
            type: "array",
            items: { type: "string", format: "uuid" },
            example: [],
          },
        },
      },
      AdminTeacherCreateDTO: {
        type: "object",
        required: ["firstName", "lastName", "email", "phone", "subject", "experienceYears"],
        properties: {
          firstName: { type: "string", example: "Sara" },
          lastName: { type: "string", example: "Ibrahim" },
          email: { type: "string", format: "email", example: "sara.ibrahim@learnex.com" },
          password: { type: "string", format: "password", example: "Teacher@123456" },
          phone: { type: "string", example: "+201112345678" },
          subject: { type: "string", example: "Data Science" },
          experienceYears: { type: "integer", example: 5 },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"], default: "ACTIVE" },
          bio: { type: "string", example: "Data scientist and ML engineer with 5 years experience." },
          linkedinUrl: { type: "string", format: "uri", example: "https://linkedin.com/in/sara-ibrahim" },
          country: { type: "string", example: "EG" },
          courseIds: { type: "array", items: { type: "string", format: "uuid" } },
        },
      },
      AdminCategoryCreateDTO: {
        type: "object",
        required: ["name", "description"],
        properties: {
          name: { type: "string", example: "Artificial Intelligence" },
          description: { type: "string", example: "Courses covering Machine Learning, Deep Learning, and GenAI." },
          slug: { type: "string", example: "artificial-intelligence" },
          locale: { type: "string", enum: ["ar", "en", "fr"], default: "en" },
          image: { type: "string", format: "binary", description: "Category banner icon / image" },
        },
      },
      AdminCourseCreateDTO: {
        type: "object",
        required: ["categoryId", "originalPrice", "translations"],
        properties: {
          categoryId: { type: "string", format: "uuid", example: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c" },
          instructorId: { type: "string", format: "uuid", example: "u1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c" },
          level: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"], default: "BEGINNER" },
          status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" },
          enrollmentType: { type: "string", enum: ["PAID", "FREE"], default: "PAID" },
          language: { type: "string", default: "english" },
          originalPrice: { type: "number", example: 99.99 },
          salePrice: { type: "number", example: 79.99 },
          currency: { type: "string", default: "USD" },
          durationHours: { type: "integer", example: 40 },
          totalLessonsCount: { type: "integer", example: 50 },
          tags: { type: "array", items: { type: "string" }, example: ["Python", "AI", "Machine Learning"] },
          hasCertificate: { type: "boolean", default: true },
          scheduledAt: { type: "string", format: "date-time" },
          thumbnail: { type: "string", format: "binary", description: "Course thumbnail image" },
          previewVideo: { type: "string", format: "binary", description: "Course trailer video" },
          translations: {
            type: "array",
            items: {
              type: "object",
              required: ["locale", "title", "description"],
              properties: {
                locale: { type: "string", enum: ["ar", "en", "fr"], example: "en" },
                title: { type: "string", example: "Python for Machine Learning Bootcamp" },
                description: { type: "string", example: "Master NumPy, Pandas, Scikit-Learn, and Deep Learning." },
                whatYouWillLearn: { type: "array", items: { type: "string" }, example: ["Build ML models", "Evaluate neural networks"] },
                requirements: { type: "array", items: { type: "string" }, example: ["Basic Python knowledge"] },
              },
            },
          },
        },
      },
      AdminRoleCreateDTO: {
        type: "object",
        properties: {
          name: { type: "string", example: "Course Reviewer" },
          slug: { type: "string", example: "course_reviewer" },
          color: { type: "string", example: "#4f46e5" },
          lang: { type: "string", enum: ["en", "ar", "fr"], default: "en" },
          permissionIds: { type: "array", items: { type: "string" }, example: ["courses:read", "courses:update"] },
        },
      },
      AdminStaffCreateDTO: {
        type: "object",
        required: ["firstName", "lastName", "email", "password", "roleId"],
        properties: {
          firstName: { type: "string", example: "Ali" },
          lastName: { type: "string", example: "Kamel" },
          email: { type: "string", format: "email", example: "staff.ali@learnex.com" },
          password: { type: "string", format: "password", example: "Staff@123456" },
          phone: { type: "string", example: "+201099887766" },
          country: { type: "string", example: "EG" },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
          roleId: { type: "string", format: "uuid", example: "r1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c" },
        },
      },
      AdminOfferCreateDTO: {
        type: "object",
        required: ["startDate", "endDate", "translations"],
        properties: {
          target: { type: "string", default: "All Users", example: "New Students" },
          offerType: { type: "string", enum: ["PERCENTAGE", "FIXED"], default: "PERCENTAGE" },
          discount: { type: "number", example: 25.00 },
          startDate: { type: "string", format: "date-time", example: "2026-01-01T00:00:00.000Z" },
          endDate: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"], default: "ACTIVE" },
          translations: {
            type: "array",
            items: {
              type: "object",
              required: ["locale", "name", "offerDesc"],
              properties: {
                locale: { type: "string", enum: ["ar", "en", "fr"], example: "en" },
                name: { type: "string", example: "New Year Mega Sale" },
                offerDesc: { type: "string", example: "Enjoy 25% off all courses this week only." },
              },
            },
          },
        },
      },
      AdminCouponCreateDTO: {
        type: "object",
        required: ["name", "code", "discountType", "discountValue", "startDate", "expirationDate", "usageLimit"],
        properties: {
          name: { type: "string", example: "Black Friday 50%" },
          code: { type: "string", example: "BLACKFRIDAY50" },
          discountType: { type: "string", enum: ["PERCENTAGE", "AMOUNT"], example: "PERCENTAGE" },
          discountValue: { type: "number", example: 50.00 },
          startDate: { type: "string", format: "date-time", example: "2026-11-01T00:00:00.000Z" },
          expirationDate: { type: "string", format: "date-time", example: "2026-11-30T23:59:59.000Z" },
          usageLimit: { type: "integer", example: 500 },
          maxUsesPerUser: { type: "integer", default: 1, example: 1 },
        },
      },
      NotificationCreateDTO: {
        type: "object",
        required: ["translations"],
        properties: {
          receiverId: { type: "string", default: "GLOBAL", example: "GLOBAL" },
          receiverType: { type: "string", enum: ["GLOBAL", "STUDENT", "TEACHER", "ADMIN", "SYSTEM"], default: "GLOBAL" },
          type: { type: "string", default: "INFO", example: "SYSTEM_ALERT" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
          link: { type: "string", example: "/courses/python-bootcamp" },
          translations: {
            type: "array",
            items: {
              type: "object",
              required: ["locale", "title", "message"],
              properties: {
                locale: { type: "string", example: "en" },
                title: { type: "string", example: "New Course Available!" },
                message: { type: "string", example: "Explore the new Full Stack AI Bootcamp now live on LearnX." },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    // 👑 ADMIN SECTION
    { name: "👑 Admin - Authentication", description: "Admin login, logout, and token refresh" },
    { name: "👑 Admin - Students Management", description: "CRUD operations, status toggling, and export for students" },
    { name: "👑 Admin - Teachers Management", description: "Teacher verification, application reviews, status, certificates, and course approvals" },
    { name: "👑 Admin - Categories Management", description: "Course categories with multilingual translations and icons" },
    { name: "👑 Admin - Courses Management", description: "Global courses, curriculum sections, and video/text lessons" },
    { name: "👑 Admin - Staff Management", description: "Staff members, administrative roles, and privileges" },
    { name: "👑 Admin - Roles & Permissions", description: "Dynamic RBAC roles, permission sets, and localized titles" },
    { name: "👑 Admin - Coupons Management", description: "Discount vouchers, redemption limits, and status toggles" },
    { name: "👑 Admin - Offers Management", description: "Promotional offers, percentage discounts, and validity schedules" },
    { name: "👑 Admin - Activity Logs", description: "Audit trail, security metrics, and real-time activity tracking" },
    { name: "👑 Admin - CMS & App Settings", description: "Logo branding, app metadata, and static CMS pages" },

    // 👨‍🏫 TEACHER SECTION
    { name: "👨‍🏫 Teacher - Authentication", description: "Teacher registration with CV upload, login, password recovery, and tokens" },
    { name: "👨‍🏫 Teacher - Profile Management", description: "Teacher bio, hourly session pricing, avatar uploads, and visibility" },
    { name: "👨‍🏫 Teacher - Certificates", description: "Teacher academic/professional credentials submission and tracking" },
    { name: "👨‍🏫 Teacher - Courses Management", description: "Teacher self-published courses CRUD" },
    { name: "👨‍🏫 Teacher - Course Sections", description: "Curriculum modules and section reordering" },
    { name: "👨‍🏫 Teacher - Course Items & Lessons", description: "Lesson materials (Video / PDF / Document uploads)" },
    { name: "👨‍🏫 Teacher - Quizzes & Questions", description: "Section quizzes, MCQ questions, submissions, and manual grading" },

    // 🎓 STUDENT SECTION
    { name: "🎓 Student - Authentication", description: "Student signup, OTP email verification, login, password recovery, and refresh tokens" },
    { name: "🎓 Student - Profile Management", description: "Personal data, avatar/cover images, password change, and account deletion" },
    { name: "🎓 Student - Favorites & Courses", description: "Favorite courses wishlist toggle and personalized course listing" },
    { name: "🎓 Student - Browse Teachers", description: "Browse verified teachers and inspect public teacher portfolios" },
    { name: "🎓 Student - Shopping Cart", description: "Shopping cart items management, pricing calculations, and checkout cleanup" },

    // 🔔 GLOBAL & SETTINGS
    { name: "🔔 Notifications System", description: "Global and user-specific push notifications and read receipts" },
    { name: "⚙️ Public Settings & CMS", description: "Public app metadata, terms/privacy pages, and UI language preferences" },
  ],

  paths: {
    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN AUTHENTICATION
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/auth/login": {
      post: {
        summary: "Admin Login",
        description: "Authenticate Super Admin or Staff using email & password. Returns access and refresh JWT tokens.",
        tags: ["👑 Admin - Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginDTO" },
              example: { email: "admin@learnex.com", password: "Admin@123456" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "LOGIN_SUCCESS" },
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                  refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                  admin: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      email: { type: "string", example: "admin@learnex.com" },
                      fullName: { type: "string", example: "Super Admin" },
                    },
                  },
                },
              },
            },
          }),
          400: standardResponses[400],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/auth/refresh-token": {
      get: {
        summary: "Refresh Admin Access Token",
        description: "Send Refresh Token in Bearer Authorization header to issue a new Access Token.",
        tags: ["👑 Admin - Authentication"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "TOKEN_REFRESHED" },
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                },
              },
            },
          }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/auth/logout": {
      post: {
        summary: "Admin Logout",
        description: "Invalidates the active session and clears the cached auth tokens.",
        tags: ["👑 Admin - Authentication"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN STUDENTS MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/students": {
      post: {
        summary: "Create Student Account",
        description: "Creates a new student account with initial profile data and optional course enrollments.",
        tags: ["👑 Admin - Students Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminStudentCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Students (Paginated)",
        description: "Retrieves all registered students with filtering by name/email search keyword and active/blocked status.",
        tags: ["👑 Admin - Students Management"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED"] },
            description: "Filter by student status",
          },
        ],
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "STUDENTS_RETRIEVED" },
              data: {
                type: "object",
                properties: {
                  students: { type: "array", items: { type: "object" } },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
            },
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/students/export": {
      get: {
        summary: "Export Students to Excel (.xlsx)",
        description: "Generates and streams an Excel spreadsheet containing all student accounts and statistics.",
        tags: ["👑 Admin - Students Management"],
        security: bearerSecurity,
        responses: {
          200: {
            description: "Excel file stream",
            content: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {} },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/students/{studentId}": {
      get: {
        summary: "Get Student Details by ID",
        tags: ["👑 Admin - Students Management"],
        security: bearerSecurity,
        parameters: [uuidParam("studentId", "Student User ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Student Information",
        tags: ["👑 Admin - Students Management"],
        security: bearerSecurity,
        parameters: [uuidParam("studentId", "Student User ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminStudentCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Student Account",
        tags: ["👑 Admin - Students Management"],
        security: bearerSecurity,
        parameters: [uuidParam("studentId", "Student User ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/students/{studentId}/status": {
      patch: {
        summary: "Change Student Status (Active / Blocked)",
        tags: ["👑 Admin - Students Management"],
        security: bearerSecurity,
        parameters: [uuidParam("studentId", "Student User ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED"], example: "ACTIVE" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN TEACHERS MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/teachers": {
      post: {
        summary: "Create Teacher Account (Direct by Admin)",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminTeacherCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Teachers (Paginated & Filtered)",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"] } },
          { in: "query", name: "subject", schema: { type: "string" }, description: "Filter by teaching subject" },
        ],
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "TEACHERS_RETRIEVED" },
              data: {
                type: "object",
                properties: {
                  teachers: { type: "array", items: { type: "object" } },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
            },
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/teachers/export": {
      get: {
        summary: "Export Teachers to Excel",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        responses: {
          200: { description: "Excel spreadsheet stream" },
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/teachers/{teacherId}": {
      get: {
        summary: "Get Teacher Details by ID",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Teacher Profile",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminTeacherCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Teacher Account",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/teachers/{teacherId}/assign-courses": {
      patch: {
        summary: "Assign Courses to Teacher",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["courseIds"],
                properties: {
                  courseIds: { type: "array", items: { type: "string", format: "uuid" }, example: ["7d4f983a-86c3-42e1-88f6-5e58129df2be"] },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/teachers/{teacherId}/cv": {
      patch: {
        summary: "Upload / Replace Teacher CV",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["cvUrl"],
                properties: {
                  cvUrl: { type: "string", format: "binary", description: "CV file" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/teachers/requests/{teacherId}/approve": {
      patch: {
        summary: "Approve Teacher Application",
        description: "Approves a pending teacher applicant and activates their instructor capabilities.",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/teachers/requests/{teacherId}/reject": {
      patch: {
        summary: "Reject Teacher Application",
        description: "Rejects a pending teacher applicant with a mandatory rejection feedback message.",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rejectionReason"],
                properties: {
                  rejectionReason: { type: "string", minLength: 5, example: "Missing required certifications or insufficient experience." },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/teachers/certificate/{certificateId}/verify": {
      patch: {
        summary: "Verify & Approve Teacher Certificate",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("certificateId", "Certificate ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/teachers/certificate/{certificateId}/reject": {
      patch: {
        summary: "Reject Teacher Certificate",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("certificateId", "Certificate ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/teachers/{courseId}/change-status": {
      patch: {
        summary: "Approve / Reject Teacher Published Course",
        tags: ["👑 Admin - Teachers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Teacher Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["APPROVED", "REJECTED"], example: "APPROVED" },
                  rejectionReason: { type: "string", example: "Please improve audio quality in Section 2." },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN CATEGORIES MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/categories": {
      get: {
        summary: "Get All Categories (Paginated & Localized)",
        tags: ["👑 Admin - Categories Management"],
        security: bearerSecurity,
        parameters: [...paginationQueryParams, localeQueryParam],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
      post: {
        summary: "Create Course Category",
        tags: ["👑 Admin - Categories Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/AdminCategoryCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/categories/{categoryId}": {
      get: {
        summary: "Get Category by ID",
        tags: ["👑 Admin - Categories Management"],
        security: bearerSecurity,
        parameters: [uuidParam("categoryId", "Category ID"), localeQueryParam],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Category",
        tags: ["👑 Admin - Categories Management"],
        security: bearerSecurity,
        parameters: [uuidParam("categoryId", "Category ID")],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/AdminCategoryCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Category",
        tags: ["👑 Admin - Categories Management"],
        security: bearerSecurity,
        parameters: [uuidParam("categoryId", "Category ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN COURSES MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/courses": {
      post: {
        summary: "Create Course (Admin)",
        description: "Creates a complete LMS course with translations, pricing, level, and thumbnail.",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/AdminCourseCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Courses (Admin Catalog)",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "categoryId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "instructorId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "level", schema: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"] } },
          { in: "query", name: "status", schema: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] } },
          { in: "query", name: "enrollmentType", schema: { type: "string", enum: ["PAID", "FREE"] } },
          { in: "query", name: "sort", schema: { type: "string", enum: ["newest", "oldest", "price_asc", "price_desc", "rating", "students"] } },
        ],
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "COURSES_RETRIEVED" },
              data: {
                type: "object",
                properties: {
                  courses: { type: "array", items: { type: "object" } },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
            },
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/courses/{courseId}": {
      get: {
        summary: "Get Course by ID (with Full Sections & Lessons)",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Course",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/AdminCourseCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Course",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/courses/{courseId}/status": {
      patch: {
        summary: "Update Course Status (Draft / Published / Archived)",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], example: "PUBLISHED" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/courses/{courseId}/sections": {
      post: {
        summary: "Add Section to Course",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", example: "Chapter 1: Getting Started" },
                  order: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/courses/sections/{sectionId}": {
      patch: {
        summary: "Update Course Section",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Chapter 1: Deep Dive" },
                  order: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Course Section",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/courses/sections/{sectionId}/lessons": {
      post: {
        summary: "Add Lesson to Section",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["translations"],
                properties: {
                  order: { type: "integer", example: 1 },
                  durationMinutes: { type: "integer", example: 15 },
                  type: { type: "string", enum: ["VIDEO", "ARTICLE", "DOCUMENT"], default: "VIDEO" },
                  contentUrl: { type: "string", format: "uri", example: "https://youtube.com/watch?v=123" },
                  isFreePreview: { type: "boolean", default: false },
                  translations: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["locale", "title"],
                      properties: {
                        locale: { type: "string", enum: ["ar", "en", "fr"], example: "en" },
                        title: { type: "string", example: "Lesson 1: Project Setup" },
                        description: { type: "string", example: "How to initialize project workspace." },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/courses/lessons/{lessonId}": {
      patch: {
        summary: "Update Lesson",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("lessonId", "Lesson ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Updated Lesson Title" },
                  durationMinutes: { type: "integer", example: 20 },
                  type: { type: "string", enum: ["VIDEO", "ARTICLE", "DOCUMENT"] },
                  contentUrl: { type: "string", format: "uri" },
                  description: { type: "string" },
                  isFreePreview: { type: "boolean" },
                  order: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Lesson",
        tags: ["👑 Admin - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("lessonId", "Lesson ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN ROLES & PERMISSIONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/roles": {
      post: {
        summary: "Create RBAC Role",
        tags: ["👑 Admin - Roles & Permissions"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminRoleCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Roles",
        tags: ["👑 Admin - Roles & Permissions"],
        security: bearerSecurity,
        parameters: [...paginationQueryParams, localeQueryParam],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/roles/{roleId}": {
      get: {
        summary: "Get Role Details by ID",
        tags: ["👑 Admin - Roles & Permissions"],
        security: bearerSecurity,
        parameters: [uuidParam("roleId", "Role ID"), localeQueryParam],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Role & Assigned Permissions",
        tags: ["👑 Admin - Roles & Permissions"],
        security: bearerSecurity,
        parameters: [uuidParam("roleId", "Role ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminRoleCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Role",
        tags: ["👑 Admin - Roles & Permissions"],
        security: bearerSecurity,
        parameters: [uuidParam("roleId", "Role ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN STAFF MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/staff": {
      post: {
        summary: "Create Staff Member",
        tags: ["👑 Admin - Staff Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminStaffCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Staff Members (Paginated)",
        tags: ["👑 Admin - Staff Management"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] } },
          { in: "query", name: "roleId", schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/staff/roles": {
      get: {
        summary: "Get Available Roles for Staff Assignment",
        tags: ["👑 Admin - Staff Management"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/staff/export": {
      get: {
        summary: "Export Staff to Excel (.xlsx)",
        tags: ["👑 Admin - Staff Management"],
        security: bearerSecurity,
        responses: {
          200: { description: "Excel spreadsheet stream" },
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/staff/{staffId}": {
      get: {
        summary: "Get Staff Member Details",
        tags: ["👑 Admin - Staff Management"],
        security: bearerSecurity,
        parameters: [uuidParam("staffId", "Staff User ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Staff Member Profile / Role",
        tags: ["👑 Admin - Staff Management"],
        security: bearerSecurity,
        parameters: [uuidParam("staffId", "Staff User ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminStaffCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Staff Member",
        tags: ["👑 Admin - Staff Management"],
        security: bearerSecurity,
        parameters: [uuidParam("staffId", "Staff User ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/staff/{staffId}/status": {
      patch: {
        summary: "Change Staff Status (Active / Inactive)",
        tags: ["👑 Admin - Staff Management"],
        security: bearerSecurity,
        parameters: [uuidParam("staffId", "Staff User ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "INACTIVE" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN OFFERS MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/offers": {
      post: {
        summary: "Create Promotional Offer",
        tags: ["👑 Admin - Offers Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminOfferCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Offers (Paginated)",
        tags: ["👑 Admin - Offers Management"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          localeQueryParam,
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"] } },
          { in: "query", name: "offerType", schema: { type: "string", enum: ["PERCENTAGE", "FIXED"] } },
        ],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/offers/{offerId}": {
      get: {
        summary: "Get Offer by ID",
        tags: ["👑 Admin - Offers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer ID"), localeQueryParam],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Offer",
        tags: ["👑 Admin - Offers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminOfferCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Offer",
        tags: ["👑 Admin - Offers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/offers/{offerId}/status": {
      patch: {
        summary: "Change Offer Status",
        tags: ["👑 Admin - Offers Management"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"], example: "ACTIVE" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN COUPONS MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/coupons": {
      post: {
        summary: "Create Discount Coupon",
        tags: ["👑 Admin - Coupons Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminCouponCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Coupons (Paginated & Filtered)",
        tags: ["👑 Admin - Coupons Management"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "status", schema: { type: "string", enum: ["all", "active", "expired", "scheduled", "exhausted", "deactivated"], default: "all" } },
        ],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/coupons/{id}": {
      get: {
        summary: "Get Coupon by ID",
        tags: ["👑 Admin - Coupons Management"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Coupon ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Coupon",
        tags: ["👑 Admin - Coupons Management"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Coupon ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminCouponCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Coupon",
        tags: ["👑 Admin - Coupons Management"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Coupon ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/coupons/{id}/toggle-status": {
      patch: {
        summary: "Toggle Coupon Active Status",
        tags: ["👑 Admin - Coupons Management"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Coupon ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN ACTIVITY LOGS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/activityLogs/stats": {
      get: {
        summary: "Get Activity Log Statistics & Metrics",
        tags: ["👑 Admin - Activity Logs"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/activityLogs": {
      get: {
        summary: "Get System Activity Logs (Paginated & Filtered)",
        tags: ["👑 Admin - Activity Logs"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "role", schema: { type: "string" }, description: "Filter by actor role" },
          { in: "query", name: "module", schema: { type: "string" }, description: "Filter by system module (Auth, Courses, etc.)" },
          { in: "query", name: "status", schema: { type: "string", enum: ["SUCCESS", "FAILED"] } },
          { in: "query", name: "actorId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "startDate", schema: { type: "string", format: "date-time" } },
          { in: "query", name: "endDate", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/activityLogs/{id}": {
      get: {
        summary: "Get Activity Log Details by ID",
        tags: ["👑 Admin - Activity Logs"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Activity Log ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👑 ADMIN CMS & SETTINGS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/settings/pages": {
      get: {
        summary: "Get All CMS Static Pages (Admin)",
        tags: ["👑 Admin - CMS & App Settings"],
        security: bearerSecurity,
        parameters: [...paginationQueryParams, localeQueryParam],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/settings/app-info": {
      patch: {
        summary: "Update Platform Info, Social Links & Logo",
        tags: ["👑 Admin - CMS & App Settings"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  appName: { type: "string", example: "LearnX Academy" },
                  appVersion: { type: "string", example: "1.2.0" },
                  aboutUs: { type: "string", example: "Leading online e-learning academy in the MENA region." },
                  facebookUrl: { type: "string", format: "uri", example: "https://facebook.com/learnx" },
                  instaUrl: { type: "string", format: "uri", example: "https://instagram.com/learnx" },
                  websiteUrl: { type: "string", format: "uri", example: "https://learnx.com" },
                  copyright: { type: "string", example: "جميع الحقوق محفوظة © 2026 LearnX" },
                  logo_url: { type: "string", format: "binary", description: "App logo file" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/settings/pages/{slug}": {
      patch: {
        summary: "Update Static Page Content (Terms, Privacy, About)",
        tags: ["👑 Admin - CMS & App Settings"],
        security: bearerSecurity,
        parameters: [stringPathParam("slug", "Page slug (e.g. privacy-policy, terms-and-conditions)", "privacy-policy")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", example: "Privacy Policy" },
                  content: { type: "string", example: "<h1>Privacy Policy</h1><p>We respect your privacy...</p>" },
                  locale: { type: "string", enum: ["ar", "en", "fr"], default: "ar" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👨‍🏫 TEACHER AUTHENTICATION
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/auth/signup": {
      post: {
        summary: "Teacher Signup Application (with CV Upload)",
        description: "Submit teacher registration with experience, subject, intro video, and CV document for admin review.",
        tags: ["👨‍🏫 Teacher - Authentication"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TeacherSignupDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({
            type: "object",
            properties: {
              message: { type: "string", example: "TEACHER_APPLICATION_SUBMITTED_SUCCESSFULLY" },
            },
          }),
          400: standardResponses[400],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/auth/login": {
      post: {
        summary: "Teacher Login",
        description: "Authenticate teacher account. Note: Returns 403 if the application is still pending admin approval or inactive.",
        tags: ["👨‍🏫 Teacher - Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginDTO" },
              example: { email: "ahmed.hassan@learnex.com", password: "Teacher@123456" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "LOGIN_SUCCESS" },
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string" },
                  refreshToken: { type: "string" },
                  user: { type: "object" },
                },
              },
            },
          }),
          400: standardResponses[400],
          403: {
            description: "Account under review (PENDING) or blocked/inactive",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ForbiddenErrorResponse" } } },
          },
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/auth/forgot-password": {
      post: {
        summary: "Request Password Reset OTP (Teacher)",
        tags: ["👨‍🏫 Teacher - Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/auth/reset-password": {
      patch: {
        summary: "Reset Teacher Password using OTP",
        tags: ["👨‍🏫 Teacher - Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/auth/refresh-token": {
      get: {
        summary: "Refresh Teacher Access Token",
        tags: ["👨‍🏫 Teacher - Authentication"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👨‍🏫 TEACHER PROFILE MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/me/profile": {
      get: {
        summary: "Get My Teacher Profile",
        tags: ["👨‍🏫 Teacher - Profile Management"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Teacher Profile Information",
        tags: ["👨‍🏫 Teacher - Profile Management"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeacherUpdateProfileDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Teacher Profile & All Related Assets",
        tags: ["👨‍🏫 Teacher - Profile Management"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/me/{teacherId}": {
      get: {
        summary: "Get Public / Shared Teacher Profile by ID",
        tags: ["👨‍🏫 Teacher - Profile Management"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/me/session-pricing": {
      patch: {
        summary: "Update 50-Min Session Hourly Pricing",
        tags: ["👨‍🏫 Teacher - Profile Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sessionPrice50Min"],
                properties: {
                  sessionPrice50Min: { type: "number", minimum: 0, example: 50.00 },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/me/profile-image": {
      patch: {
        summary: "Upload Teacher Profile / Cover Photos",
        tags: ["👨‍🏫 Teacher - Profile Management"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  profilePhoto: { type: "string", format: "binary" },
                  coverPhoto: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/me/visibility": {
      patch: {
        summary: "Toggle Teacher Availability Status",
        tags: ["👨‍🏫 Teacher - Profile Management"],
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
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👨‍🏫 TEACHER CERTIFICATES
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/certificates": {
      post: {
        summary: "Upload Certificate / Academic Degree",
        tags: ["👨‍🏫 Teacher - Certificates"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TeacherCertificateCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All My Uploaded Certificates",
        tags: ["👨‍🏫 Teacher - Certificates"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "type", schema: { type: "string", enum: ["ACADEMIC", "PROFESSIONAL", "OTHER"] } },
          { in: "query", name: "status", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] } },
        ],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/certificates/{id}": {
      get: {
        summary: "Get Certificate Details by ID",
        tags: ["👨‍🏫 Teacher - Certificates"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Certificate ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Certificate",
        tags: ["👨‍🏫 Teacher - Certificates"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Certificate ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👨‍🏫 TEACHER COURSES MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/courses": {
      post: {
        summary: "Create Course (Teacher)",
        tags: ["👨‍🏫 Teacher - Courses Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TeacherCourseCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All My Published Courses",
        tags: ["👨‍🏫 Teacher - Courses Management"],
        security: bearerSecurity,
        parameters: paginationQueryParams,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/courses/{id}": {
      get: {
        summary: "Get Teacher Course by ID",
        tags: ["👨‍🏫 Teacher - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Course ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Teacher Course",
        tags: ["👨‍🏫 Teacher - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Course ID")],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TeacherCourseCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Teacher Course",
        tags: ["👨‍🏫 Teacher - Courses Management"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Course ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👨‍🏫 TEACHER COURSE SECTIONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/sections/{courseId}": {
      post: {
        summary: "Create Course Section",
        tags: ["👨‍🏫 Teacher - Course Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeacherSectionCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Sections of a Course",
        tags: ["👨‍🏫 Teacher - Course Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/sections/{courseId}/reorder": {
      patch: {
        summary: "Reorder Course Sections",
        tags: ["👨‍🏫 Teacher - Course Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeacherSectionReorderDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/sections/{courseId}/{sectionId}": {
      get: {
        summary: "Get Section by ID",
        tags: ["👨‍🏫 Teacher - Course Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID"), uuidParam("sectionId", "Section ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Section Name / Order",
        tags: ["👨‍🏫 Teacher - Course Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID"), uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Updated Section Name" },
                  order: { type: "integer", example: 2 },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Section",
        tags: ["👨‍🏫 Teacher - Course Sections"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID"), uuidParam("sectionId", "Section ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👨‍🏫 TEACHER COURSE ITEMS & LESSONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/items/{sectionId}": {
      post: {
        summary: "Add Material Item (Video / PDF) to Section",
        tags: ["👨‍🏫 Teacher - Course Items & Lessons"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TeacherItemCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/items/{sectionId}/items": {
      get: {
        summary: "Get All Items in a Section",
        tags: ["👨‍🏫 Teacher - Course Items & Lessons"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/items/{sectionId}/{itemId}": {
      get: {
        summary: "Get Item by ID",
        tags: ["👨‍🏫 Teacher - Course Items & Lessons"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID"), uuidParam("itemId", "Item ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Item Title / Material File",
        tags: ["👨‍🏫 Teacher - Course Items & Lessons"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID"), uuidParam("itemId", "Item ID")],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TeacherItemCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Material Item",
        tags: ["👨‍🏫 Teacher - Course Items & Lessons"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID"), uuidParam("itemId", "Item ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 👨‍🏫 TEACHER QUIZZES & QUESTIONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/quizes/{sectionId}/quiz": {
      post: {
        summary: "Create Quiz for Section",
        tags: ["👨‍🏫 Teacher - Quizzes & Questions"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeacherQuizCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get Section Quiz & Question Bank",
        tags: ["👨‍🏫 Teacher - Quizzes & Questions"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Quiz Settings (Duration / Passing Score)",
        tags: ["👨‍🏫 Teacher - Quizzes & Questions"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  duration: { type: "integer", example: 30 },
                  passingScore: { type: "integer", example: 80 },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Section Quiz",
        tags: ["👨‍🏫 Teacher - Quizzes & Questions"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/quizes/{sectionId}/quiz/questions/{questionId}": {
      patch: {
        summary: "Update Quiz Question & Correct Option",
        tags: ["👨‍🏫 Teacher - Quizzes & Questions"],
        security: bearerSecurity,
        parameters: [uuidParam("sectionId", "Section ID"), uuidParam("questionId", "Question ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  text: { type: "string", example: "Updated question text" },
                  correctOptionId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/quizes/quiz/{quizId}/submissions": {
      get: {
        summary: "Get All Student Submissions for a Quiz",
        tags: ["👨‍🏫 Teacher - Quizzes & Questions"],
        security: bearerSecurity,
        parameters: [uuidParam("quizId", "Quiz ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/quizes/quiz/{quizId}/submissions/{submissionId}": {
      get: {
        summary: "Get Student Submission Answers Details",
        tags: ["👨‍🏫 Teacher - Quizzes & Questions"],
        security: bearerSecurity,
        parameters: [uuidParam("quizId", "Quiz ID"), uuidParam("submissionId", "Submission ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/quizes/quiz/{quizId}/submissions/{submissionId}/grade": {
      patch: {
        summary: "Grade Submission Answers & Submit Feedback",
        tags: ["👨‍🏫 Teacher - Quizzes & Questions"],
        security: bearerSecurity,
        parameters: [uuidParam("quizId", "Quiz ID"), uuidParam("submissionId", "Submission ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeacherGradeSubmissionDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 🎓 STUDENT AUTHENTICATION
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/auth/signup": {
      post: {
        summary: "Student Signup",
        description: "Registers a new student account and triggers an email confirmation OTP.",
        tags: ["🎓 Student - Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentSignupDTO" },
              example: {
                fullName: "Youssef Mahmoud",
                email: "youssef.mahmoud@learnex.com",
                password: "Student@123456",
                confirmPassword: "Student@123456",
                phone: "+201334567890",
              },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/auth/login": {
      post: {
        summary: "Student Login",
        description: "Authenticate student credentials to retrieve access and refresh JWT tokens.",
        tags: ["🎓 Student - Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginDTO" },
              example: { email: "youssef.mahmoud@learnex.com", password: "Student@123456" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "LOGIN_SUCCESS" },
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string" },
                  refreshToken: { type: "string" },
                  user: { type: "object" },
                },
              },
            },
          }),
          400: standardResponses[400],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/auth/confirm-email": {
      patch: {
        summary: "Confirm Student Email with OTP",
        tags: ["🎓 Student - Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConfirmEmailDTO" },
              example: { email: "youssef.mahmoud@learnex.com", otp: "123456" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/auth/forgot-password": {
      post: {
        summary: "Request Password Reset OTP (Student)",
        tags: ["🎓 Student - Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordDTO" },
              example: { email: "youssef.mahmoud@learnex.com" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/auth/reset-password": {
      patch: {
        summary: "Reset Password with OTP",
        tags: ["🎓 Student - Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordDTO" },
              example: {
                email: "youssef.mahmoud@learnex.com",
                otp: "123456",
                password: "NewStudent@123456",
                confirmPassword: "NewStudent@123456",
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/auth/refresh-token": {
      get: {
        summary: "Refresh Student Access Token",
        tags: ["🎓 Student - Authentication"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 🎓 STUDENT PROFILE MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/me/profile": {
      get: {
        summary: "Get My Student Profile",
        tags: ["🎓 Student - Profile Management"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Student Profile Information",
        tags: ["🎓 Student - Profile Management"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentUpdateProfileDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete My Student Account",
        tags: ["🎓 Student - Profile Management"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/me/change-password": {
      patch: {
        summary: "Change Student Password",
        tags: ["🎓 Student - Profile Management"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentChangePasswordDTO" },
              example: { oldPassword: "Student@123456", password: "NewStudentPass@123!" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/me/profile-image": {
      patch: {
        summary: "Upload Student Profile / Cover Photo",
        tags: ["🎓 Student - Profile Management"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  profilePhoto: { type: "string", format: "binary" },
                  coverPhoto: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 🎓 STUDENT FAVORITES & COURSES
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/courses/favorites": {
      get: {
        summary: "Get My Favorite Courses (Wishlist)",
        tags: ["🎓 Student - Favorites & Courses"],
        security: bearerSecurity,
        parameters: [...paginationQueryParams, localeQueryParam],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/courses/{courseId}/favorite": {
      patch: {
        summary: "Toggle Course Favorite Wishlist Status",
        tags: ["🎓 Student - Favorites & Courses"],
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
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 🎓 STUDENT BROWSE TEACHERS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/teachers": {
      get: {
        summary: "Browse All Available Teachers",
        tags: ["🎓 Student - Browse Teachers"],
        security: bearerSecurity,
        parameters: paginationQueryParams,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/teachers/{teacherId}": {
      get: {
        summary: "Get Teacher Public Portfolio by ID",
        tags: ["🎓 Student - Browse Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 🎓 STUDENT SHOPPING CART
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/cart": {
      get: {
        summary: "Get My Shopping Cart with Item Details & Total Price",
        tags: ["🎓 Student - Shopping Cart"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/cart/add": {
      post: {
        summary: "Add Course to Cart",
        tags: ["🎓 Student - Shopping Cart"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentAddToCartDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          409: {
            description: "Item already in cart or already enrolled",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ConflictErrorResponse" } } },
          },
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/cart/remove/{itemId}": {
      delete: {
        summary: "Remove Item from Cart",
        tags: ["🎓 Student - Shopping Cart"],
        security: bearerSecurity,
        parameters: [uuidParam("itemId", "Course or Teacher Course Item ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/cart/clear": {
      delete: {
        summary: "Clear Shopping Cart",
        tags: ["🎓 Student - Shopping Cart"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // 🔔 NOTIFICATIONS SYSTEM
    // ═══════════════════════════════════════════════════════════
    "/api/v1/notification": {
      get: {
        summary: "Get My Notifications (Paginated)",
        tags: ["🔔 Notifications System"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "isRead", schema: { type: "boolean" }, description: "Filter by read status" },
          { in: "query", name: "type", schema: { type: "string" }, description: "Filter by notification type" },
        ],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
      post: {
        summary: "Send Notification (Admin / System)",
        tags: ["🔔 Notifications System"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NotificationCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/notification/read-all": {
      patch: {
        summary: "Mark All My Notifications as Read",
        tags: ["🔔 Notifications System"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/notification/{id}/read": {
      patch: {
        summary: "Mark Single Notification as Read",
        tags: ["🔔 Notifications System"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Notification ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/notification/{id}": {
      delete: {
        summary: "Delete Notification",
        tags: ["🔔 Notifications System"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Notification ID")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // ⚙️ PUBLIC SETTINGS & CMS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/settings/app-info": {
      get: {
        summary: "Get Public App Info, Branding & Social Links",
        tags: ["⚙️ Public Settings & CMS"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/settings/pages": {
      get: {
        summary: "Get All Public CMS Pages List",
        tags: ["⚙️ Public Settings & CMS"],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/settings/pages/{slug}": {
      get: {
        summary: "Get Public CMS Page by Slug (e.g. privacy-policy, terms-and-conditions)",
        tags: ["⚙️ Public Settings & CMS"],
        security: bearerSecurity,
        parameters: [stringPathParam("slug", "Page slug", "about-us")],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/settings/language": {
      patch: {
        summary: "Update User Preferred System Language",
        tags: ["⚙️ Public Settings & CMS"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["language"],
                properties: {
                  language: { type: "string", enum: ["ar", "en", "es", "fr", "de", "it"], example: "ar" },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
//  Swagger UI Custom Theme & Middleware Setup
// ═══════════════════════════════════════════════════════════════
const customCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  * { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important; }

  /* Top Bar Branding */
  .swagger-ui .topbar {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    padding: 12px 0;
    border-bottom: 2px solid #3b82f6;
  }
  .swagger-ui .topbar .topbar-wrapper img {
    content: url('https://raw.githubusercontent.com/swagger-api/swagger-ui/master/dist/favicon-32x32.png');
    height: 34px;
  }
  .swagger-ui .topbar a {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f8fafc !important;
    text-decoration: none;
  }

  /* Info Container */
  .swagger-ui .info {
    margin: 30px 0;
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .swagger-ui .info .title {
    font-size: 2.2rem;
    font-weight: 800;
    color: #0f172a;
  }

  /* Authorization button styling */
  .swagger-ui .btn.authorize {
    background-color: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
    border-radius: 8px;
    font-weight: 600;
    padding: 8px 20px;
    transition: all 0.2s ease-in-out;
  }
  .swagger-ui .btn.authorize:hover {
    background-color: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  .swagger-ui .btn.authorize svg {
    fill: #ffffff;
  }

  /* Section Tags */
  .swagger-ui .opblock-tag {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
    margin-top: 24px;
  }

  /* Operations Blocks */
  .swagger-ui .opblock {
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    margin: 0 0 14px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
  .swagger-ui .opblock .opblock-summary-method {
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.85rem;
    min-width: 80px;
    text-align: center;
  }

  /* Tables inside Markdown Description */
  .swagger-ui .info table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }
  .swagger-ui .info table th {
    background: #f1f5f9;
    padding: 10px 14px;
    text-align: left;
    font-weight: 700;
    border-bottom: 2px solid #cbd5e1;
    color: #334155;
  }
  .swagger-ui .info table td {
    padding: 10px 14px;
    border-bottom: 1px solid #e2e8f0;
    color: #475569;
  }
  .swagger-ui .info table tr:last-child td {
    border-bottom: none;
  }
  .swagger-ui code {
    background: #f1f5f9 !important;
    color: #2563eb !important;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Fira Code', monospace !important;
  }
`;

export const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss,
      customSiteTitle: "LearnX LMS API Interactive Documentation 🚀",
      swaggerOptions: {
        docExpansion: "none",
        filter: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
      },
    })
  );

  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

export default swaggerSpec;
