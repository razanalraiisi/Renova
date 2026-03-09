import express from "express";
import {
  getPendingCollectors,
  approveCollector,
  rejectCollector,
  getUsers,
  getCollectors,
  deactivateCollector,
  getDashboardStats,
  getAdminProfile,
  updateAdminProfile,
  getCollectorRequestsHistory,
} from "../controllers/authController.js";
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
} from "../controllers/deviceController.js";
import { getChartData } from "../controllers/dashboardController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/chart-data", getChartData);
router.get("/pendingCollectors", getPendingCollectors);
router.get("/users", getUsers);
router.get("/collectors", getCollectors);
router.put("/collectors/:id/deactivate", deactivateCollector);
router.put("/approveCollector/:id", approveCollector);
router.post("/rejectCollector/:id", rejectCollector);

// Admin profile (protected)
router.get("/profile", verifyAdmin, getAdminProfile);
router.put("/profile", verifyAdmin, updateAdminProfile);

// Collector registration requests history (all: pending + approved)
router.get("/collector-requests-history", getCollectorRequestsHistory);

router.get("/devices", getDevices);
router.post("/devices", createDevice);
router.put("/devices/:id", updateDevice);
router.delete("/devices/:id", deleteDevice);


export default router;
