import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import { handleDemo } from "./routes/demo";
import { register, login, logout, me } from "./routes/auth";
import { auth, requireRole } from "./middleware/auth";
import {
  createSubmissionMultipart,
  listAll,
  listMine,
  getById,
  saveAnnotation,
  generateReport,
} from "./routes/submissions";

const MONGO_URI = process.env.MONGODB_URI || "";

export function createServer() {
  const app = express();

  // DB connect (lazy, don't crash if missing)
  if (MONGO_URI) {
    mongoose
      .connect(MONGO_URI)
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.warn("MongoDB connection failed:", err.message));
  } else {
    console.warn("MONGODB_URI not set. API will fail for DB operations.");
  }

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static serving for local storage
  const uploadsDir = path.join(process.cwd(), "uploads");
  const reportsDir = path.join(process.cwd(), "reports");
  app.use("/uploads", express.static(uploadsDir));
  app.use("/reports", express.static(reportsDir));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/auth/register", register);
  app.post("/auth/login", login);
  app.post("/auth/logout", logout);
  app.get("/api/me", auth, me);

  // Patient submissions
  app.post("/api/submissions", auth, requireRole("patient"), ...createSubmissionMultipart);
  app.get("/api/submissions/mine", auth, requireRole("patient"), listMine);

  // Admin endpoints
  app.get("/api/submissions", auth, requireRole("admin"), listAll);
  app.get("/api/submissions/:id", auth, getById);
  app.post("/api/submissions/:id/annotate", auth, requireRole("admin"), ...saveAnnotation);
  app.post("/api/submissions/:id/report", auth, requireRole("admin"), generateReport);

  return app;
}
