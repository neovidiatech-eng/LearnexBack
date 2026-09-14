import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LearnX LMS API Documentation 🚀",
      version: "1.0.0",
      description:
        "Interactive API documentation for LearnX Learning Management System (LMS)",
      contact: {
        name: "LearnX Team",
      },
    },
    servers: [
      {
        url: "https://learnx.agro-plus.net",
        description: "Production Server",
      },
      {
        url: "http://localhost:3015",
        description: "Docker Local Server",
      },
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your Bearer token in the format: Bearer <token>",
        },
      },
    },
  },
  apis: [
    "./src/modules/**/*.routes.js",
    "./src/modules/**/*.controller.js",
    "./src/app.controller.js",
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

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
