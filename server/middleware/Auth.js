import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "everwear_secret_key";

/* ═══════════════════════════════════════
   isAuthenticated — token verify karo
═══════════════════════════════════════ */
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = await UserModel.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

/* ═══════════════════════════════════════
   isAdmin — admin role check karo
═══════════════════════════════════════ */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Admin access only" });
};
