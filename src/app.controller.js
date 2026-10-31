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
import { createServer } from "node:http";
import { initializeSocket } from "./utils/socket/chat.socket.js";
import { validateEnv } from "./config/env.validation.js";
import { requestIdMiddleware } from "./middleware/requestId.middleware.js";


const bootstrap = async () => {
  validateEnv();
  const app = express();
  const httpServer = createServer(app);
  const port = process.env.PORT || 3000;

  app.set("trust proxy", true);
  app.use(requestIdMiddleware);

  // Security HTTP headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  //CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ?process.env.CORS_ORIGINS
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean)
    : [];

    initializeSocket(httpServer,allowedOrigins)
  


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
  app.use("/uploads", (req, res) => {
    return res.status(404).json({ message: "FILE_NOT_FOUND" });
  });
  app.use(i18nMiddleware);
  

  // Setup Swagger UI Documentation
  setupSwagger(app);

  app.get("/health", async (req, res) => {
    let dbStatus = "CONNECTED";
    try {
      const db = (await import("./db/db.service.js")).default;
      await db.count({ model: "user" });
    } catch (_) {
      dbStatus = "DISCONNECTED";
    }

    const isHealthy = dbStatus === "CONNECTED";
    return res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "UP" : "DOWN",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      requestId: req.id || null,
      uptime: Math.floor(process.uptime()),
    });
  });

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

  return httpServer.listen(port, () => {
    console.log(`Server is running on port ${port} `);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
  });
};

export default bootstrap;
