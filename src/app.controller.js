import "dotenv/config";
import express from "express";


import { setupSwagger } from "./config/swagger.js";
import router from "./routers/index.routes.js";
import { globalErrorHandling } from "./utils/response.js";
import path from "node:path";
import { i18nMiddleware } from "./i18n/middleware.js";

const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT || 3000;



  app.use(express.json());
  app.use("/uploads", express.static(path.resolve("./uploads")));
  app.use(i18nMiddleware);
  // Setup Swagger UI Documentation
  setupSwagger(app);

  app.get("/", (req, res) => {
    res.json({
      message: "API_RUNNING_SUCCESSFULLY",
      documentation: "/api-docs",
    });
  });

  app.use("/api/v1", router);
  app.all("{/*dummy}", (req, res) => {
    return res.status(404).json({ message: "INVALID_ROUTING" });
  });

  // Global error handling middleware
  app.use(globalErrorHandling);

  return app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
  });
};

export default bootstrap;
