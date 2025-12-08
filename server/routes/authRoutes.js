import express from "express";
import {
  registerUser,
  registerCollector,
  registerAdmin,
  login
} from "../controllers/authController.js";

const router = express.Router();

// User registration
router.post("/registerUser", registerUser);

// Collector registration
router.post("/registerCollector", registerCollector);

// Admin creation (protected)
router.post("/registerAdmin", registerAdmin);

// Login
router.post("/login", login);

export default router;
