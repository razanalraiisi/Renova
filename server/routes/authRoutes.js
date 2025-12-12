import express from "express";
import {
  registerUser,
  registerCollector,
  registerAdmin,
  login,
  sendPasswordOtp,
  verifyPasswordOtp,
  resetPassword
} from "../controllers/authController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("AUTH ROUTES WORKING ✅");
});

router.post("/registerUser", registerUser);
router.post("/registerCollector", registerCollector);
router.post("/registerAdmin", registerAdmin);
router.post("/login", login);

// ✅ OTP / Forgot Password Routes
router.post("/forgot-password", sendPasswordOtp);
router.post("/verify-otp", verifyPasswordOtp);
router.post("/reset-password", resetPassword);

export default router;
