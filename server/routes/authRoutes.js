import express from "express";
import {
  registerUser,
  registerCollector,
  registerAdmin,
  login,
  sendPasswordOtp,
  verifyPasswordOtp,
  resetPassword,
  updateUserProfile,
  getApprovedCollectors,
} from "../controllers/authController.js";
import { geocodeAddress } from "../controllers/geocodeController.js";
 
const router = express.Router();
 
router.get("/test", (req, res) => {
  res.send("AUTH ROUTES WORKING");
});
 
router.get("/api/geocode", geocodeAddress);

router.post("/registerUser", registerUser);
router.post("/registerCollector", registerCollector);
router.post("/registerAdmin", registerAdmin);
router.post("/login", login);
router.put("/updateUser/:id", updateUserProfile);
router.get("/admin/getApprovedCollectors", getApprovedCollectors);
 
// OTP / Forgot Password Routes
router.post("/forgot-password", sendPasswordOtp);
router.post("/verify-otp", verifyPasswordOtp);
router.post("/reset-password", resetPassword);
 
export default router;