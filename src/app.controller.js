import "dotenv/config";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import path from "node:path";
import cors from "cors";

import { setupSwagger } from "./config/swagger.js";
import redis from "./config/redis.config.js";
import router from "./routers/index.routes.js";
import { globalErrorHandling } from "./utils/response.js";
import { i18nMiddleware } from "./i18n/middleware.js";
import { getAdmin } from "./utils/firebase/index.js";

const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT || 3000;

  app.set("trust proxy", true);

  // Security HTTP headers
  app.use(helmet());

  //CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ?process.env.CORS_ORIGINS
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean)
    : [];


  app.use(cors({
    origin:(origin,callback)=>{
      if(!origin){
        return callback(null,true)
      }
      const normalizedOrigin = origin.replace(/\/+$/,'')
      if(allowedOrigins.includes(normalizedOrigin)){
        return callback(null,true)
      }
      return callback(null, false);
    },
    credentials:true,
    optionsSuccessStatus:200
  }))

  //
  getAdmin()

  // HTTP request logger middleware
  app.use(morgan("dev"));

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
    console.log(`Server is running on port ${port} `);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
  });
};

export default bootstrap;
