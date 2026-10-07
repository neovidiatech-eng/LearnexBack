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
// ═══════════════════════════════════════════════════════════
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "LearnX LMS API Documentation",
    version: "1.0.0",
    description: `
Interactive API documentation for LearnX Learning Management System.

### Admin Credentials
- **Email:** \`admin@learnex.com\`
- **Password:** \`Admin@123456\`

### Authentication
Include the Bearer JWT token in the Authorization header:
\`Authorization: Bearer <your_access_token>\`

### Headers & Localization
- \`Accept-Language\`: \`ar\` | \`en\` | \`fr\`
- \`Content-Type\`: \`application/json\` or \`multipart/form-data\`
    `,
    contact: {
      name: "LearnX Tech Team",
      email: "support@learnex.com",
    },
  },
  servers: [
    { url: "https://learnx.agro-plus.net", description: "Production Server" },
    { url: "http://localhost:3000", description: "Local Development Server" },
    { url: "http://localhost:3015", description: "Docker Local Server" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter Bearer token: Bearer <token>",
      },
    },
    schemas: {
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
          data: { type: "object" },
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

      // Student DTOs
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
          email: { type: "string", format: "email", example: "admin@learnex.com" },
          password: { type: "string", format: "password", example: "Admin@123456" },
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
          email: { type: "string", format: "email", example: "user@learnex.com" },
        },
      },
      ResetPasswordDTO: {
        type: "object",
        required: ["email", "otp", "password", "confirmPassword"],
        properties: {
          email: { type: "string", format: "email", example: "user@learnex.com" },
          otp: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
          password: { type: "string", format: "password", example: "NewPassword@123!" },
          confirmPassword: { type: "string", format: "password", example: "NewPassword@123!" },
        },
      },
      StudentUpdateProfileDTO: {
        type: "object",
        properties: {
          fullName: { type: "string", example: "Youssef Mahmoud" },
          email: { type: "string", format: "email", example: "youssef@learnex.com" },
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

      // Teacher DTOs
      TeacherSignupDTO: {
        type: "object",
        required: ["fullName", "email", "password", "phone", "subject"],
        properties: {
          fullName: { type: "string", example: "Dr. Ahmed Hassan" },
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

      // Admin DTOs
      AdminStudentCreateDTO: {
        type: "object",
        required: ["fullName", "email", "password"],
        properties: {
          fullName: { type: "string", example: "Nour Khaled" },
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
        required: ["fullName", "email", "phone", "subject", "experienceYears"],
        properties: {
          fullName: { type: "string", example: "Sara Ibrahim" },
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
        required: ["fullName", "email", "password", "roleId"],
        properties: {
          fullName: { type: "string", example: "Ali Kamel" },
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
    { name: "Admin - Auth", description: "Admin login, logout, and token refresh" },
    { name: "Admin - Students", description: "Students management, status toggling, and Excel export" },
    { name: "Admin - Teachers", description: "Teacher verification, application reviews, certificates, and course approvals" },
    { name: "Admin - Categories", description: "Course categories with multilingual translations and icons" },
    { name: "Admin - Courses", description: "Central courses, curriculum sections, and video/text lessons" },
    { name: "Admin - Staff", description: "Staff members, administrative roles, and privileges" },
    { name: "Admin - Roles & Permissions", description: "RBAC roles, permission sets, and localized titles" },
    { name: "Admin - Coupons", description: "Discount vouchers, redemption limits, and status toggles" },
    { name: "Admin - Offers", description: "Promotional offers, percentage discounts, and validity schedules" },
    { name: "Admin - Activity Logs", description: "Audit trail, security metrics, and real-time activity tracking" },
    { name: "Admin - Settings & CMS", description: "App metadata, logo branding, and static CMS pages" },

    { name: "Teacher - Auth", description: "Teacher registration with CV upload, login, and password recovery" },
    { name: "Teacher - Profile", description: "Teacher bio, hourly session pricing, avatar uploads, and visibility" },
    { name: "Teacher - Certificates", description: "Teacher academic/professional credentials submission and tracking" },
    { name: "Teacher - Courses", description: "Teacher self-published courses CRUD" },
    { name: "Teacher - Sections", description: "Curriculum modules and section reordering" },
    { name: "Teacher - Items", description: "Lesson materials (Video / PDF / Document uploads)" },
    { name: "Teacher - Quizzes", description: "Section quizzes, MCQ questions, submissions, and grading" },

    { name: "Student - Auth", description: "Student signup, OTP email verification, login, and password recovery" },
    { name: "Student - Profile", description: "Personal data, avatar/cover images, password change, and deletion" },
    { name: "Student - Courses", description: "Favorite courses wishlist toggle and personalized listing" },
    { name: "Student - Teachers", description: "Browse verified teachers and inspect public portfolios" },
    { name: "Student - Cart", description: "Shopping cart items management, pricing, and checkout cleanup" },
    { name: "Student - Saved", description: "Student saved courses management" },
    { name: "Student - Quizzes", description: "Student quiz taking, submission, and grading results" },

    { name: "Notifications", description: "Global and user-specific push notifications and read receipts" },
    { name: "Settings", description: "Public app metadata, terms/privacy pages, and language preferences" },
  ],

  paths: {
    // ═══════════════════════════════════════════════════════════
    // ADMIN AUTH
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/auth/login": {
      post: {
        summary: "Admin Login",
        tags: ["Admin - Auth"],
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
        tags: ["Admin - Auth"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "TOKEN_REFRESHED" },
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string" },
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
        tags: ["Admin - Auth"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/SuccessMessageResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // ADMIN STUDENTS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/students": {
      post: {
        summary: "Create Student Account",
        tags: ["Admin - Students"],
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
        summary: "Get All Students",
        tags: ["Admin - Students"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED"] } },
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
        summary: "Export Students to Excel",
        tags: ["Admin - Students"],
        security: bearerSecurity,
        responses: {
          200: { description: "Excel spreadsheet stream" },
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/students/{studentId}": {
      get: {
        summary: "Get Student by ID",
        tags: ["Admin - Students"],
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
        tags: ["Admin - Students"],
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
        tags: ["Admin - Students"],
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
        summary: "Change Student Status",
        tags: ["Admin - Students"],
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
    // ADMIN TEACHERS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/teachers": {
      post: {
        summary: "Create Teacher Account",
        tags: ["Admin - Teachers"],
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
        summary: "Get All Teachers",
        tags: ["Admin - Teachers"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"] } },
          { in: "query", name: "subject", schema: { type: "string" } },
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
        tags: ["Admin - Teachers"],
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
        summary: "Get Teacher by ID",
        tags: ["Admin - Teachers"],
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
        tags: ["Admin - Teachers"],
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
        tags: ["Admin - Teachers"],
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
        tags: ["Admin - Teachers"],
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
    "/api/v1/admin/teachers/requests/{teacherId}/approve": {
      patch: {
        summary: "Approve Teacher Application",
        tags: ["Admin - Teachers"],
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
        tags: ["Admin - Teachers"],
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
                  rejectionReason: { type: "string", minLength: 5, example: "Incomplete CV documentation." },
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
        summary: "Verify Teacher Certificate",
        tags: ["Admin - Teachers"],
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
        tags: ["Admin - Teachers"],
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
        summary: "Approve / Reject Teacher Course",
        tags: ["Admin - Teachers"],
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
                  rejectionReason: { type: "string", example: "Please update video resolution in module 1." },
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
    // ADMIN CATEGORIES
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/categories": {
      get: {
        summary: "Get All Categories",
        tags: ["Admin - Categories"],
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
        summary: "Create Category",
        tags: ["Admin - Categories"],
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
        tags: ["Admin - Categories"],
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
        tags: ["Admin - Categories"],
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
        tags: ["Admin - Categories"],
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
    // ADMIN COURSES
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/courses": {
      post: {
        summary: "Create Course",
        tags: ["Admin - Courses"],
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
        summary: "Get All Courses (Catalog)",
        tags: ["Admin - Courses"],
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
        summary: "Get Course by ID",
        tags: ["Admin - Courses"],
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
        tags: ["Admin - Courses"],
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
        tags: ["Admin - Courses"],
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
        summary: "Update Course Status",
        tags: ["Admin - Courses"],
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
        tags: ["Admin - Courses"],
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
        tags: ["Admin - Courses"],
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
        tags: ["Admin - Courses"],
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
        tags: ["Admin - Courses"],
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
        tags: ["Admin - Courses"],
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
        tags: ["Admin - Courses"],
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
    // ADMIN ROLES & PERMISSIONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/roles": {
      post: {
        summary: "Create Role",
        tags: ["Admin - Roles & Permissions"],
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
        tags: ["Admin - Roles & Permissions"],
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
        summary: "Get Role by ID",
        tags: ["Admin - Roles & Permissions"],
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
        summary: "Update Role & Permissions",
        tags: ["Admin - Roles & Permissions"],
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
        tags: ["Admin - Roles & Permissions"],
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
    // ADMIN STAFF
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/staff": {
      post: {
        summary: "Create Staff Member",
        tags: ["Admin - Staff"],
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
        summary: "Get All Staff Members",
        tags: ["Admin - Staff"],
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
        summary: "Get Available Roles for Staff",
        tags: ["Admin - Staff"],
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
        summary: "Export Staff to Excel",
        tags: ["Admin - Staff"],
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
        summary: "Get Staff Member by ID",
        tags: ["Admin - Staff"],
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
        tags: ["Admin - Staff"],
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
        tags: ["Admin - Staff"],
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
        summary: "Change Staff Status",
        tags: ["Admin - Staff"],
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
    // ADMIN OFFERS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/offers": {
      post: {
        summary: "Create Offer",
        tags: ["Admin - Offers"],
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
        summary: "Get All Offers",
        tags: ["Admin - Offers"],
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
        tags: ["Admin - Offers"],
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
        tags: ["Admin - Offers"],
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
        tags: ["Admin - Offers"],
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
        tags: ["Admin - Offers"],
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
    // ADMIN COUPONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/coupons": {
      post: {
        summary: "Create Coupon",
        tags: ["Admin - Coupons"],
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
        summary: "Get All Coupons",
        tags: ["Admin - Coupons"],
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
        tags: ["Admin - Coupons"],
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
        tags: ["Admin - Coupons"],
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
        tags: ["Admin - Coupons"],
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
        tags: ["Admin - Coupons"],
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
    // ADMIN ACTIVITY LOGS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/activityLogs/stats": {
      get: {
        summary: "Get Activity Log Statistics",
        tags: ["Admin - Activity Logs"],
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
        summary: "Get System Activity Logs",
        tags: ["Admin - Activity Logs"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "role", schema: { type: "string" } },
          { in: "query", name: "module", schema: { type: "string" } },
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
        summary: "Get Activity Log by ID",
        tags: ["Admin - Activity Logs"],
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
    // ADMIN SETTINGS & CMS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/settings/pages": {
      get: {
        summary: "Get All CMS Static Pages",
        tags: ["Admin - Settings & CMS"],
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
        summary: "Update Platform Info & Logo",
        tags: ["Admin - Settings & CMS"],
        security: bearerSecurity,
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  appName: { type: "string", example: "LearnX Academy" },
                  appVersion: { type: "string", example: "1.2.0" },
                  aboutUs: { type: "string", example: "Leading online e-learning academy." },
                  facebookUrl: { type: "string", format: "uri", example: "https://facebook.com/learnx" },
                  instaUrl: { type: "string", format: "uri", example: "https://instagram.com/learnx" },
                  websiteUrl: { type: "string", format: "uri", example: "https://learnx.com" },
                  copyright: { type: "string", example: "All rights reserved © 2026 LearnX" },
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
        summary: "Update Static Page Content",
        tags: ["Admin - Settings & CMS"],
        security: bearerSecurity,
        parameters: [stringPathParam("slug", "Page slug (privacy-policy, terms-and-conditions)", "privacy-policy")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", example: "Privacy Policy" },
                  content: { type: "string", example: "<h1>Privacy Policy</h1><p>Content goes here...</p>" },
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
    // TEACHER AUTH
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/auth/signup": {
      post: {
        summary: "Teacher Signup Application",
        tags: ["Teacher - Auth"],
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
        tags: ["Teacher - Auth"],
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
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/auth/forgot-password": {
      post: {
        summary: "Request Password Reset OTP (Teacher)",
        tags: ["Teacher - Auth"],
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
        tags: ["Teacher - Auth"],
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
        tags: ["Teacher - Auth"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // TEACHER PROFILE
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/me/profile": {
      get: {
        summary: "Get My Teacher Profile",
        tags: ["Teacher - Profile"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Teacher Profile",
        tags: ["Teacher - Profile"],
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
        summary: "Delete Teacher Profile",
        tags: ["Teacher - Profile"],
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
        summary: "Get Public Teacher Profile",
        tags: ["Teacher - Profile"],
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
        summary: "Update 50-Min Session Hourly Price",
        tags: ["Teacher - Profile"],
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
        summary: "Upload Profile / Cover Photo",
        tags: ["Teacher - Profile"],
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
        summary: "Toggle Profile Availability",
        tags: ["Teacher - Profile"],
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
    // TEACHER CERTIFICATES
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/certificates": {
      post: {
        summary: "Upload Certificate",
        tags: ["Teacher - Certificates"],
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
        summary: "Get All Uploaded Certificates",
        tags: ["Teacher - Certificates"],
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
        summary: "Get Certificate by ID",
        tags: ["Teacher - Certificates"],
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
        tags: ["Teacher - Certificates"],
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
    // TEACHER COURSES
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/courses": {
      post: {
        summary: "Create Course (Teacher)",
        tags: ["Teacher - Courses"],
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
        summary: "Get My Courses",
        tags: ["Teacher - Courses"],
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
        summary: "Get Course by ID",
        tags: ["Teacher - Courses"],
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
        summary: "Update Course",
        tags: ["Teacher - Courses"],
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
        summary: "Delete Course",
        tags: ["Teacher - Courses"],
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
    // TEACHER SECTIONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/sections/{courseId}": {
      post: {
        summary: "Create Course Section",
        tags: ["Teacher - Sections"],
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
        tags: ["Teacher - Sections"],
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
        summary: "Reorder Sections",
        tags: ["Teacher - Sections"],
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
        tags: ["Teacher - Sections"],
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
        summary: "Update Section",
        tags: ["Teacher - Sections"],
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
        tags: ["Teacher - Sections"],
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
    // TEACHER ITEMS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/items/{sectionId}": {
      post: {
        summary: "Add Material Item to Section",
        tags: ["Teacher - Items"],
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
        tags: ["Teacher - Items"],
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
        tags: ["Teacher - Items"],
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
        summary: "Update Item",
        tags: ["Teacher - Items"],
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
        summary: "Delete Item",
        tags: ["Teacher - Items"],
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
    // TEACHER QUIZZES
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/quizes/{sectionId}/quiz": {
      post: {
        summary: "Create Section Quiz",
        tags: ["Teacher - Quizzes"],
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
        summary: "Get Section Quiz",
        tags: ["Teacher - Quizzes"],
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
        summary: "Update Quiz Settings",
        tags: ["Teacher - Quizzes"],
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
        summary: "Delete Quiz",
        tags: ["Teacher - Quizzes"],
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
        summary: "Update Quiz Question",
        tags: ["Teacher - Quizzes"],
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
        summary: "Get Quiz Submissions",
        tags: ["Teacher - Quizzes"],
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
        summary: "Get Submission Answers Details",
        tags: ["Teacher - Quizzes"],
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
        summary: "Grade Submission",
        tags: ["Teacher - Quizzes"],
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
    // STUDENT AUTH
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/auth/signup": {
      post: {
        summary: "Student Signup",
        tags: ["Student - Auth"],
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
        tags: ["Student - Auth"],
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
        tags: ["Student - Auth"],
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
        summary: "Request Password Reset OTP",
        tags: ["Student - Auth"],
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
        tags: ["Student - Auth"],
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
        tags: ["Student - Auth"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // STUDENT PROFILE
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/me/profile": {
      get: {
        summary: "Get My Student Profile",
        tags: ["Student - Profile"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Student Profile",
        tags: ["Student - Profile"],
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
        summary: "Delete Student Account",
        tags: ["Student - Profile"],
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
        tags: ["Student - Profile"],
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
        tags: ["Student - Profile"],
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
    // STUDENT COURSES
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/courses/favorites": {
      get: {
        summary: "Get Favorite Courses",
        tags: ["Student - Courses"],
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
        summary: "Toggle Course Favorite",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  itemType: { type: "string", enum: ["COURSE", "TEACHER_COURSE"], default: "COURSE", example: "COURSE" },
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

    "/api/v1/student/courses/enrolled": {
      get: {
        summary: "Get student enrolled courses (My Learning)",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          localeQueryParam,
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "COMPLETED", "CANCELLED"] }, description: "Enrollment status filter" },
        ],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/courses/my-learning": {
      get: {
        summary: "Get student enrolled courses (alias)",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          localeQueryParam,
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "COMPLETED", "CANCELLED"] }, description: "Enrollment status filter" },
        ],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/courses/{courseId}/enroll": {
      post: {
        summary: "Enroll directly in a free course",
        description: "Enrolls the authenticated student in a free published course without going through the cart.",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        responses: {
          ...standardResponses[201]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // STUDENT TEACHERS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/teachers": {
      get: {
        summary: "Browse Teachers",
        tags: ["Student - Teachers"],
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
        summary: "Get Teacher Details",
        tags: ["Student - Teachers"],
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
    // STUDENT CART
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/cart": {
      get: {
        summary: "Get Shopping Cart",
        tags: ["Student - Cart"],
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
        tags: ["Student - Cart"],
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
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/cart/remove/{itemId}": {
      delete: {
        summary: "Remove Item from Cart",
        tags: ["Student - Cart"],
        security: bearerSecurity,
        parameters: [uuidParam("itemId", "Item ID")],
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
        tags: ["Student - Cart"],
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
    // NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/notification": {
      get: {
        summary: "Get Notifications",
        tags: ["Notifications"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "isRead", schema: { type: "boolean" } },
          { in: "query", name: "type", schema: { type: "string" } },
        ],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
      post: {
        summary: "Send Notification",
        tags: ["Notifications"],
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
        summary: "Mark All Notifications as Read",
        tags: ["Notifications"],
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
        summary: "Mark Notification as Read",
        tags: ["Notifications"],
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
        tags: ["Notifications"],
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
    // PUBLIC SETTINGS & CMS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/settings/app-info": {
      get: {
        summary: "Get App Info & Social Links",
        tags: ["Settings"],
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
        summary: "Get All Public CMS Pages",
        tags: ["Settings"],
        responses: {
          ...standardResponses[200]({ $ref: "#/components/schemas/GenericSuccessDataResponse" }),
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/settings/pages/{slug}": {
      get: {
        summary: "Get CMS Page by Slug",
        tags: ["Settings"],
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
        summary: "Update Preferred Language",
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

    "/api/v1/student/saved": {
      get: {
        summary: "Get student saved items",
        description: "Returns the authenticated student's saved items with enriched details (course title, instructor, etc.). Locale is controlled via `locale` query param or `Accept-Language` header.",
        tags: ["Student - Saved"],
        security: bearerSecurity,
        parameters: [
          { in: "query", name: "locale", schema: { type: "string", enum: ["ar", "en"], default: "ar" }, description: "Translation locale" },
        ],
        responses: {
          200: {
            description: "Saved items retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "SUCCESS" },
                    data: {
                      type: "object",
                      properties: {
                        totalItems: { type: "integer", example: 2 },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string", format: "uuid" },
                              itemType: { type: "string", enum: ["COURSE", "TEACHER_COURSE"] },
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
                },
              },
            },
          },
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/saved/add": {
      post: {
        summary: "Add item to saved",
        description: "Adds a COURSE or TEACHER_COURSE to the student's saved items. Validates that the course is published/approved.",
        tags: ["Student - Saved"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["itemId"],
                properties: {
                  type: { type: "string", enum: ["COURSE", "TEACHER_COURSE"], example: "COURSE", description: "Type of item" },
                  itemType: { type: "string", enum: ["COURSE", "TEACHER_COURSE"], example: "COURSE", description: "Alternative name for type" },
                  itemId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000", description: "Course or TeacherCourse ID" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Item added to saved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "ITEM_ADDED_TO_SAVED" },
                    data: { type: "object", description: "Updated saved items object" },
                  },
                },
              },
            },
          },
          400: standardResponses[400],
          401: standardResponses[401],
          409: {
            description: "Item already saved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConflictErrorResponse" },
              },
            },
          },
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/saved/remove/{itemId}": {
      delete: {
        summary: "Remove item from saved",
        description: "Removes an item from saved by Saved ID or itemId (course ID).",
        tags: ["Student - Saved"],
        security: bearerSecurity,
        parameters: [uuidParam("itemId", "Saved ID or course itemId")],
        responses: {
          200: {
            description: "Item removed from saved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "ITEM_REMOVED_FROM_SAVED" },
                    data: { type: "object", description: "Updated saved items object" },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/cart/checkout": {
      post: {
        summary: "Checkout student cart",
        description: "Enrolls student in all course items in their cart and clears the cart.",
        tags: ["Student - Cart"],
        security: bearerSecurity,
        responses: {
          200: {
            description: "Checkout completed and courses enrolled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "CHECKOUT_SUCCESSFUL" },
                    data: {
                      type: "object",
                      properties: {
                        totalEnrolled: { type: "integer", example: 2 },
                        enrolled: { type: "array", items: {} },
                      },
                    },
                  },
                },
              },
            },
          },
          400: standardResponses[400],
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/saved/clear": {
      delete: {
        summary: "Clear all saved items",
        description: "Removes all saved items for the authenticated student.",
        tags: ["Student - Saved"],
        security: bearerSecurity,
        responses: {
          200: {
            description: "Saved list cleared successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "SAVED_CLEARED" },
                    data: {
                      type: "object",
                      properties: {
                        totalItems: { type: "integer", example: 0 },
                        items: { type: "array", items: {}, example: [] },
                      },
                    },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    // STUDENT QUIZZES  (/api/v1/student/quizzes)
    // ───────────────────────────────────────────────────────────
    "/api/v1/student/quizzes/{quizId}": {
      get: {
        summary: "Get quiz details and questions for taking the test",
        description: "Returns the quiz questions and options WITHOUT revealing isCorrect.",
        tags: ["Student - Quizzes"],
        security: bearerSecurity,
        parameters: [uuidParam("quizId", "Quiz ID")],
        responses: {
          200: {
            description: "Quiz details and questions retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "SUCCESS" },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string", example: "Chapter 1 Quiz" },
                        duration: { type: "integer", example: 30 },
                        passingScore: { type: "integer", example: 70 },
                        totalQuestions: { type: "integer", example: 5 },
                        hasSubmitted: { type: "boolean", example: false },
                        questions: { type: "array", items: {} },
                      },
                    },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/quizzes/{quizId}/submit": {
      post: {
        summary: "Submit quiz answers",
        description: "Submits answers for automatic grading (MCQ/TRUE_FALSE) or pending teacher review (WRITTEN).",
        tags: ["Student - Quizzes"],
        security: bearerSecurity,
        parameters: [uuidParam("quizId", "Quiz ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["answers"],
                properties: {
                  answers: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["questionId"],
                      properties: {
                        questionId: { type: "string", format: "uuid" },
                        selectedOptionId: { type: "string", format: "uuid", nullable: true },
                        writtenAnswer: { type: "string", nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Quiz submitted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "QUIZ_SUBMITTED_SUCCESSFULLY" },
                    data: { type: "object", description: "Submission results" },
                  },
                },
              },
            },
          },
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          409: {
            description: "Already submitted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConflictErrorResponse" },
              },
            },
          },
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/quizzes/{quizId}/my-submission": {
      get: {
        summary: "Get student's quiz submission and result",
        description: "Returns the submission status, scores, pass/fail result, and graded answers.",
        tags: ["Student - Quizzes"],
        security: bearerSecurity,
        parameters: [uuidParam("quizId", "Quiz ID")],
        responses: {
          200: {
            description: "Quiz submission and result retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "SUCCESS" },
                    data: { type: "object", description: "Submission details" },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
//  Clean Dark Mode Theme with Blue Highlights
// ═══════════════════════════════════════════════════════════
const customCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  html, body, .swagger-ui {
    background-color: #0b0f19 !important;
    color: #cbd5e1 !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  }

  /* Top Navigation Bar */
  .swagger-ui .topbar {
    background: #0f172a !important;
    border-bottom: 1px solid #1e293b !important;
    padding: 10px 0 !important;
  }
  .swagger-ui .topbar .topbar-wrapper a {
    color: #60a5fa !important;
    font-weight: 700 !important;
    font-size: 1.15rem !important;
    text-decoration: none !important;
  }
  .swagger-ui .topbar .download-url-wrapper {
    display: none !important;
  }

  /* Info / Header Container */
  .swagger-ui .info {
    background: #0f172a !important;
    border: 1px solid #1e293b !important;
    border-radius: 12px !important;
    padding: 24px !important;
    margin: 24px 0 !important;
  }
  .swagger-ui .info .title {
    color: #f8fafc !important;
    font-size: 1.85rem !important;
    font-weight: 800 !important;
  }
  .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info h3 {
    color: #94a3b8 !important;
  }
  .swagger-ui .info h3 {
    color: #60a5fa !important;
    font-size: 1.1rem !important;
    font-weight: 700 !important;
    margin-top: 14px !important;
  }
  .swagger-ui .info code {
    background: #1e293b !important;
    color: #38bdf8 !important;
    border: 1px solid #334155 !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
  }

  /* Scheme & Server Select Container */
  .swagger-ui .scheme-container {
    background: #0f172a !important;
    border: 1px solid #1e293b !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    padding: 14px 20px !important;
    margin-bottom: 24px !important;
  }
  .swagger-ui .scheme-container label {
    color: #94a3b8 !important;
  }

  /* Buttons & Authorize */
  .swagger-ui .btn {
    border-radius: 6px !important;
    font-weight: 600 !important;
  }
  .swagger-ui .btn.authorize {
    background: #2563eb !important;
    color: #ffffff !important;
    border-color: #2563eb !important;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3) !important;
  }
  .swagger-ui .btn.authorize svg {
    fill: #ffffff !important;
  }
  .swagger-ui .btn.cancel {
    background: #ef4444 !important;
    color: #ffffff !important;
    border-color: #ef4444 !important;
  }

  /* Filter Input */
  .swagger-ui .filter .operation-filter-input {
    background: #0f172a !important;
    color: #f8fafc !important;
    border: 1px solid #1e293b !important;
    border-radius: 8px !important;
    padding: 8px 14px !important;
  }

  /* Section / Tag Headers */
  .swagger-ui .opblock-tag-section {
    margin-bottom: 20px !important;
  }
  .swagger-ui .opblock-tag {
    color: #f8fafc !important;
    font-size: 1.15rem !important;
    font-weight: 700 !important;
    border-bottom: 1px solid #1e293b !important;
    padding: 10px 0 !important;
  }
  .swagger-ui .opblock-tag small {
    color: #64748b !important;
  }

  /* Operation Card Blocks */
  .swagger-ui .opblock {
    background: #0f172a !important;
    border: 1px solid #1e293b !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    margin: 0 0 10px 0 !important;
  }
  .swagger-ui .opblock .opblock-summary {
    border-bottom: none !important;
    padding: 10px 14px !important;
  }
  .swagger-ui .opblock .opblock-summary-method {
    font-weight: 700 !important;
    border-radius: 4px !important;
    min-width: 75px !important;
    text-align: center !important;
  }
  .swagger-ui .opblock .opblock-summary-path {
    color: #f1f5f9 !important;
    font-weight: 600 !important;
  }
  .swagger-ui .opblock .opblock-summary-path__deprecated {
    color: #64748b !important;
  }
  .swagger-ui .opblock .opblock-summary-description {
    color: #94a3b8 !important;
  }

  /* Operation Specific Color Tinting */
  .swagger-ui .opblock.opblock-get { border-color: #1e3a8a !important; }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #2563eb !important; }

  .swagger-ui .opblock.opblock-post { border-color: #064e3b !important; }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #059669 !important; }

  .swagger-ui .opblock.opblock-patch { border-color: #78350f !important; }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #d97706 !important; }

  .swagger-ui .opblock.opblock-delete { border-color: #7f1d1d !important; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #dc2626 !important; }

  /* Expanded Operation Body */
  .swagger-ui .opblock-body {
    background: #090d16 !important;
    border-top: 1px solid #1e293b !important;
  }
  .swagger-ui .opblock-section-header {
    background: #0f172a !important;
    color: #94a3b8 !important;
    border-bottom: 1px solid #1e293b !important;
    padding: 8px 14px !important;
  }
  .swagger-ui .opblock-section-header h4 {
    color: #cbd5e1 !important;
  }

  /* Parameters & Tables */
  .swagger-ui table {
    color: #cbd5e1 !important;
  }
  .swagger-ui table thead tr th, .swagger-ui table thead tr td {
    color: #94a3b8 !important;
    border-bottom: 1px solid #1e293b !important;
  }
  .swagger-ui .parameter__name {
    color: #f8fafc !important;
    font-weight: 600 !important;
  }
  .swagger-ui .parameter__type {
    color: #38bdf8 !important;
  }
  .swagger-ui .parameter__in {
    color: #64748b !important;
  }

  /* Form Elements, Inputs & Selects */
  .swagger-ui select, .swagger-ui input[type=text], .swagger-ui textarea {
    background: #0f172a !important;
    color: #f8fafc !important;
    border: 1px solid #334155 !important;
    border-radius: 6px !important;
  }
  .swagger-ui select option {
    background: #0f172a !important;
    color: #f8fafc !important;
  }

  /* Code Blocks, Responses & Schema Viewers */
  .swagger-ui .responses-inner {
    background: #090d16 !important;
  }
  .swagger-ui .response-col_status {
    color: #f8fafc !important;
    font-weight: 700 !important;
  }
  .swagger-ui .response-col_description {
    color: #94a3b8 !important;
  }
  .swagger-ui .highlight-code, .swagger-ui .microlight, .swagger-ui pre {
    background: #030712 !important;
    border: 1px solid #1e293b !important;
    border-radius: 6px !important;
    color: #38bdf8 !important;
  }
  .swagger-ui pre code {
    color: #38bdf8 !important;
    background: transparent !important;
  }
  .swagger-ui .model-box {
    background: #0f172a !important;
    border-radius: 6px !important;
  }
  .swagger-ui .model {
    color: #cbd5e1 !important;
  }
  .swagger-ui .prop-name {
    color: #60a5fa !important;
  }
  .swagger-ui .prop-type {
    color: #34d399 !important;
  }

  /* Modals */
  .swagger-ui .dialog-ux .backdrop-ux {
    background: rgba(0, 0, 0, 0.8) !important;
  }
  .swagger-ui .dialog-ux .modal-ux {
    background: #0f172a !important;
    border: 1px solid #334155 !important;
    border-radius: 12px !important;
    color: #f8fafc !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
  }
  .swagger-ui .dialog-ux .modal-ux-header {
    border-bottom: 1px solid #1e293b !important;
  }
  .swagger-ui .dialog-ux .modal-ux-header h3 {
    color: #f8fafc !important;
  }
  .swagger-ui .auth-container h4, .swagger-ui .auth-container p, .swagger-ui .auth-container label {
    color: #cbd5e1 !important;
  }
`;

export const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss,
      customSiteTitle: "LearnX API Documentation",
      swaggerOptions: {
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
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
