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
          email: {
            type: "string",
            format: "email",
            example: "student@learnex.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "Student@123456",
          },
          confirmPassword: {
            type: "string",
            format: "password",
            example: "Student@123456",
          },
          phone: { type: "string", example: "+201334567890" },
        },
      },
      LoginDTO: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@learnex.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "Admin@123456",
          },
        },
      },
      ConfirmEmailDTO: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "student@learnex.com",
          },
          otp: {
            type: "string",
            minLength: 6,
            maxLength: 6,
            example: "123456",
          },
        },
      },
      ForgotPasswordDTO: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "user@learnex.com",
          },
        },
      },
      ResetPasswordDTO: {
        type: "object",
        required: ["email", "otp", "password", "confirmPassword"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "user@learnex.com",
          },
          otp: {
            type: "string",
            minLength: 6,
            maxLength: 6,
            example: "123456",
          },
          password: {
            type: "string",
            format: "password",
            example: "NewPassword@123!",
          },
          confirmPassword: {
            type: "string",
            format: "password",
            example: "NewPassword@123!",
          },
        },
      },
      StudentUpdateProfileDTO: {
        type: "object",
        properties: {
          fullName: { type: "string", example: "Youssef Mahmoud" },
          email: {
            type: "string",
            format: "email",
            example: "youssef@learnex.com",
          },
          phone: { type: "string", example: "+201334567890" },
          dateOfBirth: {
            type: "string",
            format: "date",
            example: "1998-05-15",
          },
        },
      },
      StudentChangePasswordDTO: {
        type: "object",
        required: ["oldPassword", "password"],
        properties: {
          oldPassword: {
            type: "string",
            format: "password",
            example: "Student@123456",
          },
          password: {
            type: "string",
            format: "password",
            example: "NewPass@123456",
          },
        },
      },
      StudentAddToCartDTO: {
        type: "object",
        required: ["type", "itemId"],
        properties: {
          type: {
            type: "string",
            enum: ["COURSE", "TEACHER_COURSE"],
            example: "COURSE",
          },
          itemId: {
            type: "string",
            format: "uuid",
            example: "8d94f276-88cf-4ef8-a5b7-7e61d85f7911",
          },
        },
      },

      // Teacher DTOs
      TeacherSignupDTO: {
        type: "object",
        required: ["fullName", "email", "password", "phone", "subject"],
        properties: {
          fullName: { type: "string", example: "Dr. Ahmed Hassan" },
          email: {
            type: "string",
            format: "email",
            example: "ahmed.hassan@learnex.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "Teacher@123456",
          },
          phone: { type: "string", example: "+201001234567" },
          subject: { type: "string", example: "Web Development" },
          experienceYears: { type: "integer", minimum: 0, example: 7 },
          linkedinUrl: {
            type: "string",
            format: "uri",
            example: "https://linkedin.com/in/ahmed-hassan",
          },
          headline: { type: "string", example: "Senior Full Stack Instructor" },
          bio: {
            type: "string",
            example:
              "7+ years teaching React, Node.js, and Modern Web Architecture.",
          },
          locale: { type: "string", enum: ["ar", "en"], default: "ar" },
          cvUrl: {
            type: "string",
            format: "binary",
            description: "CV file (PDF, Doc, Image up to 100MB)",
          },
          introVideoUrl: {
            type: "string",
            format: "binary",
            description: "Intro video file",
          },
        },
      },
      TeacherUpdateProfileDTO: {
        type: "object",
        properties: {
          fullName: { type: "string", example: "Ahmed Hassan" },
          email: {
            type: "string",
            format: "email",
            example: "ahmed.hassan@learnex.com",
          },
          phone: { type: "string", example: "+201001234567" },
          country: { type: "string", example: "EG" },
          subject: { type: "string", example: "Full Stack Web Development" },
          headline: {
            type: "string",
            example: "Lead Software Architect & Educator",
          },
          bio: {
            type: "string",
            example: "Over a decade of industry and mentorship experience.",
          },
          experienceYears: { type: "integer", example: 8 },
          linkedinUrl: {
            type: "string",
            format: "uri",
            example: "https://linkedin.com/in/ahmed-hassan",
          },
          sessionPrice50Min: { type: "number", example: 45.0 },
          currency: { type: "string", example: "USD" },
        },
      },
      TeacherWorkHoursUpdateDTO: {
        type: "object",
        required: ["workHours"],
        properties: {
          workHours: {
            type: "array",
            items: {
              type: "object",
              required: ["day", "slots"],
              properties: {
                day: {
                  type: "string",
                  enum: [
                    "SATURDAY",
                    "SUNDAY",
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                  ],
                  example: "MONDAY",
                },
                slots: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["startTime", "endTime"],
                    properties: {
                      startTime: {
                        type: "string",
                        pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
                        example: "09:00",
                        description: "Start time in HH:mm 24-hour format",
                      },
                      endTime: {
                        type: "string",
                        pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
                        example: "17:00",
                        description: "End time in HH:mm 24-hour format",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      TeacherCertificateCreateDTO: {
        type: "object",
        required: ["type", "title", "issuer", "issueYear", "file"],
        properties: {
          type: {
            type: "string",
            enum: ["ACADEMIC", "COURSE", "EXPERIENCE", "OTHER"],
            example: "ACADEMIC",
          },
          title: { type: "string", example: "B.Sc. in Computer Engineering" },
          issuer: { type: "string", example: "Cairo University" },
          issueYear: { type: "integer", example: 2020 },
          file: {
            type: "string",
            format: "binary",
            description: "Certificate file (PDF or Image, max 15MB)",
          },
        },
      },
      AdminCertificateDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          teacherId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
          type: {
            type: "string",
            enum: ["ACADEMIC", "COURSE", "EXPERIENCE", "OTHER"],
            example: "ACADEMIC",
          },
          title: {
            type: "string",
            example: "B.Sc. in Computer Science",
          },
          issuer: {
            type: "string",
            example: "Cairo University",
          },
          issueYear: {
            type: "integer",
            example: 2020,
          },
          fileUrl: {
            type: "string",
            example: "/uploads/certificates/cert-1.pdf",
          },
          fileType: {
            type: "string",
            example: "application/pdf",
          },
          fileSize: {
            type: "string",
            example: "2.4 MB",
          },
          status: {
            type: "string",
            enum: ["PENDING", "VERIFIED", "REJECTED"],
            example: "VERIFIED",
          },
          rejectionReason: {
            type: "string",
            nullable: true,
            example: null,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
          teacher: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              userId: { type: "string", format: "uuid" },
              subject: { type: "string", example: "Web Development" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  fullName: { type: "string", example: "Ahmed Hassan" },
                  email: { type: "string", example: "ahmed.hassan@learnex.com" },
                  profilePhoto: { type: "string", nullable: true, example: "/uploads/users/ahmed.jpg" },
                  phone: { type: "string", example: "+201001234567" },
                },
              },
            },
          },
        },
      },
      TeacherCourseCreateDTO: {
        type: "object",
        required: ["name", "description", "price", "totalHours"],
        properties: {
          name: {
            type: "string",
            example: "Modern React & Next.js Masterclass",
          },
          description: {
            type: "string",
            example:
              "Comprehensive course from basic JS to full stack SSR apps.",
          },
          price: { type: "number", example: 49.99 },
          totalHours: { type: "integer", minimum: 0, example: 35 },
          categoryId: {
            type: "string",
            format: "uuid",
            example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            description: "Category ID",
          },
          previewVideoUrl: {
            type: "string",
            format: "uri",
            example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            description: "Course intro / preview video URL",
          },
          level: {
            type: "string",
            enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"],
            default: "BEGINNER",
            example: "BEGINNER",
            description: "Target difficulty level",
          },
          language: {
            type: "string",
            default: "english",
            example: "english",
            description: "Course primary language (e.g., english, arabic)",
          },
          wallPaper: {
            type: "string",
            format: "binary",
            description: "Course wallpaper / cover image",
          },
        },
      },
      TeacherSectionCreateDTO: {
        type: "object",
        required: ["name", "order"],
        properties: {
          name: {
            type: "string",
            example: "Section 1: Foundations & Architecture",
          },
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
                id: {
                  type: "string",
                  format: "uuid",
                  example: "9f3f983a-86c3-42e1-88f6-5e58129df2be",
                },
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
          title: {
            type: "string",
            example: "Lesson 1: Introduction & Tooling",
          },
          description: {
            type: "string",
            example: "Overview of required dev environments and prerequisites.",
          },
          materialType: {
            type: "string",
            enum: ["VIDEO", "PDF"],
            example: "VIDEO",
          },
          materialLink: {
            type: "string",
            format: "binary",
            description: "Video or PDF material file",
          },
          order: { type: "integer", minimum: 1, example: 1 },
        },
      },
      TeacherQuizCreateDTO: {
        type: "object",
        required: ["title", "duration", "passingScore", "questions"],
        properties: {
          title: { type: "string", example: "Module 1 Assessment Quiz" },
          description: {
            type: "string",
            example: "Test your understanding of core concepts.",
          },
          duration: {
            type: "integer",
            description: "Duration in minutes",
            example: 20,
          },
          passingScore: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            example: 70,
          },
          questions: {
            type: "array",
            items: {
              type: "object",
              required: ["type", "text"],
              properties: {
                type: {
                  type: "string",
                  enum: ["MCQ", "TRUE_FALSE", "WRITTEN"],
                  example: "MCQ",
                },
                text: {
                  type: "string",
                  example: "What is Virtual DOM in React?",
                },
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["text", "isCorrect"],
                    properties: {
                      text: {
                        type: "string",
                        example:
                          "A lightweight JavaScript representation of the DOM",
                      },
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
                answerId: {
                  type: "string",
                  format: "uuid",
                  example: "d9e8f7a6-b5c4-3d2e-1f0a-9876543210ab",
                },
                isCorrect: { type: "boolean", example: true },
                feedback: {
                  type: "string",
                  example: "Great explanation of concepts!",
                },
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
          email: {
            type: "string",
            format: "email",
            example: "nour.khaled@learnex.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "Student@123456",
          },
          phone: { type: "string", example: "+201445678901" },
          country: { type: "string", example: "EG" },
          dateOfBirth: {
            type: "string",
            format: "date",
            example: "2000-09-22",
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
            default: "ACTIVE",
          },
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
          email: {
            type: "string",
            format: "email",
            example: "sara.ibrahim@learnex.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "Teacher@123456",
          },
          phone: { type: "string", example: "+201112345678" },
          subject: { type: "string", example: "Data Science" },
          experienceYears: { type: "integer", example: 5 },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"],
            default: "ACTIVE",
          },
          bio: {
            type: "string",
            example: "Data scientist and ML engineer with 5 years experience.",
          },
          linkedinUrl: {
            type: "string",
            format: "uri",
            example: "https://linkedin.com/in/sara-ibrahim",
          },
          country: { type: "string", example: "EG" },
          courseIds: {
            type: "array",
            items: { type: "string", format: "uuid" },
          },
        },
      },
      AdminCategoryCreateDTO: {
        type: "object",
        required: ["name", "description"],
        properties: {
          name: { type: "string", example: "Artificial Intelligence" },
          description: {
            type: "string",
            example:
              "Courses covering Machine Learning, Deep Learning, and GenAI.",
          },
          slug: { type: "string", example: "artificial-intelligence" },
          locale: { type: "string", enum: ["ar", "en", "fr"], default: "en" },
          image: {
            type: "string",
            format: "binary",
            description: "Category banner icon / image",
          },
        },
      },
      AdminCourseCreateDTO: {
        type: "object",
        required: ["categoryId", "originalPrice", "translations"],
        properties: {
          categoryId: {
            type: "string",
            format: "uuid",
            example: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
          },
          instructorId: {
            type: "string",
            format: "uuid",
            example: "u1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
          },
          level: {
            type: "string",
            enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"],
            default: "BEGINNER",
          },
          status: {
            type: "string",
            enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
            default: "DRAFT",
          },
          enrollmentType: {
            type: "string",
            enum: ["PAID", "FREE"],
            default: "PAID",
          },
          language: { type: "string", default: "english" },
          originalPrice: { type: "number", example: 99.99 },
          salePrice: { type: "number", example: 79.99 },
          currency: { type: "string", default: "USD" },
          durationHours: { type: "integer", example: 40 },
          totalLessonsCount: { type: "integer", example: 50 },
          tags: {
            type: "string",
            description:
              'JSON array string of tags (e.g. ["javascript", "frontend"])',
            example: '["javascript", "frontend"]',
          },
          sections: {
            type: "string",
            description: "JSON array string of course sections and lessons",
            example:
              '[{"order":1,"translations":[{"locale":"en","title":"Course Overview"}],"lessons":[{"order":1,"translations":[{"locale":"en","title":"Welcome to the Course","description":"Getting started overview"}],"durationMinutes":10,"type":"VIDEO"}]}]',
          },
          hasCertificate: { type: "boolean", default: true },
          scheduledAt: { type: "string", format: "date-time" },
          thumbnail: {
            type: "string",
            format: "binary",
            description: "Course thumbnail image",
          },
          previewVideo: {
            type: "string",
            format: "binary",
            description: "Course trailer video",
          },
          translations: {
            type: "array",
            items: {
              type: "object",
              required: ["locale", "title", "description"],
              properties: {
                locale: {
                  type: "string",
                  enum: ["ar", "en", "fr"],
                  example: "en",
                },
                title: {
                  type: "string",
                  example: "Python for Machine Learning Bootcamp",
                },
                description: {
                  type: "string",
                  example:
                    "Master NumPy, Pandas, Scikit-Learn, and Deep Learning.",
                },
                whatYouWillLearn: {
                  type: "array",
                  items: { type: "string" },
                  example: ["Build ML models", "Evaluate neural networks"],
                },
                requirements: {
                  type: "array",
                  items: { type: "string" },
                  example: ["Basic Python knowledge"],
                },
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
          permissionIds: {
            type: "array",
            items: { type: "string" },
            example: ["courses:read", "courses:update"],
          },
        },
      },
      AdminStaffCreateDTO: {
        type: "object",
        required: ["fullName", "email", "password", "roleId"],
        properties: {
          fullName: { type: "string", example: "Ali Kamel" },
          email: {
            type: "string",
            format: "email",
            example: "staff.ali@learnex.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "Staff@123456",
          },
          phone: { type: "string", example: "+201099887766" },
          country: { type: "string", example: "EG" },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE",
          },
          roleId: {
            type: "string",
            format: "uuid",
            example: "r1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
          },
        },
      },
      AdminOfferCreateDTO: {
        type: "object",
        required: ["startDate", "endDate", "translations"],
        properties: {
          courseId: {
            type: "string",
            format: "uuid",
            nullable: true,
            description:
              "(اختياري) معرّف الكورس إذا كان الخصم على كورس محدد. إذا كان العرض عاماً على المنصة، لا ترسله أو اتركه فارغاً.",
          },
          target: {
            type: "string",
            enum: [
              "ALL_USERS",
              "ALL_STUDENTS",
              "ALL_TEACHERS",
              "SPECIFIC_STUDENTS",
              "SPECIFIC_TEACHERS",
              "NEW_USERS",
            ],
            default: "ALL_USERS",
            example: "ALL_USERS",
            description:
              "الفئة المستهدفة:\n- ALL_USERS: جميع مستخدمي المنصة (لا ترسل studentIds أو teacherIds)\n- ALL_STUDENTS: جميع الطلاب (لا ترسل studentIds)\n- ALL_TEACHERS: جميع المدرسين (لا ترسل teacherIds)\n- SPECIFIC_STUDENTS: طلاب محددون فقط (إلزامي إرسال مصفوفة studentIds)\n- SPECIFIC_TEACHERS: مدرسون محددون فقط (إلزامي إرسال مصفوفة teacherIds)\n- NEW_USERS: المستخدمون الجدد خلال آخر 7 أيام فقط (لا ترسل أي IDs)",
          },
          studentIds: {
            type: "array",
            items: { type: "string", format: "uuid" },
            description:
              "مطلوب فقط وحصرياً إذا كان target = SPECIFIC_STUDENTS. في الحالات الأخرى لا يُرسل.",
          },
          teacherIds: {
            type: "array",
            items: { type: "string", format: "uuid" },
            description:
              "مطلوب فقط وحصرياً إذا كان target = SPECIFIC_TEACHERS. في الحالات الأخرى لا يُرسل.",
          },
          offerType: {
            type: "string",
            enum: [
              "PERCENTAGE",
              "FIXED_AMOUNT",
              "BUY_ONE_GET_ONE",
              "FREE_SHIPPING",
              "CUSTOM",
            ],
            default: "PERCENTAGE",
            example: "PERCENTAGE",
            description:
              "نوع العرض:\n- PERCENTAGE: نسبة مئوية (مثلاً 20 تعني خصم 20%)\n- FIXED_AMOUNT: خصم بمبلغ نقدي ثابت (مثلاً 50 تعني خصم $50)\n- BUY_ONE_GET_ONE: اشتري واحد واحصل على واحد\n- FREE_SHIPPING: شحن مجاني\n- CUSTOM: عرض مخصص",
          },
          discount: {
            type: "number",
            example: 25,
            description:
              "قيمة الخصم (إذا كانت نسبة أرسل من 1 إلى 100، وإذا كان مبلغ ثابت أرسل القيمة النقدية)",
          },
          startDate: {
            type: "string",
            format: "date-time",
            example: "2026-10-15T00:00:00.000Z",
            description: "تاريخ بداية العرض (ISO Date)",
          },
          endDate: {
            type: "string",
            format: "date-time",
            example: "2026-11-15T23:59:59.000Z",
            description:
              "تاريخ نهاية العرض (ISO Date - يجب أن يكون بعد تاريخ البداية وليس في الماضي)",
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"],
            default: "ACTIVE",
            example: "ACTIVE",
            description: "حالة العرض: ACTIVE, INACTIVE, SCHEDULED, EXPIRED",
          },
          translations: {
            type: "array",
            description: "بيانات العرض باللغات (إلزامية لغة واحدة على الأقل)",
            items: {
              type: "object",
              required: ["locale", "name", "offerDesc"],
              properties: {
                locale: {
                  type: "string",
                  enum: ["ar", "en", "fr"],
                  example: "en",
                  description: "اللغة: en أو ar أو fr",
                },
                name: {
                  type: "string",
                  example: "خصم الخريف الكبير",
                  description: "اسم العرض (من 3 إلى 150 حرف)",
                },
                offerDesc: {
                  type: "string",
                  example: "خصم 25% على كافة الكورسات لفترة محدودة",
                  description: "وصف العرض (من 5 إلى 2000 حرف)",
                },
              },
            },
          },
        },
        example: {
          target: "ALL_USERS",
          offerType: "PERCENTAGE",
          discount: 25,
          startDate: "2026-10-15T00:00:00.000Z",
          endDate: "2026-11-15T23:59:59.000Z",
          status: "ACTIVE",
          translations: [
            {
              locale: "en",
              name: "New Year Mega Sale",
              offerDesc: "Enjoy 25% off all courses this week only.",
            },
            {
              locale: "ar",
              name: "خصم رأس السنة",
              offerDesc: "تمتع بخصم 25% على جميع الكورسات هذا الأسبوع.",
            },
          ],
        },
      },
      TeacherOfferCreateDTO: {
        type: "object",
        required: ["courseId", "startDate", "endDate", "translations"],
        properties: {
          courseId: {
            type: "string",
            format: "uuid",
            example: "t1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
            description: "Teacher Course ID (must be owned by the teacher)",
          },
          target: {
            type: "string",
            enum: [
              "ALL_USERS",
              "ALL_STUDENTS",
              "SPECIFIC_STUDENTS",
              "NEW_USERS",
            ],
            default: "ALL_USERS",
            example: "ALL_USERS",
            description: "Target audience for the teacher offer",
          },
          studentIds: {
            type: "array",
            items: { type: "string", format: "uuid" },
            description: "List of Student IDs when target is SPECIFIC_STUDENTS",
            example: ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
          },
          offerType: {
            type: "string",
            enum: ["PERCENTAGE", "FIXED"],
            default: "PERCENTAGE",
          },
          discount: { type: "number", example: 20.0 },
          startDate: {
            type: "string",
            format: "date-time",
            example: "2026-01-01T00:00:00.000Z",
          },
          endDate: {
            type: "string",
            format: "date-time",
            example: "2026-12-31T23:59:59.000Z",
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"],
            default: "ACTIVE",
          },
          translations: {
            type: "array",
            items: {
              type: "object",
              required: ["locale", "name", "offerDesc"],
              properties: {
                locale: {
                  type: "string",
                  enum: ["ar", "en", "fr"],
                  example: "en",
                },
                name: { type: "string", example: "Special Course Discount" },
                offerDesc: {
                  type: "string",
                  example: "Limited time discount on my masterclass.",
                },
              },
            },
          },
        },
      },
      AdminReviewVisibilityDTO: {
        type: "object",
        properties: {
          isHidden: {
            type: "boolean",
            example: true,
            description:
              "True to hide review, false to show. If omitted, toggles current value.",
          },
          type: {
            type: "string",
            enum: ["COURSE", "TEACHER"],
            example: "COURSE",
            description: "Review type (optional)",
          },
        },
      },
      AdminCouponCreateDTO: {
        type: "object",
        required: [
          "name",
          "code",
          "discountType",
          "discountValue",
          "startDate",
          "expirationDate",
          "usageLimit",
        ],
        properties: {
          name: { type: "string", example: "Black Friday 50%" },
          code: { type: "string", example: "BLACKFRIDAY50" },
          discountType: {
            type: "string",
            enum: ["PERCENTAGE", "AMOUNT"],
            example: "PERCENTAGE",
          },
          discountValue: { type: "number", example: 50.0 },
          startDate: {
            type: "string",
            format: "date-time",
            example: "2026-11-01T00:00:00.000Z",
          },
          expirationDate: {
            type: "string",
            format: "date-time",
            example: "2026-11-30T23:59:59.000Z",
          },
          usageLimit: { type: "integer", example: 500 },
          maxUsesPerUser: { type: "integer", default: 1, example: 1 },
        },
      },
      BannerTranslationInputDTO: {
        type: "object",
        required: ["locale", "title", "subtitle", "buttonText"],
        properties: {
          locale: { type: "string", enum: ["ar", "en", "fr"], example: "en" },
          title: { type: "string", example: "Autumn Sale" },
          subtitle: { type: "string", example: "Up to 50% off all courses" },
          buttonText: { type: "string", example: "Join now" },
        },
      },

      BannerCreateDTO: {
        type: "object",
        required: ["image", "translations"],
        properties: {
          image: { type: "string", format: "binary" },
          order: { type: "integer", example: 2 },
          actionType: {
            type: "string",
            enum: [
              "DISCOUNT",
              "COURSE",
              "CATEGORY",
              "INSTRUCTORS",
              "EXTERNAL_URL",
              "NONE",
            ],
            default: "DISCOUNT",
            example: "COURSE",
          },
          targetId: {
            type: "string",
            nullable: true,
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          isActive: { type: "boolean", default: true, example: true },
          translations: {
            type: "string",
            example:
              '[{"locale":"en","title":"Autumn Sale","subtitle":"Up to 50% off","buttonText":"Join now"},{"locale":"ar","title":"Autumn Sale AR","subtitle":"Up to 50% off AR","buttonText":"Join now AR"}]',
          },
        },
      },

      BannerUpdateDTO: {
        type: "object",
        properties: {
          image: { type: "string", format: "binary" },
          actionType: {
            type: "string",
            enum: [
              "DISCOUNT",
              "COURSE",
              "CATEGORY",
              "INSTRUCTORS",
              "EXTERNAL_URL",
              "NONE",
            ],
            example: "CATEGORY",
          },
          targetId: { type: "string", nullable: true },
          isActive: { type: "boolean", example: true },
          translations: {
            type: "string",
            example:
              '[{"locale":"en","title":"New title","subtitle":"New subtitle","buttonText":"New button"}]',
          },
        },
      },

      BannerTranslationDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          bannerId: { type: "string", format: "uuid" },
          locale: { type: "string", example: "en" },
          title: { type: "string", example: "Autumn Sale" },
          subtitle: { type: "string", example: "Up to 50% off" },
          buttonText: { type: "string", example: "Join now" },
        },
      },

      BannerReorderDTO: {
        type: "object",
        required: ["order"],
        properties: {
          order: { type: "integer", example: 1 },
        },
      },

      BannerDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          imageUrl: {
            type: "string",
            example: "/uploads/banners/banner-1.png",
          },
          isActive: { type: "boolean", example: true },
          order: { type: "integer", example: 1 },
          actionType: {
            type: "string",
            enum: [
              "DISCOUNT",
              "COURSE",
              "CATEGORY",
              "INSTRUCTORS",
              "EXTERNAL_URL",
              "NONE",
            ],
            example: "COURSE",
          },
          targetId: {
            type: "string",
            nullable: true,
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          translations: {
            type: "array",
            items: { $ref: "#/components/schemas/BannerTranslationDTO" },
          },
        },
      },

      BannerDetailResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: { $ref: "#/components/schemas/BannerDTO" },
        },
      },

      BannerWrappedResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              banner: { $ref: "#/components/schemas/BannerDTO" },
            },
          },
        },
      },

      BannerListResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              banners: {
                type: "array",
                items: { $ref: "#/components/schemas/BannerDTO" },
              },
              pagination: { $ref: "#/components/schemas/PaginationMeta" },
            },
          },
        },
      },
      NotificationCreateDTO: {
        type: "object",
        required: ["translations"],
        properties: {
          receiverId: { type: "string", default: "GLOBAL", example: "GLOBAL" },
          receiverType: {
            type: "string",
            enum: ["GLOBAL", "STUDENT", "TEACHER", "ADMIN", "SYSTEM"],
            default: "GLOBAL",
          },
          type: { type: "string", default: "INFO", example: "SYSTEM_ALERT" },
          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "MEDIUM",
          },
          link: { type: "string", example: "/courses/python-bootcamp" },
          translations: {
            type: "array",
            items: {
              type: "object",
              required: ["locale", "title", "message"],
              properties: {
                locale: { type: "string", example: "en" },
                title: { type: "string", example: "New Course Available!" },
                message: {
                  type: "string",
                  example:
                    "Explore the new Full Stack AI Bootcamp now live on LearnX.",
                },
              },
            },
          },
        },
      },
      SessionPlanTranslationInputDTO: {
        type: "object",
        required: ["title", "description"],
        properties: {
          lang: {
            type: "string",
            enum: ["en", "ar", "fr"],
            default: "en",
            example: "en",
          },
          title: { type: "string", example: "Web Dev Quickstart (3 Sessions)" },
          description: {
            type: "string",
            example:
              "Focused 1-on-1 sessions covering web development foundations.",
          },
          slug: { type: "string", example: "web-dev-quickstart" },
        },
      },
      SessionPlanTranslationDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440002",
          },
          sessionId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          lang: {
            type: "string",
            enum: ["en", "ar", "fr"],
            default: "en",
            example: "en",
          },
          title: { type: "string", example: "Web Dev Quickstart (3 Sessions)" },
          description: {
            type: "string",
            example:
              "Focused 1-on-1 sessions covering web development foundations.",
          },
          slug: { type: "string", example: "web-dev-quickstart" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SessionPlanResponseDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          teacherId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
          color: { type: "string", example: "#2563EB" },
          sessionsCount: { type: "integer", example: 3 },
          price: { type: "number", example: 75.0 },
          discountType: {
            type: "string",
            enum: ["PERCENTAGE", "FIXED"],
            nullable: true,
            example: "PERCENTAGE",
          },
          discountValue: { type: "number", nullable: true, example: 10.0 },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          sessionPlansTranslations: {
            type: "array",
            items: { $ref: "#/components/schemas/SessionPlanTranslationDTO" },
          },
        },
      },
      SessionPlanDetailResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: { $ref: "#/components/schemas/SessionPlanResponseDTO" },
        },
      },
      SessionPlanListResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/SessionPlanResponseDTO" },
              },
              pagination: { $ref: "#/components/schemas/PaginationMeta" },
            },
          },
        },
      },
      CreateSessionPlanDTO: {
        type: "object",
        required: ["sessionsCount", "price", "translations"],
        properties: {
          color: { type: "string", example: "#2563EB" },
          sessionsCount: { type: "integer", minimum: 1, example: 3 },
          price: { type: "number", minimum: 0, example: 75.0 },
          discountType: {
            type: "string",
            enum: ["PERCENTAGE", "FIXED"],
            nullable: true,
            example: "PERCENTAGE",
          },
          discountValue: { type: "number", nullable: true, example: 10.0 },
          isActive: { type: "boolean", default: true, example: true },
          translations: {
            type: "array",
            minItems: 1,
            items: {
              $ref: "#/components/schemas/SessionPlanTranslationInputDTO",
            },
            example: [
              {
                lang: "en",
                title: "Web Dev Quickstart (3 Sessions)",
                description:
                  "Focused 1-on-1 sessions covering web development foundations, HTML/CSS/JS reviews.",
                slug: "web-starter-en",
              },
              {
                lang: "ar",
                title: "خطة البداية السريعة (3 جلسات)",
                description:
                  "جلسات فردية مركزة لأساسيات تطوير الويب ومراجعة مشاريع HTML/CSS/JavaScript.",
                slug: "web-starter-ar",
              },
            ],
          },
        },
      },
      UpdateSessionPlanDTO: {
        type: "object",
        properties: {
          color: { type: "string", example: "#7C3AED" },
          sessionsCount: { type: "integer", minimum: 1, example: 5 },
          price: { type: "number", minimum: 0, example: 120.0 },
          discountType: {
            type: "string",
            enum: ["PERCENTAGE", "FIXED"],
            nullable: true,
            example: "FIXED",
          },
          discountValue: { type: "number", nullable: true, example: 15.0 },
          isActive: { type: "boolean", example: true },
          translations: {
            type: "array",
            items: {
              $ref: "#/components/schemas/SessionPlanTranslationInputDTO",
            },
            example: [
              {
                lang: "en",
                title: "Full-Stack Mastery (5 Sessions)",
                description: "Advanced hands-on React and Node.js mentoring.",
                slug: "fullstack-mastery-en",
              },
            ],
          },
        },
      },
      CreateSessionRequestDTO: {
        type: "object",
        required: ["startAt"],
        properties: {
          title: {
            type: "string",
            minLength: 3,
            maxLength: 150,
            example: "React hooks and state management deep dive",
            description:
              "Optional session request title (min 3, max 150 chars)",
          },
          startAt: {
            type: "string",
            format: "date-time",
            example: "2026-10-15T10:00:00.000Z",
            description:
              "Session start time (ISO 8601). Must match an available teacher slot.",
          },
          note: {
            type: "string",
            maxLength: 500,
            nullable: true,
            example:
              "I would like to focus on custom hooks and performance profiling.",
            description:
              "Optional note or agenda for the teacher (max 500 chars)",
          },
        },
      },
      SessionRequestItemDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          studentId: { type: "string", format: "uuid" },
          teacherId: { type: "string", format: "uuid" },
          title: {
            type: "string",
            nullable: true,
            example: "React hooks deep dive",
          },
          startAt: { type: "string", format: "date-time" },
          endAt: { type: "string", format: "date-time" },
          note: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "EXPIRED"],
            example: "PENDING",
          },
          rejectedReason: { type: "string", nullable: true },
          respondedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          student: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  fullName: { type: "string", example: "Youssef Mahmoud" },
                  profilePhoto: { type: "string", nullable: true },
                },
              },
            },
          },
        },
      },
      TeacherSessionItemDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Private Session" },
          status: {
            type: "string",
            enum: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"],
            example: "SCHEDULED",
          },
          startAt: { type: "string", format: "date-time" },
          endAt: { type: "string", format: "date-time" },
          actualEndAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-10-15T10:48:00.000Z",
          },
          roomName: {
            type: "string",
            nullable: true,
            example: "session_xyz123",
          },
          teacherSubscriptionId: {
            type: "string",
            format: "uuid",
            nullable: true,
          },
          teacherSubscription: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", format: "uuid" },
              type: { type: "string", example: "PLAN" },
              status: { type: "string", example: "ACTIVE" },
              sessionLeft: { type: "integer", example: 4 },
              sessionUsed: { type: "integer", example: 1 },
            },
          },
          request: {
            type: "object",
            properties: {
              title: { type: "string", nullable: true },
              note: { type: "string", nullable: true },
            },
          },
          student: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  fullName: { type: "string", example: "Youssef Mahmoud" },
                  profilePhoto: { type: "string", nullable: true },
                },
              },
            },
          },
        },
      },
      StudentSessionItemDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: {
            type: "string",
            example:
              "🔴 Live Mentoring: Next.js 15 App Router & Server Actions",
          },
          status: {
            type: "string",
            enum: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"],
            example: "SCHEDULED",
          },
          startAt: { type: "string", format: "date-time" },
          endAt: { type: "string", format: "date-time" },
          actualStartAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-10-21T16:15:00.000Z",
          },
          actualEndAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-10-21T17:05:00.000Z",
          },
          studentJoinedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-10-21T16:16:00.000Z",
          },
          roomName: {
            type: "string",
            nullable: true,
            example: "session_live_abc123",
          },
          teacherSubscriptionId: {
            type: "string",
            format: "uuid",
            nullable: true,
          },
          teacherSubscription: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", format: "uuid" },
              type: { type: "string", example: "PLAN" },
              status: { type: "string", example: "ACTIVE" },
              sessionLeft: { type: "integer", example: 12 },
              sessionUsed: { type: "integer", example: 3 },
            },
          },
          request: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", format: "uuid" },
              title: {
                type: "string",
                nullable: true,
                example: "Live mentoring on Next.js 15",
              },
              note: {
                type: "string",
                nullable: true,
                example: "Review server actions and streaming",
              },
            },
          },
          teacher: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  fullName: { type: "string", example: "Ahmed Hassan" },
                  profilePhoto: { type: "string", nullable: true },
                  email: {
                    type: "string",
                    example: "ahmed.hassan@learnex.com",
                  },
                },
              },
            },
          },
        },
      },
      StudentSessionsListResponseDTO: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "STUDENT_SESSIONS_FETCHED_SUCCESSFULLY",
          },
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/StudentSessionItemDTO" },
              },
              meta: { $ref: "#/components/schemas/PaginationMeta" },
            },
          },
        },
      },
      StudentSessionRequestItemDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          studentId: { type: "string", format: "uuid" },
          teacherId: { type: "string", format: "uuid" },
          title: {
            type: "string",
            nullable: true,
            example: "Node.js Microservices & Kafka Integration",
          },
          startAt: { type: "string", format: "date-time" },
          endAt: { type: "string", format: "date-time" },
          note: {
            type: "string",
            nullable: true,
            example: "Want to discuss event-driven patterns with Kafka",
          },
          status: {
            type: "string",
            enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"],
            example: "PENDING",
          },
          rejectedReason: { type: "string", nullable: true },
          respondedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          teacher: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  fullName: { type: "string", example: "Ahmed Hassan" },
                  profilePhoto: { type: "string", nullable: true },
                  email: {
                    type: "string",
                    example: "ahmed.hassan@learnex.com",
                  },
                },
              },
            },
          },
          session: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", format: "uuid" },
              status: { type: "string", example: "SCHEDULED" },
              startAt: { type: "string", format: "date-time" },
              endAt: { type: "string", format: "date-time" },
              roomName: { type: "string", nullable: true },
            },
          },
        },
      },
      StudentSessionRequestsListResponseDTO: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "SESSION_REQUESTS_FETCHED_SUCCESSFULLY",
          },
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/StudentSessionRequestItemDTO",
                },
              },
              meta: { $ref: "#/components/schemas/PaginationMeta" },
            },
          },
        },
      },
      AdminSessionItemDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Private Math Session" },
          status: {
            type: "string",
            enum: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED", "MISSED"],
            example: "SCHEDULED",
          },
          startAt: { type: "string", format: "date-time" },
          endAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          teacher: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              fullName: { type: "string", example: "Dr. Ahmed Mansour" },
              profilePhoto: {
                type: "string",
                nullable: true,
                example: "https://learnx.com/uploads/teacher.jpg",
              },
            },
          },
          student: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              fullName: { type: "string", example: "Youssef Mahmoud" },
              profilePhoto: {
                type: "string",
                nullable: true,
                example: "https://learnx.com/uploads/student.jpg",
              },
            },
          },
        },
      },
      AdminSessionDetailDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Private Math Session" },
          status: {
            type: "string",
            enum: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED", "MISSED"],
            example: "SCHEDULED",
          },
          startAt: { type: "string", format: "date-time" },
          endAt: { type: "string", format: "date-time" },
          actualStartAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          actualEndAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          teacher: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              fullName: { type: "string", example: "Dr. Ahmed Mansour" },
              profilePhoto: {
                type: "string",
                nullable: true,
                example: "https://learnx.com/uploads/teacher.jpg",
              },
              email: {
                type: "string",
                format: "email",
                example: "teacher@learnx.com",
              },
              phone: {
                type: "string",
                nullable: true,
                example: "+201012345678",
              },
            },
          },
          student: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              fullName: { type: "string", example: "Youssef Mahmoud" },
              profilePhoto: {
                type: "string",
                nullable: true,
                example: "https://learnx.com/uploads/student.jpg",
              },
              email: {
                type: "string",
                format: "email",
                example: "student@learnx.com",
              },
              phone: {
                type: "string",
                nullable: true,
                example: "+201098765432",
              },
            },
          },
        },
      },
      AdminSessionsListResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              sessions: {
                type: "array",
                items: { $ref: "#/components/schemas/AdminSessionItemDTO" },
              },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "integer", example: 1 },
                  limit: { type: "integer", example: 20 },
                  totalItems: { type: "integer", example: 45 },
                  totalPages: { type: "integer", example: 3 },
                  hasNextPage: { type: "boolean", example: true },
                },
              },
            },
          },
        },
      },
      AdminSessionDetailResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: { $ref: "#/components/schemas/AdminSessionDetailDTO" },
        },
      },
      CalendarUserDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          fullName: { type: "string", example: "Youssef Mahmoud" },
          profilePhoto: { type: "string", nullable: true },
        },
      },
      CalendarSessionItemDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Private Math Session" },
          status: {
            type: "string",
            enum: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"],
            example: "SCHEDULED",
          },
          startAt: {
            type: "string",
            format: "date-time",
            example: "2026-10-06T10:00:00.000Z",
          },
          endAt: {
            type: "string",
            format: "date-time",
            example: "2026-10-06T10:50:00.000Z",
          },
          teacher: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              user: { $ref: "#/components/schemas/CalendarUserDTO" },
            },
          },
          student: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              user: { $ref: "#/components/schemas/CalendarUserDTO" },
            },
          },
        },
      },
      CalendarResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              stats: {
                type: "object",
                properties: {
                  totalSessions: { type: "integer", example: 16 },
                  scheduled: { type: "integer", example: 8 },
                  completed: { type: "integer", example: 5 },
                  cancelled: { type: "integer", example: 3 },
                },
              },
              calendar: {
                type: "object",
                properties: {
                  year: { type: "integer", example: 2026 },
                  month: { type: "integer", example: 10 },
                  sessionsByDay: {
                    type: "object",
                    description:
                      "Sessions grouped by day, key format YYYY-MM-DD",
                    additionalProperties: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/CalendarSessionItemDTO",
                      },
                    },
                    example: {
                      "2026-10-06": [
                        {
                          id: "2f51339a-27eb-4c03-b322-99739be9a6b8",
                          title: "Private Math Session",
                          status: "SCHEDULED",
                          startAt: "2026-10-06T10:00:00.000Z",
                          endAt: "2026-10-06T10:50:00.000Z",
                          teacher: {
                            id: "t-1",
                            user: {
                              id: "u-1",
                              fullName: "Dr. Ahmed",
                              profilePhoto: null,
                            },
                          },
                          student: {
                            id: "s-1",
                            user: {
                              id: "u-2",
                              fullName: "Youssef",
                              profilePhoto: null,
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      CalendarSessionDetailResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              title: { type: "string" },
              status: { type: "string", example: "SCHEDULED" },
              roomName: { type: "string", nullable: true },
              startAt: { type: "string", format: "date-time" },
              endAt: { type: "string", format: "date-time" },
              actualStartAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              actualEndAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              studentJoinedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              studentLeftAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              teacher: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  headline: { type: "string", nullable: true },
                  subject: { type: "string", nullable: true },
                  user: { $ref: "#/components/schemas/CalendarUserDTO" },
                },
              },
              student: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  user: { $ref: "#/components/schemas/CalendarUserDTO" },
                },
              },
              request: {
                type: "object",
                description: "Original session request (note, status, ...)",
              },
              teacherSubscription: {
                type: "object",
                nullable: true,
                description: "Subscription with its plan",
                properties: {
                  id: { type: "string", format: "uuid" },
                  plan: { type: "object" },
                },
              },
            },
          },
        },
      },
      CreateCustomSessionRequestDTO: {
        type: "object",
        required: ["sessionsCount"],
        properties: {
          sessionsCount: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            example: 4,
            description:
              "Number of 50-minute sessions requested. No dates/schedule are sent now; slots are booked after teacher acceptance and checkout.",
          },
          validityDays: {
            type: "integer",
            minimum: 1,
            maximum: 365,
            default: 30,
            example: 30,
            description: "Package validity duration in days once accepted",
          },
        },
      },
      CustomSessionRequestItemDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          studentId: { type: "string", format: "uuid" },
          teacherId: { type: "string", format: "uuid" },
          sessionsCount: { type: "integer", example: 5 },
          pricePerSession: { type: "number", example: 25.0 },
          totalPrice: { type: "number", example: 125.0 },
          status: {
            type: "string",
            enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"],
            example: "PENDING",
          },
          validityDays: { type: "integer", example: 30 },
          rejectedReason: { type: "string", nullable: true },
          respondedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          student: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  fullName: { type: "string", example: "Youssef Mahmoud" },
                  profilePhoto: { type: "string", nullable: true },
                  email: { type: "string", example: "student@learnex.com" },
                },
              },
            },
          },
          teacher: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  fullName: { type: "string", example: "Ahmed Hassan" },
                  profilePhoto: { type: "string", nullable: true },
                  email: { type: "string", example: "teacher@learnex.com" },
                },
              },
            },
          },
        },
      },
      AdminRejectRequestDTO: {
        type: "object",
        required: ["rejectionReason"],
        properties: {
          rejectionReason: {
            type: "string",
            example: "Course content does not meet platform quality standards",
            description: "Reason for rejecting the request",
          },
        },
      },
      JoinSessionResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SESSION_JOINED_SUCCESSFULLY" },
          data: {
            type: "object",
            properties: {
              sessionId: { type: "string", format: "uuid" },
              roomName: { type: "string", example: "session_live_abc123" },
              token: {
                type: "string",
                description:
                  "Signed Jitsi Meet JWT token for WebRTC video conference room",
              },
            },
          },
        },
      },
      AdminDashboardStatsResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "DASHBOARD_STATS_FETCHED_SUCCESSFULLY",
          },
          data: {
            type: "object",
            properties: {
              cards: {
                type: "object",
                properties: {
                  totalStudents: {
                    type: "object",
                    properties: {
                      count: { type: "integer", example: 2580 },
                      subTitle: {
                        type: "string",
                        example: "Across all courses",
                      },
                      growthPercent: {
                        type: "number",
                        example: 12.4,
                        description: "Growth % compared to last month",
                      },
                    },
                  },
                  totalTeachers: {
                    type: "object",
                    properties: {
                      count: { type: "integer", example: 48 },
                      pendingApprovalCount: {
                        type: "integer",
                        example: 8,
                        description: "Teachers pending admin review",
                      },
                      thisMonthCount: {
                        type: "integer",
                        example: 4,
                        description: "New teachers joined this month",
                      },
                    },
                  },
                  activeCourses: {
                    type: "object",
                    properties: {
                      count: {
                        type: "integer",
                        example: 34,
                        description: "Published courses count",
                      },
                      draftCount: {
                        type: "integer",
                        example: 9,
                        description: "Courses currently in draft",
                      },
                      thisMonthCount: {
                        type: "integer",
                        example: 6,
                        description: "Courses published this month",
                      },
                    },
                  },
                  monthlyRevenue: {
                    type: "object",
                    properties: {
                      amount: {
                        type: "number",
                        example: 98700,
                        description: "Total revenue for the current month",
                      },
                      monthName: { type: "string", example: "Nov 2024" },
                      growthPercent: {
                        type: "number",
                        example: 14.8,
                        description: "Revenue growth % vs previous month",
                      },
                    },
                  },
                  activeSessions: {
                    type: "object",
                    properties: {
                      count: {
                        type: "integer",
                        example: 1248,
                        description: "Live/active sessions right now",
                      },
                      subTitle: { type: "string", example: "Right now" },
                      growthPercent: {
                        type: "number",
                        example: -3.1,
                        description: "Session growth % vs yesterday",
                      },
                    },
                  },
                },
              },
              charts: {
                type: "object",
                properties: {
                  selectedYear: { type: "integer", example: 2026 },
                  yearlyOverview: {
                    type: "array",
                    description:
                      "Monthly enrollment and revenue stats for the selected year",
                    items: {
                      type: "object",
                      properties: {
                        month: { type: "string", example: "Oct" },
                        enrolledStudents: { type: "integer", example: 400 },
                        revenue: { type: "number", example: 15400 },
                      },
                    },
                  },
                  courseCategories: {
                    type: "array",
                    description:
                      "Student enrollments distribution per course category",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string", example: "Technology" },
                        slug: { type: "string", example: "technology" },
                        image: {
                          type: "string",
                          nullable: true,
                          example: "https://learnex.com/uploads/cat.png",
                        },
                        enrollmentsCount: { type: "integer", example: 420 },
                        percentage: { type: "number", example: 42 },
                      },
                    },
                  },
                },
              },
              recentNotifications: {
                type: "array",
                description:
                  "Top 5 recent notifications for admin with localized titles and messages",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    type: { type: "string", example: "INFO" },
                    priority: { type: "string", example: "HIGH" },
                    link: {
                      type: "string",
                      nullable: true,
                      example: "/courses/detail",
                    },
                    isRead: { type: "boolean", example: false },
                    title: {
                      type: "string",
                      example: "New Student Registration",
                    },
                    message: {
                      type: "string",
                      example:
                        "Sarah Johnson just registered for Complete Web Development 2024.",
                    },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
              recentActivities: {
                type: "array",
                description:
                  "Top 5 live educational activities across the platform (enrollments, new courses published, live sessions)",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example:
                        "enrollment-550e8400-e29b-41d4-a716-446655440000",
                    },
                    type: {
                      type: "string",
                      enum: ["ENROLLMENT", "COURSE_PUBLISHED", "SESSION"],
                      example: "ENROLLMENT",
                    },
                    action: { type: "string", example: "ENROLLED" },
                    title: {
                      type: "string",
                      example: "Sarah Johnson enrolled in Complete Web Dev",
                    },
                    actor: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string", example: "Sarah Johnson" },
                        photo: {
                          type: "string",
                          nullable: true,
                          example: "https://learnex.com/uploads/photo.jpg",
                        },
                      },
                    },
                    target: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string", example: "Complete Web Dev" },
                      },
                    },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
      AdminConversationUserDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "450e8400-e29b-41d4-a716-446655440001",
          },
          fullName: { type: "string", example: "Youssef Mahmoud" },
          profilePhoto: {
            type: "string",
            nullable: true,
            example: "https://example.com/avatar.jpg",
          },
          role: { type: "string", nullable: true, example: "STUDENT" },
          userType: {
            type: "string",
            enum: ["STUDENT", "TEACHER", "OTHER"],
            example: "STUDENT",
          },
        },
      },
      AdminConversationItemDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          userId: {
            type: "string",
            format: "uuid",
            example: "450e8400-e29b-41d4-a716-446655440001",
          },
          user: { $ref: "#/components/schemas/AdminConversationUserDTO" },
          lastMessage: {
            type: "string",
            nullable: true,
            example: "السلام عليكم، هل يمكن تقسيط الدبلومة الشاملة؟",
          },
          lastMessageAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-10-18T12:30:00.000Z",
          },
          unreadAdminCount: { type: "integer", example: 1 },
          unreadUserCount: { type: "integer", example: 0 },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-10-17T10:00:00.000Z",
          },
        },
      },
      AdminConversationsResponseDTO: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "CONVERSATION_RETRIEVED_SUCCESSFULLY",
          },
          data: {
            type: "object",
            properties: {
              conversations: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/AdminConversationItemDTO",
                },
              },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "integer", example: 1 },
                  limit: { type: "integer", example: 20 },
                  totalItems: { type: "integer", example: 5 },
                  totalPages: { type: "integer", example: 1 },
                  hasNextPage: { type: "boolean", example: false },
                },
              },
            },
          },
        },
      },

      // ═══════════════════════════════════════════════════════════
      // Support Tickets Schemas
      // ═══════════════════════════════════════════════════════════
      SupportTicketUserDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
          fullName: { type: "string", example: "Dr. Ahmed Hassan" },
          email: {
            type: "string",
            format: "email",
            example: "ahmed.hassan@learnex.com",
          },
          profilePhoto: {
            type: "string",
            nullable: true,
            example: "/uploads/avatars/user.jpg",
          },
        },
      },
      SupportTicketUserDetailDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
          fullName: { type: "string", example: "Dr. Ahmed Hassan" },
          email: {
            type: "string",
            format: "email",
            example: "ahmed.hassan@learnex.com",
          },
          phone: { type: "string", nullable: true, example: "+201001234567" },
          profilePhoto: {
            type: "string",
            nullable: true,
            example: "/uploads/avatars/user.jpg",
          },
          role: {
            type: "object",
            properties: {
              slug: { type: "string", example: "teacher" },
              roleTranslations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Teacher" },
                    lang: { type: "string", example: "en" },
                  },
                },
              },
            },
          },
        },
      },
      SupportAttachmentDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440002",
          },
          messageId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440003",
          },
          fileName: { type: "string", example: "screenshot.png" },
          storageKey: {
            type: "string",
            example: "uploads/support/attachments/uuid/screenshot.png",
          },
          mimeType: { type: "string", example: "image/png" },
          size: { type: "integer", example: 1048576 },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      SupportMessageSenderDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
          fullName: { type: "string", example: "Support Agent" },
          email: {
            type: "string",
            nullable: true,
            example: "support@learnex.com",
          },
          profilePhoto: {
            type: "string",
            nullable: true,
            example: "/uploads/avatars/agent.jpg",
          },
        },
      },
      SupportMessageDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440003",
          },
          ticketId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          senderId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
          body: {
            type: "string",
            example:
              "Hello, we have reviewed your request and resolved the issue.",
          },
          createdAt: { type: "string", format: "date-time" },
          sender: { $ref: "#/components/schemas/SupportMessageSenderDTO" },
          attachments: {
            type: "array",
            items: { $ref: "#/components/schemas/SupportAttachmentDTO" },
          },
        },
      },
      AdminTicketListItemDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          ticketNumber: { type: "integer", example: 1001 },
          subject: {
            type: "string",
            example: "Issue with course video upload",
          },
          status: {
            type: "string",
            enum: [
              "OPEN",
              "IN_PROGRESS",
              "WAITING_FOR_TEACHER",
              "RESOLVED",
              "CLOSED",
            ],
            example: "OPEN",
          },
          priority: {
            type: "string",
            enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
            example: "NORMAL",
          },
          userId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
          assignedStaffId: {
            type: "string",
            format: "uuid",
            nullable: true,
            example: "550e8400-e29b-41d4-a716-446655440005",
          },
          lastMessageAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          resolvedAt: { type: "string", format: "date-time", nullable: true },
          closedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          user: { $ref: "#/components/schemas/SupportTicketUserDTO" },
          staff: {
            $ref: "#/components/schemas/SupportTicketUserDTO",
            nullable: true,
          },
        },
      },
      AdminTicketDetailDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          ticketNumber: { type: "integer", example: 1001 },
          subject: {
            type: "string",
            example: "Issue with course video upload",
          },
          status: {
            type: "string",
            enum: [
              "OPEN",
              "IN_PROGRESS",
              "WAITING_FOR_TEACHER",
              "RESOLVED",
              "CLOSED",
            ],
            example: "OPEN",
          },
          priority: {
            type: "string",
            enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
            example: "NORMAL",
          },
          userId: { type: "string", format: "uuid" },
          assignedStaffId: { type: "string", format: "uuid", nullable: true },
          lastMessageAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          resolvedAt: { type: "string", format: "date-time", nullable: true },
          closedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          user: { $ref: "#/components/schemas/SupportTicketUserDetailDTO" },
          staff: {
            $ref: "#/components/schemas/SupportTicketUserDTO",
            nullable: true,
          },
          supportMessages: {
            type: "array",
            items: { $ref: "#/components/schemas/SupportMessageDTO" },
          },
        },
      },
      AdminTicketListResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/AdminTicketListItemDTO" },
              },
              pagination: { $ref: "#/components/schemas/PaginationMeta" },
            },
          },
        },
      },
      AdminTicketDetailResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: { $ref: "#/components/schemas/AdminTicketDetailDTO" },
        },
      },
      TicketMessagesCursorResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/SupportMessageDTO" },
              },
              nextCursor: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "string", format: "uuid" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
              hasMore: { type: "boolean", example: false },
            },
          },
        },
      },
      AdminAssignTicketDTO: {
        type: "object",
        required: ["staffId"],
        properties: {
          staffId: {
            type: "string",
            format: "uuid",
            nullable: true,
            example: "550e8400-e29b-41d4-a716-446655440005",
            description:
              "Staff User UUID to assign the ticket to, or null to unassign",
          },
        },
      },
      AdminChangeTicketStatusDTO: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: [
              "OPEN",
              "IN_PROGRESS",
              "WAITING_FOR_TEACHER",
              "RESOLVED",
              "CLOSED",
            ],
            example: "IN_PROGRESS",
            description: "New status of the support ticket",
          },
        },
      },
      TeacherCreateTicketDTO: {
        type: "object",
        required: ["subject", "priority", "message"],
        properties: {
          subject: {
            type: "string",
            example: "Question regarding monthly payout",
          },
          priority: {
            type: "string",
            enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
            example: "NORMAL",
          },
          message: {
            type: "string",
            example:
              "Hello, when will the monthly session payouts be processed?",
          },
          attachment: {
            type: "string",
            format: "binary",
            description:
              "Optional file attachment (image or document up to 5MB)",
          },
        },
      },
      TicketSendMessageDTO: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            example: "Here is the screenshot of the error.",
          },
          attachment: {
            type: "string",
            format: "binary",
            description:
              "Optional file attachment (image or document up to 5MB)",
          },
        },
      },
      TeacherReopenTicketDTO: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            example: "The issue occurred again today, reopening this ticket.",
          },
          attachment: {
            type: "string",
            format: "binary",
            description:
              "Optional file attachment (image or document up to 5MB)",
          },
        },
      },
      TeacherTicketListItemDTO: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          ticketNumber: { type: "integer", example: 1001 },
          subject: {
            type: "string",
            example: "Question regarding monthly payout",
          },
          status: {
            type: "string",
            enum: [
              "OPEN",
              "IN_PROGRESS",
              "WAITING_FOR_TEACHER",
              "RESOLVED",
              "CLOSED",
            ],
            example: "OPEN",
          },
          priority: {
            type: "string",
            enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
            example: "NORMAL",
          },
          userId: { type: "string", format: "uuid" },
          assignedStaffId: { type: "string", format: "uuid", nullable: true },
          lastMessageAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          resolvedAt: { type: "string", format: "date-time", nullable: true },
          closedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TeacherTicketListResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/TeacherTicketListItemDTO",
                },
              },
              pagination: { $ref: "#/components/schemas/PaginationMeta" },
            },
          },
        },
      },
      TeacherTicketDetailResponseDTO: {
        type: "object",
        properties: {
          message: { type: "string", example: "SUCCESS" },
          data: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
                example: "550e8400-e29b-41d4-a716-446655440000",
              },
              ticketNumber: { type: "integer", example: 1001 },
              subject: {
                type: "string",
                example: "Question regarding monthly payout",
              },
              status: {
                type: "string",
                enum: [
                  "OPEN",
                  "IN_PROGRESS",
                  "WAITING_FOR_TEACHER",
                  "RESOLVED",
                  "CLOSED",
                ],
                example: "OPEN",
              },
              priority: {
                type: "string",
                enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
                example: "NORMAL",
              },
              userId: { type: "string", format: "uuid" },
              assignedStaffId: {
                type: "string",
                format: "uuid",
                nullable: true,
              },
              lastMessageAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              resolvedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              closedAt: { type: "string", format: "date-time", nullable: true },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              staff: {
                $ref: "#/components/schemas/SupportTicketUserDTO",
                nullable: true,
              },
              supportMessages: {
                type: "array",
                items: { $ref: "#/components/schemas/SupportMessageDTO" },
              },
            },
          },
        },
      },

      // Chat Schemas
      ChatStartConversationDTO: {
        type: "object",
        description:
          "Pass either teacherId (if student) or studentId (if teacher)",
        properties: {
          teacherId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          studentId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
        },
      },
      ChatParticipantDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          fullName: { type: "string", example: "Dr. Ahmed Hassan" },
          profilePhoto: {
            type: "string",
            nullable: true,
            example: "https://example.com/avatar.jpg",
          },
        },
      },
      ChatConversationItemDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          lastMessage: {
            type: "string",
            example: "Hello, when is our next session?",
          },
          lastMessageAt: { type: "string", format: "date-time" },
          unreadCount: { type: "integer", example: 2 },
          participant: { $ref: "#/components/schemas/ChatParticipantDTO" },
        },
      },
      ChatMessageDTO: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          content: {
            type: "string",
            example: "Hello, can you help me with this quiz?",
          },
          senderId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          isMine: { type: "boolean", example: true },
          sender: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              fullName: { type: "string", example: "Youssef Mahmoud" },
              profilePhoto: { type: "string", nullable: true },
            },
          },
        },
      },
      ChatUnreadCountResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "UNREAD_COUNT_RETRIEVED_SUCCESSFULLY",
          },
          status: { type: "integer", example: 200 },
          data: {
            type: "object",
            properties: {
              totalUnread: { type: "integer", example: 5 },
            },
          },
        },
      },
      ChatConversationsListResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "CONVERSATIONS_RETRIEVED_SUCCESSFULLY",
          },
          status: { type: "integer", example: 200 },
          data: {
            type: "object",
            properties: {
              conversations: {
                type: "array",
                items: { $ref: "#/components/schemas/ChatConversationItemDTO" },
              },
              pagination: { $ref: "#/components/schemas/PaginationMeta" },
            },
          },
        },
      },
      ChatMessageHistoryResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "MESSAGES_RETRIEVED_SUCCESSFULLY",
          },
          status: { type: "integer", example: 200 },
          data: {
            type: "object",
            properties: {
              messages: {
                type: "array",
                items: { $ref: "#/components/schemas/ChatMessageDTO" },
              },
              nextCursor: {
                type: "string",
                format: "uuid",
                nullable: true,
                example: "550e8400-e29b-41d4-a716-446655440000",
              },
              hasMore: { type: "boolean", example: false },
            },
          },
        },
      },
      ChatConversationDetailResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "CONVERSATION_INITIALIZED_SUCCESSFULLY",
          },
          status: { type: "integer", example: 200 },
          data: { $ref: "#/components/schemas/ChatConversationItemDTO" },
        },
      },
    },
  },
  tags: [
    {
      name: "Chat",
      description: "Direct real-time messaging between students and teachers",
    },
    {
      name: "Admin - Auth",
      description: "Admin login, logout, and token refresh",
    },

    {
      name: "Admin - Dashboard",
      description:
        "Admin dashboard metrics, overview KPI cards, charts, and live activities",
    },
    {
      name: "Admin - Students",
      description: "Students management, status toggling, and Excel export",
    },
    {
      name: "Admin - Teachers",
      description:
        "Teacher verification, application reviews, certificates, and course approvals",
    },
    {
      name: "Admin - Certificates",
      description: "Admin certificate management, inspection, and deletion",
    },
    {
      name: "Admin - Categories",
      description: "Course categories with multilingual translations and icons",
    },
    {
      name: "Admin - Courses",
      description:
        "Central courses, curriculum sections, and video/text lessons",
    },
    {
      name: "Admin - Staff",
      description: "Staff members, administrative roles, and privileges",
    },
    {
      name: "Admin - Roles & Permissions",
      description: "RBAC roles, permission sets, and localized titles",
    },
    {
      name: "Admin - Coupons",
      description: "Discount vouchers, redemption limits, and status toggles",
    },
    {
      name: "Admin - Banners",
      description:
        "Banners management (image, translations, action type, and target)",
    },
    {
      name: "Admin - Offers",
      description:
        "Promotional offers, percentage discounts, and validity schedules",
    },
    {
      name: "Admin - Plans",
      description: "Admin monitoring and management of teacher session plans",
    },
    {
      name: "Admin - Reviews",
      description:
        "Admin reviews management, visibility toggle (isHidden), and statistics",
    },
    {
      name: "Admin - Activity Logs",
      description:
        "Audit trail, security metrics, and real-time activity tracking",
    },
    {
      name: "Admin - Settings & CMS",
      description: "App metadata, logo branding, and static CMS pages",
    },
    {
      name: "Admin - Requests",
      description:
        "Admin requests management, overview statistics, approvals, and rejections",
    },
    {
      name: "Admin - Sessions",
      description: "Admin monitoring of sessions (today, upcoming, history)",
    },

    {
      name: "Teacher - Auth",
      description:
        "Teacher registration with CV upload, login, and password recovery",
    },
    {
      name: "Teacher - Profile",
      description:
        "Teacher bio, hourly session pricing, avatar uploads, and visibility",
    },
    {
      name: "Teacher - Plans",
      description:
        "Teacher session plans, multi-session bundles, and multilingual packages",
    },
    {
      name: "Teacher - Certificates",
      description:
        "Teacher academic/professional credentials submission and tracking",
    },
    {
      name: "Teacher - Courses",
      description: "Teacher self-published courses CRUD",
    },
    {
      name: "Teacher - Sections",
      description: "Curriculum modules and section reordering",
    },
    {
      name: "Teacher - Items",
      description: "Lesson materials (Video / PDF / Document uploads)",
    },
    {
      name: "Teacher - Quizzes",
      description: "Section quizzes, MCQ questions, submissions, and grading",
    },
    {
      name: "Teacher - Sessions",
      description:
        "Teacher session requests management (view, accept, reject) and live sessions (start, end)",
    },
    {
      name: "Teacher - Offers",
      description: "Teacher personal course promotional offers",
    },
    {
      name: "Teacher - Reviews",
      description: "Teacher session and course reviews overview",
    },

    {
      name: "Student - Auth",
      description:
        "Student signup, OTP email verification, login, and password recovery",
    },
    {
      name: "Student - Profile",
      description:
        "Personal data, avatar/cover images, password change, and deletion",
    },
    {
      name: "Student - Courses",
      description: "Favorite courses wishlist toggle and personalized listing",
    },
    {
      name: "Student - Teachers",
      description: "Browse verified teachers and inspect public portfolios",
    },
    {
      name: "Student - Cart",
      description:
        "Shopping cart items management, pricing, and checkout cleanup",
    },
    {
      name: "Student - Saved",
      description: "Student saved courses management",
    },
    {
      name: "Student - Quizzes",
      description: "Student quiz taking, submission, and grading results",
    },
    {
      name: "Student - Reviews",
      description: "Student course and teacher review submission and history",
    },

    {
      name: "Notifications",
      description:
        "Global and user-specific push notifications and read receipts",
    },
    {
      name: "Settings",
      description:
        "Public app metadata, terms/privacy pages, and language preferences",
    },
    {
      name: "Student - Sessions",
      description:
        "Browse teacher availability, create & cancel 1-on-1 session requests",
    },
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
                  accessToken: {
                    type: "string",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
                  refreshToken: {
                    type: "string",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // ADMIN DASHBOARD & STATS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/states": {
      get: {
        summary: "Get Admin Dashboard Overview Stats & Analytics",
        tags: ["Admin - Dashboard"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "year",
            schema: { type: "integer", default: 2026 },
            description:
              "Calendar year for charts overview (defaults to current year)",
            example: 2026,
          },
          localeQueryParam,
        ],
        responses: {
          200: {
            description: "Dashboard stats fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminDashboardStatsResponse",
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED"] },
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  status: {
                    type: "string",
                    enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
                    example: "ACTIVE",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"],
            },
          },
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  courseIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" },
                    example: ["7d4f983a-86c3-42e1-88f6-5e58129df2be"],
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
                  status: {
                    type: "string",
                    enum: ["APPROVED", "REJECTED"],
                    example: "APPROVED",
                  },
                  rejectionReason: {
                    type: "string",
                    example: "Please update video resolution in module 1.",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // ADMIN CERTIFICATES
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/certificates": {
      get: {
        summary: "Get All Certificates (Paginated)",
        description:
          "Retrieve a paginated list of all teacher certificates with optional keyword search across certificate title, issuer, or teacher name, plus type and status filtering.",
        tags: ["Admin - Certificates"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "type",
            schema: {
              type: "string",
              enum: ["ACADEMIC", "COURSE", "EXPERIENCE", "OTHER"],
            },
            description: "Filter certificates by type",
            example: "ACADEMIC",
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "VERIFIED", "REJECTED"],
            },
            description: "Filter certificates by verification status",
            example: "VERIFIED",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/certificates/{id}": {
      get: {
        summary: "Get Certificate Details by ID",
        description:
          "Retrieve detailed information for a specific teacher certificate including teacher profile.",
        tags: ["Admin - Certificates"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Certificate ID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Certificate by ID",
        description:
          "Permanently delete a teacher certificate and its associated uploaded file.",
        tags: ["Admin - Certificates"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Certificate ID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Admin Courses",
        tags: ["Admin - Courses"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "categoryId",
            schema: { type: "string", format: "uuid" },
          },
          {
            in: "query",
            name: "instructorId",
            schema: { type: "string", format: "uuid" },
          },
          {
            in: "query",
            name: "level",
            schema: {
              type: "string",
              enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"],
            },
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
            },
          },
          {
            in: "query",
            name: "enrollmentType",
            schema: { type: "string", enum: ["PAID", "FREE"] },
          },
          {
            in: "query",
            name: "sort",
            schema: {
              type: "string",
              enum: [
                "newest",
                "oldest",
                "price_asc",
                "price_desc",
                "rating",
                "students",
              ],
            },
          },
        ],
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "COURSES_FETCHED_SUCCESSFULLY",
              },
              data: {
                type: "object",
                properties: {
                  type: { type: "string", example: "COURSE" },
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
    "/api/v1/admin/courses/teacher-courses": {
      get: {
        summary: "Get All Teacher Courses",
        tags: ["Admin - Courses"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          { in: "query", name: "search", schema: { type: "string" } },
          {
            in: "query",
            name: "teacherId",
            schema: { type: "string", format: "uuid" },
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
          },
          {
            in: "query",
            name: "sort",
            schema: {
              type: "string",
              enum: ["newest", "oldest", "price_asc", "price_desc"],
            },
          },
        ],
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "COURSES_FETCHED_SUCCESSFULLY",
              },
              data: {
                type: "object",
                properties: {
                  type: { type: "string", example: "TEACHER_COURSE" },
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  status: {
                    type: "string",
                    enum: [
                      "DRAFT",
                      "PUBLISHED",
                      "ARCHIVED",
                      "PENDING",
                      "APPROVED",
                      "REJECTED",
                    ],
                    example: "PUBLISHED",
                  },
                  rejectionReason: {
                    type: "string",
                    example: "Please update the audio quality in chapter 1.",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
                  title: {
                    type: "string",
                    example: "Chapter 1: Getting Started",
                  },
                  order: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  type: {
                    type: "string",
                    enum: ["VIDEO", "ARTICLE", "DOCUMENT"],
                    default: "VIDEO",
                  },
                  contentUrl: {
                    type: "string",
                    format: "uri",
                    example: "https://youtube.com/watch?v=123",
                  },
                  isFreePreview: { type: "boolean", default: false },
                  translations: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["locale", "title"],
                      properties: {
                        locale: {
                          type: "string",
                          enum: ["ar", "en", "fr"],
                          example: "en",
                        },
                        title: {
                          type: "string",
                          example: "Lesson 1: Project Setup",
                        },
                        description: {
                          type: "string",
                          example: "How to initialize project workspace.",
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  type: {
                    type: "string",
                    enum: ["VIDEO", "ARTICLE", "DOCUMENT"],
                  },
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
          },
          {
            in: "query",
            name: "roleId",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  status: {
                    type: "string",
                    enum: ["ACTIVE", "INACTIVE"],
                    example: "INACTIVE",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
              examples: {
                CourseOffer_SpecificStudents: {
                  summary:
                    "1. عرض على كورس محدد لطلاب معينين (مع courseId و studentIds)",
                  value: {
                    courseId: "01513780-0339-401a-ae47-ee10b28b4740",
                    target: "SPECIFIC_STUDENTS",
                    studentIds: ["01a44631-bd43-48e7-840c-af4c5b4c434f"],
                    offerType: "PERCENTAGE",
                    discount: 35,
                    startDate: "2026-10-15T00:00:00.000Z",
                    endDate: "2026-11-30T23:59:59.000Z",
                    status: "ACTIVE",
                    translations: [
                      {
                        locale: "en",
                        name: "Exclusive Student Reward",
                        offerDesc:
                          "35% exclusive discount for our top students on this course.",
                      },
                      {
                        locale: "ar",
                        name: "مكافأة الطلاب المميزين",
                        offerDesc:
                          "خصم 35% حصري للطلاب المختارين على هذا الكورس.",
                      },
                    ],
                  },
                },
                CourseOffer_AllUsers: {
                  summary:
                    "2. عرض على كورس محدد لكافة المستخدمين (مع courseId فقط)",
                  value: {
                    courseId: "01513780-0339-401a-ae47-ee10b28b4740",
                    target: "ALL_USERS",
                    offerType: "PERCENTAGE",
                    discount: 30,
                    startDate: "2026-10-15T00:00:00.000Z",
                    endDate: "2026-11-30T23:59:59.000Z",
                    status: "ACTIVE",
                    translations: [
                      {
                        locale: "en",
                        name: "Special Course Discount",
                        offerDesc:
                          "Special 30% discount on this course for all users.",
                      },
                      {
                        locale: "ar",
                        name: "عرض خاص على هذا الكورس",
                        offerDesc:
                          "خصم خاص 30% على هذا الكورس لجميع المستخدمين.",
                      },
                    ],
                  },
                },
                AllUsers_GeneralPlatformOffer: {
                  summary:
                    "3. عرض عام على كافة كورسات المنصة (بدون courseId وبدون IDs)",
                  value: {
                    target: "ALL_USERS",
                    offerType: "PERCENTAGE",
                    discount: 25,
                    startDate: "2026-10-15T00:00:00.000Z",
                    endDate: "2026-11-30T23:59:59.000Z",
                    status: "ACTIVE",
                    translations: [
                      {
                        locale: "en",
                        name: "Autumn Big Sale",
                        offerDesc:
                          "Get 25% discount across the entire platform.",
                      },
                      {
                        locale: "ar",
                        name: "عروض الخريف الكبرى",
                        offerDesc: "احصل على خصم 25% على كافة محتويات المنصة.",
                      },
                    ],
                  },
                },
                SpecificTeachersOffer: {
                  summary: "4. عرض مخصص لمدرسين محددين (مع teacherIds)",
                  value: {
                    target: "SPECIFIC_TEACHERS",
                    teacherIds: ["93ef0d68-18e3-4b91-ae28-66236b2f763f"],
                    offerType: "PERCENTAGE",
                    discount: 20,
                    startDate: "2026-10-15T00:00:00.000Z",
                    endDate: "2026-11-30T23:59:59.000Z",
                    status: "ACTIVE",
                    translations: [
                      {
                        locale: "en",
                        name: "Teacher Appreciation Offer",
                        offerDesc:
                          "Exclusive 20% discount for partner teachers.",
                      },
                      {
                        locale: "ar",
                        name: "عرض تقدير المعلمين",
                        offerDesc: "خصم 20% حصري للمعلمين الشركاء.",
                      },
                    ],
                  },
                },
                NewUsersOffer: {
                  summary: "5. عرض للمستخدمين الجدد (خلال آخر 7 أيام)",
                  value: {
                    target: "NEW_USERS",
                    offerType: "PERCENTAGE",
                    discount: 15,
                    startDate: "2026-10-15T00:00:00.000Z",
                    endDate: "2026-11-30T23:59:59.000Z",
                    status: "ACTIVE",
                    translations: [
                      {
                        locale: "en",
                        name: "Welcome Gift For New Joiners",
                        offerDesc:
                          "15% off for users registered in the last 7 days.",
                      },
                      {
                        locale: "ar",
                        name: "هدية ترحيبية للمسجلين الجدد",
                        offerDesc:
                          "خصم 15% للمستخدمين المسجلين خلال آخر 7 أيام.",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"],
            },
          },
          {
            in: "query",
            name: "offerType",
            schema: { type: "string", enum: ["PERCENTAGE", "FIXED"] },
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  status: {
                    type: "string",
                    enum: ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"],
                    example: "ACTIVE",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    // ═══════════════════════════════════════════════════════════
    // ADMIN BANNERS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/banners": {
      get: {
        summary: "Get All Banners",
        tags: ["Admin - Banners"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "locale",
            schema: { type: "string", enum: ["ar", "en", "fr"], default: "en" },
          },
          {
            in: "query",
            name: "isActive",
            schema: { type: "boolean" },
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/BannerListResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
      post: {
        summary: "Create Banner",
        tags: ["Admin - Banners"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/BannerCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({
            $ref: "#/components/schemas/BannerDetailResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/banners/{id}": {
      get: {
        summary: "Get Banner by ID",
        tags: ["Admin - Banners"],
        security: bearerSecurity,
        parameters: [
          uuidParam("id", "Banner ID"),
          {
            in: "query",
            name: "locale",
            schema: { type: "string", enum: ["ar", "en", "fr"] },
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/BannerDetailResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Banner",
        tags: ["Admin - Banners"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Banner ID")],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/BannerUpdateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/BannerWrappedResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Banner",
        tags: ["Admin - Banners"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Banner ID")],
        responses: {
          ...standardResponses[204](),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/banners/{id}/status": {
      patch: {
        summary: "Update Banner Status",
        tags: ["Admin - Banners"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Banner ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["isActive"],
                properties: { isActive: { type: "boolean", example: false } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Banner status updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "SUCCESS" },
                    data: {
                      type: "object",
                      properties: {
                        banner: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            isActive: { type: "boolean", example: false },
                            updatedAt: { type: "string", format: "date-time" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/banners/{id}/re-order": {
      patch: {
        summary: "Update Banner Re-order",
        tags: ["Admin - Banners"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Banner ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BannerReorderDTO" },
            },
          },
        },
        responses: {
          200: {
            description: "Banner re-ordered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "SUCCESS" },
                    data: {
                      type: "object",
                      properties: {
                        banner: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            isActive: { type: "boolean", example: false },
                            updatedAt: { type: "string", format: "date-time" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    // ══════════════════════════════════════════════════════════
    // ADMIN COUPONS
    // ═══════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════
    // ADMIN REVIEWS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/reviews": {
      get: {
        summary: "Get All Reviews (Courses & Teachers)",
        tags: ["Admin - Reviews"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "type",
            schema: { type: "string", enum: ["COURSE", "TEACHER"] },
            description:
              "Filter reviews by type (COURSE for admin courses, TEACHER for teacher reviews). If omitted, returns both.",
            example: "COURSE",
          },
          {
            in: "query",
            name: "subType",
            schema: { type: "string", enum: ["COURSE", "SESSION"] },
            description:
              "Sub-type filter when type is TEACHER: 'COURSE' for teacher course reviews, 'SESSION' for teacher session evaluations. If omitted, returns both.",
            example: "COURSE",
          },
          {
            in: "query",
            name: "isHidden",
            schema: { type: "boolean" },
            description:
              "Filter by hidden status (true for hidden, false for visible)",
            example: false,
          },
          {
            in: "query",
            name: "rating",
            schema: { type: "integer", minimum: 1, maximum: 5 },
            description: "Filter by star rating",
            example: 5,
          },
          {
            in: "query",
            name: "courseId",
            schema: { type: "string", format: "uuid" },
            description: "Filter by specific course ID",
          },
          {
            in: "query",
            name: "teacherId",
            schema: { type: "string", format: "uuid" },
            description: "Filter by specific teacher ID",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/reviews/stats": {
      get: {
        summary: "Get Reviews Dashboard Statistics",
        tags: ["Admin - Reviews"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/reviews/{reviewId}": {
      get: {
        summary: "Get Review Details (For Modal)",
        tags: ["Admin - Reviews"],
        security: bearerSecurity,
        parameters: [
          uuidParam("reviewId", "Review UUID"),
          {
            in: "query",
            name: "type",
            schema: { type: "string", enum: ["COURSE", "TEACHER"] },
            description: "Optional review type",
            example: "COURSE",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Review Permanently",
        tags: ["Admin - Reviews"],
        security: bearerSecurity,
        parameters: [
          uuidParam("reviewId", "Review UUID"),
          {
            in: "query",
            name: "type",
            schema: { type: "string", enum: ["COURSE", "TEACHER"] },
            description: "Optional review type",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/reviews/{reviewId}/status": {
      patch: {
        summary: "Toggle or Update Review Visibility (isHidden)",
        tags: ["Admin - Reviews"],
        security: bearerSecurity,
        parameters: [uuidParam("reviewId", "Review UUID")],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminReviewVisibilityDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/reviews/{reviewId}/visibility": {
      patch: {
        summary: "Toggle or Update Review Visibility Alias (isHidden)",
        tags: ["Admin - Reviews"],
        security: bearerSecurity,
        parameters: [uuidParam("reviewId", "Review UUID")],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminReviewVisibilityDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: [
                "all",
                "active",
                "expired",
                "scheduled",
                "exhausted",
                "deactivated",
              ],
              default: "all",
            },
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["SUCCESS", "FAILED"] },
          },
          {
            in: "query",
            name: "actorId",
            schema: { type: "string", format: "uuid" },
          },
          {
            in: "query",
            name: "startDate",
            schema: { type: "string", format: "date-time" },
          },
          {
            in: "query",
            name: "endDate",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  aboutUs: {
                    type: "string",
                    example: "Leading online e-learning academy.",
                  },
                  facebookUrl: {
                    type: "string",
                    format: "uri",
                    example: "https://facebook.com/learnx",
                  },
                  instaUrl: {
                    type: "string",
                    format: "uri",
                    example: "https://instagram.com/learnx",
                  },
                  websiteUrl: {
                    type: "string",
                    format: "uri",
                    example: "https://learnx.com",
                  },
                  copyright: {
                    type: "string",
                    example: "All rights reserved © 2026 LearnX",
                  },
                  logo_url: {
                    type: "string",
                    format: "binary",
                    description: "App logo file",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
        parameters: [
          stringPathParam(
            "slug",
            "Page slug (privacy-policy, terms-and-conditions)",
            "privacy-policy",
          ),
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", example: "Privacy Policy" },
                  content: {
                    type: "string",
                    example:
                      "<h1>Privacy Policy</h1><p>Content goes here...</p>",
                  },
                  locale: {
                    type: "string",
                    enum: ["ar", "en", "fr"],
                    default: "ar",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // ADMIN PLANS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/plans": {
      get: {
        summary: "Get All Session Plans (Paginated)",
        tags: ["Admin - Plans"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "teacherId",
            schema: { type: "string", format: "uuid" },
            description: "Filter plans by teacher UUID",
          },
          {
            in: "query",
            name: "sortOrder",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            description: "Sort order by creation date",
          },
          {
            in: "query",
            name: "lang",
            schema: { type: "string", enum: ["en", "ar", "fr"] },
            description: "Filter translation language",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SessionPlanListResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/plans/{planId}": {
      get: {
        summary: "Get Session Plan Details by ID",
        tags: ["Admin - Plans"],
        security: bearerSecurity,
        parameters: [
          uuidParam("planId", "Session Plan UUID"),
          {
            in: "query",
            name: "lang",
            schema: { type: "string", enum: ["en", "ar", "fr"] },
            description: "Filter translation language",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SessionPlanDetailResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // ADMIN REQUESTS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/requests/stats": {
      get: {
        summary: "Get Request Statistics",
        description:
          "Returns aggregated counts of system requests (total, pending, approved, rejected) optionally filtered by tab.",
        tags: ["Admin - Requests"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "tab",
            schema: {
              type: "string",
              enum: ["STUDENT", "TEACHER", "WITHDRAWAL"],
            },
            description:
              "Filter stats by request tab category (STUDENT, TEACHER, WITHDRAWAL). Omit to aggregate across all.",
            example: "TEACHER",
          },
        ],
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "SUCCESS" },
              data: {
                type: "object",
                properties: {
                  total: { type: "integer", example: 25 },
                  pending: { type: "integer", example: 8 },
                  approved: { type: "integer", example: 14 },
                  rejected: { type: "integer", example: 3 },
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
    "/api/v1/admin/requests": {
      get: {
        summary: "Get All System Requests",
        description:
          "Fetch paginated system requests with filtering by tab, type, priority, status, and keyword search.",
        tags: ["Admin - Requests"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "tab",
            schema: {
              type: "string",
              enum: ["STUDENT", "TEACHER", "WITHDRAWAL"],
              default: "STUDENT",
            },
            description:
              "Tab category (STUDENT, TEACHER, WITHDRAWAL). Defaults to STUDENT.",
            example: "TEACHER",
          },
          {
            in: "query",
            name: "type",
            schema: {
              type: "string",
              enum: [
                "BECOME_INSTRUCTOR",
                "COURSE_APPROVAL",
                "COURSE_UPDATE",
                "VERIFICATION",
                "PROFILE_UPDATE",
                "SUPPORT",
                "COURSE_ENROLLMENT",
                "REFUND_REQUEST",
                "CERTIFICATE_REQUEST",
                "SESSION_BOOKING",
                "WITHDRAWAL_PAYOUT",
              ],
            },
            description: "Filter by request type",
            example: "COURSE_APPROVAL",
          },
          {
            in: "query",
            name: "priority",
            schema: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
            description: "Filter by request priority level",
            example: "HIGH",
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
            description: "Filter by request status",
            example: "PENDING",
          },
        ],
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "SUCCESS" },
              data: {
                type: "object",
                properties: {
                  requests: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        code: { type: "string", example: "REQ-0001" },
                        tab: { type: "string", example: "TEACHER" },
                        type: { type: "string", example: "COURSE_APPROVAL" },
                        priority: { type: "string", example: "HIGH" },
                        status: { type: "string", example: "PENDING" },
                        requesterId: { type: "string", format: "uuid" },
                        requesterRole: { type: "string", example: "TEACHER" },
                        referenceId: {
                          type: "string",
                          format: "uuid",
                          nullable: true,
                        },
                        referenceModel: {
                          type: "string",
                          example: "TeacherCourse",
                          nullable: true,
                        },
                        details: { type: "object" },
                        rejectionReason: { type: "string", nullable: true },
                        actionTakenAt: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                        requester: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            fullName: {
                              type: "string",
                              example: "Ahmed Hassan",
                            },
                            email: {
                              type: "string",
                              example: "teacher@learnex.com",
                            },
                            profilePhoto: { type: "string", nullable: true },
                          },
                        },
                      },
                    },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      total: { type: "integer", example: 45 },
                      page: { type: "integer", example: 1 },
                      limit: { type: "integer", example: 10 },
                      totalPages: { type: "integer", example: 5 },
                    },
                  },
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
    "/api/v1/admin/requests/{requestId}": {
      get: {
        summary: "Get Request Details by ID",
        description:
          "Returns full details of a specific system request by its UUID.",
        tags: ["Admin - Requests"],
        security: bearerSecurity,
        parameters: [uuidParam("requestId", "System Request ID")],
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "SUCCESS" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  code: { type: "string", example: "REQ-0001" },
                  tab: { type: "string", example: "TEACHER" },
                  type: { type: "string", example: "COURSE_APPROVAL" },
                  priority: { type: "string", example: "HIGH" },
                  status: { type: "string", example: "PENDING" },
                  requesterId: { type: "string", format: "uuid" },
                  requesterRole: { type: "string", example: "TEACHER" },
                  referenceId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                  },
                  referenceModel: {
                    type: "string",
                    example: "TeacherCourse",
                    nullable: true,
                  },
                  details: { type: "object" },
                  rejectionReason: { type: "string", nullable: true },
                  actionTakenAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/requests/{requestId}/approve": {
      patch: {
        summary: "Approve System Request",
        description:
          "Approves a pending system request (e.g. course approval, become instructor, refund, etc.) and updates status to APPROVED.",
        tags: ["Admin - Requests"],
        security: bearerSecurity,
        parameters: [uuidParam("requestId", "System Request ID")],
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "REQUEST_APPROVED_SUCCESSFULLY",
              },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  code: { type: "string", example: "REQ-0001" },
                  tab: { type: "string", example: "STUDENT" },
                  type: { type: "string", example: "REFUND_REQUEST" },
                  status: { type: "string", example: "APPROVED" },
                  actionTakenAt: { type: "string", format: "date-time" },
                },
              },
            },
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/requests/{requestId}/reject": {
      patch: {
        summary: "Reject System Request",
        description:
          "Rejects a pending system request with a rejection reason.",
        tags: ["Admin - Requests"],
        security: bearerSecurity,
        parameters: [uuidParam("requestId", "System Request ID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rejectionReason"],
                properties: {
                  rejectionReason: {
                    type: "string",
                    example:
                      "Request does not meet the eligibility criteria or invalid documents.",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "REQUEST_REJECTED_SUCCESSFULLY",
              },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  code: { type: "string", example: "REQ-0001" },
                  tab: { type: "string", example: "STUDENT" },
                  type: { type: "string", example: "REFUND_REQUEST" },
                  status: { type: "string", example: "REJECTED" },
                  rejectionReason: {
                    type: "string",
                    example: "Request does not meet the eligibility criteria.",
                  },
                  actionTakenAt: { type: "string", format: "date-time" },
                },
              },
            },
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/calendar": {
      get: {
        summary: "Get Calendar Stats & Monthly Sessions",
        description:
          "Returns stats cards (total, scheduled, completed, cancelled) and all sessions of the requested month grouped by day (`YYYY-MM-DD`). Defaults to the current month when year/month are omitted.",
        tags: ["Admin - Calendar"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "year",
            schema: { type: "integer", example: 2026 },
            description: "Calendar year (defaults to current year)",
          },
          {
            in: "query",
            name: "month",
            schema: { type: "integer", minimum: 1, maximum: 12, example: 10 },
            description: "Month number 1-12 (defaults to current month)",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/CalendarResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/calendar/session/{id}": {
      get: {
        summary: "Get Calendar Session Details by ID",
        description:
          "Full details of one session: teacher, student, original request, and subscription with plan.",
        tags: ["Admin - Calendar"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Session UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/CalendarSessionDetailResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/sessions": {
      get: {
        summary: "Get Admin Sessions (Today / Upcoming / History)",
        description:
          "Retrieve a paginated list of sessions for the admin dashboard categorized by tab (today, upcoming, history) with teacher and student names.",
        tags: ["Admin - Sessions"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "tab",
            schema: {
              type: "string",
              enum: ["today", "upcoming", "history"],
              default: "today",
            },
            description: "Filter sessions by tab category",
            example: "today",
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description:
              "Search keyword for session title, teacher name, or student name",
            example: "Math",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
            example: 1,
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Number of records per page",
            example: 20,
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/AdminSessionsListResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/admin/sessions/{sessionId}": {
      get: {
        summary: "Get Admin Session Details by ID",
        description:
          "Get detailed information for a specific session including teacher and student contact details.",
        tags: ["Admin - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("sessionId", "Session UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/AdminSessionDetailResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // ADMIN TICKETS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/admin/tickets": {
      get: {
        summary: "Get All Support Tickets",
        description:
          "Retrieve paginated list of support tickets with status, priority, assigned staff filtering, and search across subject, ticketNumber, user name or email.",
        tags: ["Admin - Tickets"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: [
                "OPEN",
                "IN_PROGRESS",
                "WAITING_FOR_TEACHER",
                "RESOLVED",
                "CLOSED",
              ],
            },
            description: "Filter by ticket status",
          },
          {
            in: "query",
            name: "priority",
            schema: {
              type: "string",
              enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
            },
            description: "Filter by ticket priority",
          },
          {
            in: "query",
            name: "assignedStaffId",
            schema: { type: "string", format: "uuid" },
            description:
              "Filter by assigned staff UUID (pass null or omit for unassigned)",
          },
          {
            in: "query",
            name: "sort",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            description: "Sort order by creation date (asc or desc)",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/AdminTicketListResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/admin/tickets/{ticketId}": {
      get: {
        summary: "Get Support Ticket by ID",
        description:
          "Retrieve comprehensive details of a single support ticket including ticket creator (with role info), assigned staff, and all support messages with attachments.",
        tags: ["Admin - Tickets"],
        security: bearerSecurity,
        parameters: [uuidParam("ticketId", "Support Ticket UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/AdminTicketDetailResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/admin/tickets/{ticketId}/messages": {
      get: {
        summary: "Get Ticket Messages with Cursor Pagination",
        description:
          "Retrieve messages of a ticket sorted chronologically using cursor-based pagination (id and createdAt).",
        tags: ["Admin - Tickets"],
        security: bearerSecurity,
        parameters: [
          uuidParam("ticketId", "Support Ticket UUID"),
          {
            in: "query",
            name: "id",
            schema: { type: "string", format: "uuid" },
            description: "Cursor message UUID for pagination",
          },
          {
            in: "query",
            name: "createdAt",
            schema: { type: "string", format: "date-time" },
            description: "Cursor creation timestamp for pagination",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            description: "Number of messages per page",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/TicketMessagesCursorResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/admin/tickets/{ticketId}/send-message": {
      post: {
        summary: "Reply to Support Ticket",
        description:
          "Admin sends a message response to a ticket with an optional attachment (image/document up to 5MB). Changes ticket status to IN_PROGRESS and auto-assigns current staff if unassigned.",
        tags: ["Admin - Tickets"],
        security: bearerSecurity,
        parameters: [uuidParam("ticketId", "Support Ticket UUID")],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TicketSendMessageDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/admin/tickets/{ticketId}/close": {
      post: {
        summary: "Close Support Ticket",
        description:
          "Explicitly close a support ticket. Sets status to CLOSED, closedAt and resolvedAt timestamps.",
        tags: ["Admin - Tickets"],
        security: bearerSecurity,
        parameters: [uuidParam("ticketId", "Support Ticket UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/admin/tickets/{ticketId}/status": {
      patch: {
        summary: "Change Ticket Status",
        description:
          "Update the lifecycle status of a support ticket (OPEN, IN_PROGRESS, WAITING_FOR_TEACHER, RESOLVED, CLOSED).",
        tags: ["Admin - Tickets"],
        security: bearerSecurity,
        parameters: [uuidParam("ticketId", "Support Ticket UUID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AdminChangeTicketStatusDTO",
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/admin/tickets/{ticketId}/assign": {
      patch: {
        summary: "Assign Ticket to Staff Member",
        description:
          "Assign or reassign ticket to a staff member (or set staffId to null to unassign).",
        tags: ["Admin - Tickets"],
        security: bearerSecurity,
        parameters: [uuidParam("ticketId", "Support Ticket UUID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminAssignTicketDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
              message: {
                type: "string",
                example: "TEACHER_APPLICATION_SUBMITTED_SUCCESSFULLY",
              },
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
              example: {
                email: "ahmed.hassan@learnex.com",
                password: "Teacher@123456",
              },
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  sessionPrice50Min: {
                    type: "number",
                    minimum: 0,
                    example: 50.0,
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/me/workHours": {
      get: {
        summary: "Get Teacher Work Hours",
        tags: ["Teacher - Profile"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Teacher Work Hours",
        tags: ["Teacher - Profile"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TeacherWorkHoursUpdateDTO",
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
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
              schema: {
                $ref: "#/components/schemas/TeacherCertificateCreateDTO",
              },
            },
          },
        },
        responses: {
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          {
            in: "query",
            name: "type",
            schema: {
              type: "string",
              enum: ["ACADEMIC", "COURSE", "EXPERIENCE", "OTHER"],
            },
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "VERIFIED", "REJECTED"],
            },
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
        parameters: [
          uuidParam("courseId", "Course ID"),
          uuidParam("sectionId", "Section ID"),
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Section",
        tags: ["Teacher - Sections"],
        security: bearerSecurity,
        parameters: [
          uuidParam("courseId", "Course ID"),
          uuidParam("sectionId", "Section ID"),
        ],
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
        parameters: [
          uuidParam("courseId", "Course ID"),
          uuidParam("sectionId", "Section ID"),
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
        parameters: [
          uuidParam("sectionId", "Section ID"),
          uuidParam("itemId", "Item ID"),
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Item",
        tags: ["Teacher - Items"],
        security: bearerSecurity,
        parameters: [
          uuidParam("sectionId", "Section ID"),
          uuidParam("itemId", "Item ID"),
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TeacherItemCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
        parameters: [
          uuidParam("sectionId", "Section ID"),
          uuidParam("itemId", "Item ID"),
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
        parameters: [
          uuidParam("sectionId", "Section ID"),
          uuidParam("questionId", "Question ID"),
        ],
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
        parameters: [
          uuidParam("quizId", "Quiz ID"),
          uuidParam("submissionId", "Submission ID"),
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
        parameters: [
          uuidParam("quizId", "Quiz ID"),
          uuidParam("submissionId", "Submission ID"),
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TeacherGradeSubmissionDTO",
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // TEACHER PLANS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/plans/me": {
      get: {
        summary: "Get My Session Plans",
        tags: ["Teacher - Plans"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "sortOrder",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            description: "Sort order by creation date",
          },
          {
            in: "query",
            name: "lang",
            schema: { type: "string", enum: ["en", "ar", "fr"] },
            description: "Filter translation language",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SessionPlanListResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/plans": {
      post: {
        summary: "Create Session Plan with Translations",
        tags: ["Teacher - Plans"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateSessionPlanDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({
            $ref: "#/components/schemas/SessionPlanDetailResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/plans/{planId}": {
      get: {
        summary: "Get Session Plan Details",
        tags: ["Teacher - Plans"],
        security: bearerSecurity,
        parameters: [
          uuidParam("planId", "Session Plan UUID"),
          {
            in: "query",
            name: "lang",
            schema: { type: "string", enum: ["en", "ar", "fr"] },
            description: "Filter translation language",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SessionPlanDetailResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Session Plan",
        tags: ["Teacher - Plans"],
        security: bearerSecurity,
        parameters: [uuidParam("planId", "Session Plan UUID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateSessionPlanDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SessionPlanDetailResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Session Plan",
        tags: ["Teacher - Plans"],
        security: bearerSecurity,
        parameters: [uuidParam("planId", "Session Plan UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // TEACHER REVIEWS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/reviews": {
      get: {
        summary: "Get Authenticated Teacher Reviews (Courses & Sessions)",
        description:
          "Returns reviews left by students for the authenticated teacher, split into: `sessions` (1-on-1 mentoring sessions reviews including student profile and bookingId) and `courses` (course reviews including student profile and course title).",
        tags: ["Teacher - Reviews"],
        security: bearerSecurity,
        parameters: [...paginationQueryParams],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // TEACHER OFFERS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/offers": {
      post: {
        summary: "Create Offer on Teacher Course",
        tags: ["Teacher - Offers"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeacherOfferCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get All Teacher Offers",
        tags: ["Teacher - Offers"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          {
            in: "query",
            name: "courseId",
            schema: { type: "string", format: "uuid" },
            description: "Filter offers by specific Teacher Course ID",
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"],
            },
            description: "Filter offers by status",
          },
          localeQueryParam,
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/offers/{offerId}": {
      get: {
        summary: "Get Teacher Offer Details by ID",
        tags: ["Teacher - Offers"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer UUID"), localeQueryParam],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      patch: {
        summary: "Update Teacher Offer",
        tags: ["Teacher - Offers"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer UUID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeacherOfferCreateDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
      delete: {
        summary: "Delete Teacher Offer",
        tags: ["Teacher - Offers"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/teacher/offers/{offerId}/status": {
      patch: {
        summary: "Change Teacher Offer Status",
        tags: ["Teacher - Offers"],
        security: bearerSecurity,
        parameters: [uuidParam("offerId", "Offer UUID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"],
                    example: "ACTIVE",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // TEACHER TICKETS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/tickets": {
      get: {
        summary: "Get Teacher Support Tickets",
        description:
          "Retrieve paginated list of support tickets submitted by the authenticated teacher, filterable by status and priority.",
        tags: ["Teacher - Tickets"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams.slice(0, 2),
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: [
                "OPEN",
                "IN_PROGRESS",
                "WAITING_FOR_TEACHER",
                "RESOLVED",
                "CLOSED",
              ],
            },
            description: "Filter by ticket status",
          },
          {
            in: "query",
            name: "priority",
            schema: {
              type: "string",
              enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
            },
            description: "Filter by ticket priority",
          },
          {
            in: "query",
            name: "sort",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            description: "Sort order by creation date (asc or desc)",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/TeacherTicketListResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/tickets/create": {
      post: {
        summary: "Create Support Ticket",
        description:
          "Teacher creates a new support ticket. Note: A maximum of 2 OPEN tickets are allowed simultaneously per teacher. Returns message TICKET_CREATED on success.",
        tags: ["Teacher - Tickets"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TeacherCreateTicketDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            type: "object",
            properties: {
              message: { type: "string", example: "TICKET_CREATED" },
            },
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/tickets/{ticketId}": {
      get: {
        summary: "Get Teacher Ticket Details",
        description:
          "Retrieve support ticket details by ID for the authenticated teacher, including assigned staff and message thread.",
        tags: ["Teacher - Tickets"],
        security: bearerSecurity,
        parameters: [uuidParam("ticketId", "Support Ticket UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/TeacherTicketDetailResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/tickets/{ticketId}/send-message": {
      post: {
        summary: "Send Message in Support Ticket",
        description:
          "Teacher adds a message reply with an optional file attachment (image/document up to 5MB) to an open support ticket.",
        tags: ["Teacher - Tickets"],
        security: bearerSecurity,
        parameters: [uuidParam("ticketId", "Support Ticket UUID")],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TicketSendMessageDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/tickets/{ticketId}/reopen": {
      post: {
        summary: "Reopen Closed Support Ticket",
        description:
          "Reopen a previously CLOSED or RESOLVED ticket with a message and an optional file attachment (image/document up to 5MB).",
        tags: ["Teacher - Tickets"],
        security: bearerSecurity,
        parameters: [uuidParam("ticketId", "Support Ticket UUID")],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/TeacherReopenTicketDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/tickets/{ticketId}/messages": {
      get: {
        summary: "Get Teacher Ticket Messages with Cursor Pagination",
        description:
          "Retrieve messages of a ticket sorted chronologically using cursor pagination (requires id and createdAt). Ticket must not be CLOSED or RESOLVED.",
        tags: ["Teacher - Tickets"],
        security: bearerSecurity,
        parameters: [
          uuidParam("ticketId", "Support Ticket UUID"),
          {
            in: "query",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Cursor message UUID for pagination",
          },
          {
            in: "query",
            name: "createdAt",
            required: true,
            schema: { type: "string", format: "date-time" },
            description: "Cursor creation timestamp for pagination",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            description: "Number of messages per page",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/TicketMessagesCursorResponseDTO",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
              example: {
                email: "youssef.mahmoud@learnex.com",
                password: "Student@123456",
              },
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
              example: {
                oldPassword: "Student@123456",
                password: "NewStudentPass@123!",
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  itemType: {
                    type: "string",
                    enum: ["COURSE", "TEACHER_COURSE"],
                    default: "COURSE",
                    example: "COURSE",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
            },
            description: "Enrollment status filter",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
            },
            description: "Enrollment status filter",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/courses/{courseId}/enroll": {
      post: {
        summary: "Enroll directly in a free course",
        description:
          "Enrolls the authenticated student in a free published course without going through the cart.",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [uuidParam("courseId", "Course ID")],
        responses: {
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          409: standardResponses[409],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/courses/filters": {
      get: {
        summary: "Get Faceted Search & Filter Options (Udemy-style)",
        description:
          "Returns counts and available metadata for filters: providers, categories, difficulty levels, languages, rating brackets, video durations, and price types.",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [localeQueryParam],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/courses": {
      get: {
        summary: "Browse Course Catalog with Advanced Udemy-Style Filters",
        description:
          "Comprehensive course catalog supporting search across title, description, instructor, and tags. Supports multi-faceted filters: provider (ALL, PLATFORM, TEACHER), categoryId, level, language, minRating, durationRange, enrollmentType, minPrice, maxPrice, hasCertificate, and sorting.",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [
          ...paginationQueryParams,
          localeQueryParam,
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description:
              "Search keyword matching title, description, instructor, or tags",
          },
          {
            in: "query",
            name: "provider",
            schema: {
              type: "string",
              enum: ["ALL", "PLATFORM", "TEACHER"],
              default: "ALL",
            },
            description: "Filter courses by provider source",
          },
          {
            in: "query",
            name: "categoryId",
            schema: { type: "string", format: "uuid" },
            description: "Filter by category ID",
          },
          {
            in: "query",
            name: "level",
            schema: {
              type: "string",
              enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"],
            },
            description: "Difficulty level",
          },
          {
            in: "query",
            name: "language",
            schema: { type: "string" },
            description: "Language of instruction (e.g. arabic, english)",
          },
          {
            in: "query",
            name: "minRating",
            schema: { type: "number", minimum: 0, maximum: 5 },
            description: "Minimum rating bracket (e.g. 4.5, 4.0, 3.5, 3.0)",
          },
          {
            in: "query",
            name: "durationRange",
            schema: { type: "string", enum: ["0-1", "1-3", "3-6", "6+"] },
            description: "Video duration range bracket in hours",
          },
          {
            in: "query",
            name: "enrollmentType",
            schema: { type: "string", enum: ["FREE", "PAID"] },
            description: "Price filter: FREE or PAID",
          },
          {
            in: "query",
            name: "minPrice",
            schema: { type: "number", minimum: 0 },
            description: "Minimum price",
          },
          {
            in: "query",
            name: "maxPrice",
            schema: { type: "number", minimum: 0 },
            description: "Maximum price",
          },
          {
            in: "query",
            name: "hasCertificate",
            schema: { type: "boolean" },
            description: "Filter for courses with completion certificate",
          },
          {
            in: "query",
            name: "sortBy",
            schema: {
              type: "string",
              enum: ["newest", "rating", "popular", "price_asc", "price_desc"],
              default: "newest",
            },
            description: "Sorting criteria",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/courses/{courseId}": {
      get: {
        summary: "Get unified course details (Platform or Teacher course)",
        description:
          "Returns complete course details, instructor profile, sections, locked/unlocked lesson items, section quizzes, review stats, and enrollment status.",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [
          uuidParam("courseId", "Course ID"),
          localeQueryParam,
          {
            in: "query",
            name: "itemType",
            schema: { type: "string", enum: ["COURSE", "TEACHER_COURSE"] },
            description: "Optional course type discriminator",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/courses/{courseId}/lessons/{lessonId}/complete": {
      post: {
        summary: "Mark a lesson as completed & update progress",
        description:
          "Marks a lesson item as completed for both platform and teacher courses, calculates overall course progress percent in Redis and DB, and sets status to COMPLETED once 100% reached.",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [
          uuidParam("courseId", "Course ID"),
          uuidParam("lessonId", "Lesson or Item ID"),
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/courses/{courseId}/reviews": {
      get: {
        summary: "Get course reviews with rating distribution",
        description:
          "Returns paginated reviews, 5-star distribution percentages, and average rating for platform or teacher courses.",
        tags: ["Student - Courses"],
        security: bearerSecurity,
        parameters: [
          uuidParam("courseId", "Course ID"),
          ...paginationQueryParams,
          {
            in: "query",
            name: "itemType",
            schema: { type: "string", enum: ["COURSE", "TEACHER_COURSE"] },
            description: "Optional type discriminator",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/teachers/{id}": {
      get: {
        summary: "Get Teacher Details",
        tags: ["Student - Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Teacher ID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },
    "/api/v1/student/teachers/book-plan/{id}": {
      post: {
        summary: "Initiate Booking / Subscription for Teacher Session Plan",
        description:
          "Creates a pending transaction and pending subscription for the student to pay through a payment gateway. Does not credit the system wallet or increase session counters until payment is confirmed.",
        tags: ["Student - Teachers"],
        security: bearerSecurity,
        parameters: [uuidParam("id", "Session Plan ID")],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  paymentMethod: {
                    type: "string",
                    enum: ["CARD"],
                    default: "CARD",
                    description:
                      "Payment method used for the gateway transaction",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[201]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
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
                  language: {
                    type: "string",
                    enum: ["ar", "en", "es", "fr", "de", "it"],
                    example: "ar",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/SuccessMessageResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/saved": {
      get: {
        summary: "Get student saved items",
        description:
          "Returns the authenticated student's saved items with enriched details (course title, instructor, etc.). Locale is controlled via `locale` query param or `Accept-Language` header.",
        tags: ["Student - Saved"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "locale",
            schema: { type: "string", enum: ["ar", "en"], default: "ar" },
            description: "Translation locale",
          },
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
                              itemType: {
                                type: "string",
                                enum: ["COURSE", "TEACHER_COURSE"],
                              },
                              type: {
                                type: "string",
                                enum: ["COURSE", "TEACHER_COURSE"],
                              },
                              itemId: { type: "string", format: "uuid" },
                              createdAt: {
                                type: "string",
                                format: "date-time",
                              },
                              course: {
                                type: "object",
                                description: "Enriched course details",
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
          },
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/saved/add": {
      post: {
        summary: "Add item to saved",
        description:
          "Adds a COURSE or TEACHER_COURSE to the student's saved items. Validates that the course is published/approved.",
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
                  type: {
                    type: "string",
                    enum: ["COURSE", "TEACHER_COURSE"],
                    example: "COURSE",
                    description: "Type of item",
                  },
                  itemType: {
                    type: "string",
                    enum: ["COURSE", "TEACHER_COURSE"],
                    example: "COURSE",
                    description: "Alternative name for type",
                  },
                  itemId: {
                    type: "string",
                    format: "uuid",
                    example: "550e8400-e29b-41d4-a716-446655440000",
                    description: "Course or TeacherCourse ID",
                  },
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
                    data: {
                      type: "object",
                      description: "Updated saved items object",
                    },
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
        description:
          "Removes an item from saved by Saved ID or itemId (course ID).",
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
                    message: {
                      type: "string",
                      example: "ITEM_REMOVED_FROM_SAVED",
                    },
                    data: {
                      type: "object",
                      description: "Updated saved items object",
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

    "/api/v1/student/cart/checkout": {
      post: {
        summary: "Checkout student cart",
        description:
          "Enrolls student in all course items in their cart and clears the cart.",
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
        description:
          "Returns the quiz questions and options WITHOUT revealing isCorrect.",
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
        description:
          "Submits answers for automatic grading (MCQ/TRUE_FALSE) or pending teacher review (WRITTEN).",
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
                        selectedOptionId: {
                          type: "string",
                          format: "uuid",
                          nullable: true,
                        },
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
                    message: {
                      type: "string",
                      example: "QUIZ_SUBMITTED_SUCCESSFULLY",
                    },
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
        description:
          "Returns the submission status, scores, pass/fail result, and graded answers.",
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

    // ═══════════════════════════════════════════════════════════
    // STUDENT - SESSIONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/sessions/my-sessions": {
      get: {
        summary: "Get student sessions",
        description:
          "Returns a paginated list of sessions for the authenticated student. Optionally filter by status (SCHEDULED, LIVE, COMPLETED, CANCELLED). Defaults to active sessions (SCHEDULED, LIVE) occurring today or in the future when no status filter is provided.",
        tags: ["Student - Sessions"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"],
            },
            description: "Filter by session status",
            example: "SCHEDULED",
          },
          ...paginationQueryParams.slice(0, 2),
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/StudentSessionsListResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/sessions/requests": {
      get: {
        summary: "Get student session requests",
        description:
          "Returns a paginated list of 1-on-1 session requests created by the authenticated student. Optionally filter by status (PENDING, ACCEPTED, REJECTED, CANCELLED).",
        tags: ["Student - Sessions"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"],
            },
            description: "Filter by request status",
            example: "PENDING",
          },
          ...paginationQueryParams.slice(0, 2),
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/StudentSessionRequestsListResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/sessions/{teacherId}/availability": {
      get: {
        summary: "Get teacher available slots",
        description:
          "Returns a list of available time slots for the specified teacher within the given date range. Slots respect the teacher's work hours, timezone, and existing bookings.",
        tags: ["Student - Sessions"],
        security: bearerSecurity,
        parameters: [
          uuidParam("teacherId", "Teacher UUID"),
          {
            in: "query",
            name: "from",
            required: true,
            schema: { type: "string", format: "date-time" },
            description: "Range start (ISO 8601). Must be in the future.",
            example: "2026-10-15T00:00:00.000Z",
          },
          {
            in: "query",
            name: "to",
            required: true,
            schema: { type: "string", format: "date-time" },
            description:
              "Range end (ISO 8601). Must be after `from` and within 31 days.",
            example: "2026-10-22T23:59:59.000Z",
          },
        ],
        responses: {
          200: {
            description: "Available slots fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "AVAILABLE_SLOTS_FETCHED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        timezone: { type: "string", example: "Africa/Cairo" },
                        slots: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              startAt: {
                                type: "string",
                                format: "date-time",
                                example: "2026-10-15T08:00:00.000Z",
                              },
                              endAt: {
                                type: "string",
                                format: "date-time",
                                example: "2026-10-15T08:50:00.000Z",
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
          },
          400: standardResponses[400],
          401: standardResponses[401],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/sessions/{teacherId}/create-request": {
      post: {
        summary: "Create a session request",
        description:
          "Student sends a booking request for a 1-on-1 session with a teacher. The chosen `startAt` must match an available slot returned by the availability endpoint. The session duration is fixed at 50 minutes.",
        tags: ["Student - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher UUID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateSessionRequestDTO" },
            },
          },
        },
        responses: {
          201: {
            description: "Session request created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "SESSION_REQUEST_CREATED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        studentId: { type: "string", format: "uuid" },
                        teacherId: { type: "string", format: "uuid" },
                        title: {
                          type: "string",
                          nullable: true,
                          example: "React hooks and state management deep dive",
                        },
                        startAt: { type: "string", format: "date-time" },
                        endAt: { type: "string", format: "date-time" },
                        note: { type: "string", nullable: true },
                        status: { type: "string", example: "PENDING" },
                        createdAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          404: {
            description: "Teacher or student not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NotFoundErrorResponse" },
              },
            },
          },
          409: {
            description:
              "Slot not available, student has a time conflict, or a pending request already exists for this slot",
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

    "/api/v1/student/sessions/{requestId}/cancel-request": {
      patch: {
        summary: "Cancel a session request",
        description:
          "Allows the student who created the request to cancel it, provided it is still in `PENDING` status. A race-condition guard prevents cancellation if the teacher accepted or rejected it at the same moment.",
        tags: ["Student - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("requestId", "Session Request UUID")],
        responses: {
          200: {
            description: "Session request cancelled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "SESSION_REQUEST_CANCELLED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        status: { type: "string", example: "CANCELLED" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Request is not in PENDING status",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          401: standardResponses[401],
          403: {
            description: "Student does not own this request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ForbiddenErrorResponse",
                },
              },
            },
          },
          404: standardResponses[404],
          409: {
            description:
              "Request was already accepted/rejected by the teacher (race condition)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConflictErrorResponse",
                },
              },
            },
          },
          500: standardResponses[500],
        },
      },
    },

    // ─── Cycle 2: Student Custom Session Requests ────────────
    "/api/v1/student/sessions/custom-requests": {
      get: {
        summary: "Get student's custom session requests",
        description:
          "Returns paginated list of custom bundle requests created by the authenticated student.",
        tags: ["Student - Sessions"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"],
            },
            description: "Filter by status",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              default: 20,
            },
          },
        ],
        responses: {
          200: {
            description: "Custom session requests fetched",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "CUSTOM_SESSION_REQUESTS_FETCHED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/CustomSessionRequestItemDTO",
                          },
                        },
                        meta: {
                          $ref: "#/components/schemas/PaginationMeta",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/sessions/{teacherId}/custom-request": {
      post: {
        summary: "Create a custom session bundle request (Cycle 2)",
        description:
          "Student requests custom number of sessions from teacher based on teacher's sessionPrice50Min. Total price is calculated automatically.",
        tags: ["Student - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("teacherId", "Teacher UUID")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateCustomSessionRequestDTO",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Custom session request created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "CUSTOM_SESSION_REQUEST_CREATED_SUCCESSFULLY",
                    },
                    data: {
                      $ref: "#/components/schemas/CustomSessionRequestItemDTO",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Teacher has no hourly price or invalid count",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/sessions/custom-requests/{requestId}/cancel": {
      patch: {
        summary: "Cancel a pending custom session request",
        description:
          "Student cancels their own PENDING custom session bundle request.",
        tags: ["Student - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("requestId", "Custom Request UUID")],
        responses: {
          200: {
            description: "Custom request cancelled",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "CUSTOM_SESSION_REQUEST_CANCELLED_SUCCESSFULLY",
                    },
                    data: {
                      $ref: "#/components/schemas/CustomSessionRequestItemDTO",
                    },
                  },
                },
              },
            },
          },
          400: { description: "Request not PENDING" },
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/student/sessions/{sessionId}/join": {
      post: {
        summary: "Join Live Session (Student)",
        description:
          "Join an ongoing LIVE session and obtain a signed Jitsi Meet JWT token. Updates studentJoinedAt timestamp upon joining. Session must currently have status LIVE.",
        tags: ["Student - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("sessionId", "Session UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/JoinSessionResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          409: {
            description: "Session is not LIVE or join window expired",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConflictErrorResponse",
                },
              },
            },
          },
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // TEACHER - SESSIONS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/teacher/sessions/requests": {
      get: {
        summary: "Get incoming session requests",
        description:
          "Returns a paginated list of session requests sent to the authenticated teacher. Defaults to PENDING when no status filter is provided.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"],
            },
            description: "Filter by request status (default: PENDING)",
            example: "PENDING",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
            example: 1,
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              default: 20,
            },
            description: "Records per page (max 50)",
            example: 20,
          },
        ],
        responses: {
          200: {
            description: "Session requests fetched",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "SESSION_REQUESTS_FETCHED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/SessionRequestItemDTO",
                          },
                        },
                        meta: {
                          $ref: "#/components/schemas/PaginationMeta",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/sessions/requests/{requestId}/accept": {
      patch: {
        summary: "Accept a session request",
        description:
          "Accepts a PENDING session request and creates a SCHEDULED session. Checks for teacher and student time conflicts.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("requestId", "Session Request UUID")],
        responses: {
          200: {
            description: "Request accepted and session created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "SESSION_REQUEST_ACCEPTED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        requestId: { type: "string", format: "uuid" },
                        session: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            title: {
                              type: "string",
                              example: "Private Session",
                            },
                            startAt: {
                              type: "string",
                              format: "date-time",
                            },
                            endAt: { type: "string", format: "date-time" },
                            status: {
                              type: "string",
                              example: "SCHEDULED",
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
          403: standardResponses[403],
          404: {
            description: "Request not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/NotFoundErrorResponse",
                },
              },
            },
          },
          409: {
            description: "Not pending / slot unavailable / time conflict",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConflictErrorResponse",
                },
              },
            },
          },
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/sessions/requests/{requestId}/reject": {
      patch: {
        summary: "Reject a session request",
        description: "Rejects a PENDING request with an optional reason.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("requestId", "Session Request UUID")],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rejectedReason: {
                    type: "string",
                    maxLength: 500,
                    nullable: true,
                    example: "I am unavailable at that time.",
                    description: "Optional rejection reason (max 500 chars).",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Request rejected",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "SESSION_REQUEST_REJECTED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        status: { type: "string", example: "REJECTED" },
                        rejectedReason: { type: "string", nullable: true },
                        respondedAt: {
                          type: "string",
                          format: "date-time",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          409: {
            description: "Request is no longer PENDING",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConflictErrorResponse",
                },
              },
            },
          },
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/sessions/my-sessions": {
      get: {
        summary: "Get teacher's own sessions",
        description:
          "Returns a paginated list of the teacher's sessions. Without a status filter, returns upcoming SCHEDULED and LIVE sessions ordered soonest first.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"],
            },
            description:
              "Filter by session status. Omit for all upcoming active sessions.",
            example: "SCHEDULED",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
            example: 1,
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              default: 20,
            },
            description: "Records per page (max 50)",
            example: 20,
          },
        ],
        responses: {
          200: {
            description: "Sessions fetched",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "TEACHER_SESSIONS_FETCHED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/TeacherSessionItemDTO",
                          },
                        },
                        meta: {
                          $ref: "#/components/schemas/PaginationMeta",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/sessions/{sessionId}/start": {
      patch: {
        summary: "Start a session",
        description:
          "Marks a SCHEDULED session as LIVE. Can be started up to 10 min early and no later than 15 min after the scheduled time.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("sessionId", "Session UUID")],
        responses: {
          200: {
            description: "Session started",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "SESSION_STARTED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        status: { type: "string", example: "LIVE" },
                        startAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Too early to start (>10 min before scheduled time)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          409: {
            description:
              "Session not SCHEDULED or start window expired (>15 min late)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConflictErrorResponse",
                },
              },
            },
          },
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/sessions/{sessionId}/end": {
      patch: {
        summary: "End a live session",
        description:
          "Marks a LIVE session as COMPLETED and records the actual end time. Only the owning teacher can end their session.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("sessionId", "Session UUID")],
        responses: {
          200: {
            description: "Session ended",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "SESSION_ENDED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        status: { type: "string", example: "COMPLETED" },
                        actualEndAt: {
                          type: "string",
                          format: "date-time",
                          example: "2026-10-15T09:52:00.000Z",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          409: {
            description: "Session is not currently LIVE",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConflictErrorResponse",
                },
              },
            },
          },
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/sessions/{sessionId}/join": {
      post: {
        summary: "Join Live Session (Teacher / Host)",
        description:
          "Join an ongoing LIVE session as moderator and obtain a signed Jitsi Meet JWT token with moderator privileges. Session must currently have status LIVE.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("sessionId", "Session UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/JoinSessionResponseDTO",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          409: {
            description: "Session is not LIVE or join window expired",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConflictErrorResponse",
                },
              },
            },
          },
          500: standardResponses[500],
        },
      },
    },

    // ─── Cycle 2: Teacher Custom Session Requests ────────────
    "/api/v1/teacher/sessions/custom-requests": {
      get: {
        summary: "Get incoming custom session requests (Cycle 2)",
        description:
          "Returns paginated list of custom bundle requests sent to the authenticated teacher. Defaults to PENDING.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "REJECTED"],
            },
            default: "PENDING",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              default: 20,
            },
          },
        ],
        responses: {
          200: {
            description: "Custom requests fetched",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "CUSTOM_SESSION_REQUESTS_FETCHED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/CustomSessionRequestItemDTO",
                          },
                        },
                        meta: {
                          $ref: "#/components/schemas/PaginationMeta",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/sessions/custom-requests/{requestId}/accept": {
      patch: {
        summary: "Accept custom session request (Cycle 2)",
        description:
          "Teacher accepts student's custom session bundle request. Activates teacherSubscription for the student with sessionsCount, sessionLeft, and validity period.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("requestId", "Custom Request UUID")],
        responses: {
          200: {
            description: "Custom request accepted and subscription activated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "CUSTOM_SESSION_REQUEST_ACCEPTED_SUCCESSFULLY",
                    },
                    data: {
                      type: "object",
                      properties: {
                        request: {
                          $ref: "#/components/schemas/CustomSessionRequestItemDTO",
                        },
                        subscription: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            sessionsCount: { type: "integer", example: 5 },
                            sessionLeft: { type: "integer", example: 5 },
                            status: { type: "string", example: "ACTIVE" },
                            expiresAt: {
                              type: "string",
                              format: "date-time",
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
          403: standardResponses[403],
          404: standardResponses[404],
          409: { description: "Request is not PENDING" },
          500: standardResponses[500],
        },
      },
    },

    "/api/v1/teacher/sessions/custom-requests/{requestId}/reject": {
      patch: {
        summary: "Reject custom session request (Cycle 2)",
        description:
          "Teacher rejects student's custom session request with optional reason.",
        tags: ["Teacher - Sessions"],
        security: bearerSecurity,
        parameters: [uuidParam("requestId", "Custom Request UUID")],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rejectedReason: {
                    type: "string",
                    maxLength: 500,
                    example: "Schedule fully booked",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Custom request rejected",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "CUSTOM_SESSION_REQUEST_REJECTED_SUCCESSFULLY",
                    },
                    data: {
                      $ref: "#/components/schemas/CustomSessionRequestItemDTO",
                    },
                  },
                },
              },
            },
          },
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          409: { description: "Request is not PENDING" },
          500: standardResponses[500],
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    // STUDENT - REVIEWS
    // ═══════════════════════════════════════════════════════════
    "/api/v1/student/reviews": {
      post: {
        summary: "Create Course or Teacher Review",
        description:
          "Submit a rating and comment review for an enrolled course or a completed teacher session.",
        tags: ["Student - Reviews"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["type", "rating"],
                properties: {
                  type: {
                    type: "string",
                    enum: ["COURSE", "TEACHER"],
                    description:
                      "Target type: COURSE (for course review) or TEACHER (for teacher / session review)",
                    example: "COURSE",
                  },
                  courseId: {
                    type: "string",
                    format: "uuid",
                    description: "Course UUID (Required if type is COURSE)",
                  },
                  teacherId: {
                    type: "string",
                    format: "uuid",
                    description: "Teacher UUID (Required if type is TEACHER)",
                  },
                  bookingId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    description:
                      "Optional session booking UUID (Only when type is TEACHER)",
                  },
                  rating: {
                    type: "integer",
                    minimum: 1,
                    maximum: 5,
                    description: "Rating score between 1 and 5",
                    example: 5,
                  },
                  comment: {
                    type: "string",
                    description: "Review feedback comment",
                    example: "محتوى علمي متميز وتطبيق عملي رائع",
                  },
                },
              },
              examples: {
                courseReview: {
                  summary: "Course Review (تقييم كورس)",
                  description:
                    "Use this body when reviewing an enrolled course",
                  value: {
                    type: "COURSE",
                    courseId: "14447de1-9d4e-4958-93c8-59dca27e3570",
                    rating: 5,
                    comment: "محتوى علمي متميز وشرح رائع ومفيد جداً",
                  },
                },
                teacherReview: {
                  summary: "Teacher / Session Review (تقييم معلم / سيشن)",
                  description:
                    "Use this body when reviewing a teacher after a session",
                  value: {
                    type: "TEACHER",
                    teacherId: "60ed8640-96c5-47bf-88df-7365ff6821b0",
                    bookingId: "b001a111-7777-4444-9999-000000000001",
                    rating: 5,
                    comment: "أستاذ محترف ومتعاون جداً في الجلسة الاستشارية",
                  },
                },
              },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: {
            description:
              "Forbidden (Enrollment required to review course, or self-review forbidden)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ForbiddenErrorResponse" },
              },
            },
          },
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
      get: {
        summary: "Get student submitted reviews",
        description:
          "Returns all course reviews and teacher/session reviews submitted by the authenticated student.",
        tags: ["Student - Reviews"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          401: standardResponses[401],
          500: standardResponses[500],
        },
      },
    },

    // ───────────────────────────────────────────────────────────
    //  Chat Management Endpoints
    // ───────────────────────────────────────────────────────────
    "/chat/unread-count": {
      get: {
        summary: "Get total unread messages count",
        description:
          "Returns the sum of all unread messages for the authenticated student or teacher across all conversations.",
        tags: ["Chat"],
        security: bearerSecurity,
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/ChatUnreadCountResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/chat/conversations": {
      get: {
        summary: "Get all conversations",
        description:
          "Returns paginated list of conversations for the authenticated student or teacher with participant details, last message, and unread counts.",
        tags: ["Chat"],
        security: bearerSecurity,
        parameters: [...paginationQueryParams],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/ChatConversationsListResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
      post: {
        summary: "Start or get existing conversation",
        description:
          "Starts a new conversation between student and teacher (requires an active teacher subscription if new) or returns the existing conversation.",
        tags: ["Chat"],
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChatStartConversationDTO" },
            },
          },
        },
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/ChatConversationDetailResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
          500: standardResponses[500],
        },
      },
    },

    "/chat/conversations/{conversationId}/messages": {
      get: {
        summary: "Get message history for a conversation",
        description:
          "Returns paginated messages in reverse chronological order using cursor-based pagination for smooth scrolling.",
        tags: ["Chat"],
        security: bearerSecurity,
        parameters: [
          uuidParam("conversationId", "Conversation UUID"),
          {
            in: "query",
            name: "cursor",
            schema: { type: "string", format: "uuid" },
            description:
              "Message ID cursor for pagination (nextCursor from previous response)",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 30, minimum: 1, maximum: 100 },
            description: "Number of messages to fetch per page",
          },
        ],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/ChatMessageHistoryResponse",
          }),
          401: standardResponses[401],
          403: standardResponses[403],
          404: standardResponses[404],
          500: standardResponses[500],
        },
      },
    },

    "/chat/conversations/{conversationId}/read": {
      patch: {
        summary: "Mark conversation as read",
        description:
          "Updates read timestamp and resets unread count for the authenticated user in this conversation.",
        tags: ["Chat"],
        security: bearerSecurity,
        parameters: [uuidParam("conversationId", "Conversation UUID")],
        responses: {
          ...standardResponses[200]({
            $ref: "#/components/schemas/GenericSuccessDataResponse",
          }),
          400: standardResponses[400],
          401: standardResponses[401],
          403: standardResponses[403],
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
