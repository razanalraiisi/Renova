import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

/**
 * Verify JWT and ensure user is admin. Sets req.user to the admin document.
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found." });
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin only." });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
