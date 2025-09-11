import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const auth: RequestHandler = (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : undefined);
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "Server misconfigured" });
    const payload = jwt.verify(token, secret) as { id: string; role: "patient" | "admin" };
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireRole = (role: "patient" | "admin"): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
};
