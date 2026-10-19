import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import { getEnv } from "./config/env.js";
import { errorHandler } from "./http/middleware/errorHandler.js";
import authRoutes from "./http/routes/auth.routes.js";
import jobsRoutes from "./http/routes/jobs.routes.js";
import kitsRoutes from "./http/routes/kits.routes.js";
import practiceRoutes from "./http/routes/practice.routes.js";

export function createApp(): Express {
  const app = express();
  const env = getEnv();

  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/kits", kitsRoutes);
  app.use("/api/jobs", jobsRoutes);
  app.use("/api/practice", practiceRoutes);

  app.use(errorHandler);

  return app;
}
