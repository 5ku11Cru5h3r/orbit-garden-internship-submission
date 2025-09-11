import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Utility: create JWT
const createToken = (payload: object) => jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const register: RequestHandler = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role ?? "patient",
    });

    const token = createToken({ id: user.id, role: user.role });
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createToken({ id: user.id, role: user.role });
    res.cookie("token", token, cookieOptions);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
};

export const me: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json(req.user);
  } catch (err) {
    console.error("Me Endpoint Error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const logout: RequestHandler = async (_req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ error: "Failed to logout" });
  }
};
