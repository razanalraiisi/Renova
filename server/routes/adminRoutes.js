import express from "express";
import {
  getPendingCollectors,
  approveCollector,
  rejectCollector,
  getUsers,
  getCollectors,
  deactivateCollector,
  reactivateCollector,
  getDashboardStats,
  getAdminProfile,
  updateAdminProfile,
  getCollectorRequestsHistory,
  getAdminNotifications,
} from "../controllers/authController.js";
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
} from "../controllers/deviceController.js";
import {
  getChartData,
  getAdminRequestsByCategory,
  getAdminAllRequests,
  getCollectorAcceptRejectChart,
} from "../controllers/dashboardController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from "../controllers/faqController.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/chart-data", getChartData);
router.get("/chart-collector-accept-reject", getCollectorAcceptRejectChart);
router.get("/report-requests", getAdminRequestsByCategory);
router.get("/report-requests-all", getAdminAllRequests);
router.get("/pendingCollectors", getPendingCollectors);
router.get("/notifications", getAdminNotifications);
router.get("/users", getUsers);
router.get("/collectors", getCollectors);
router.put("/collectors/:id/deactivate", deactivateCollector);
router.put("/collectors/:id/reactivate", reactivateCollector);
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
// FAQ ROUTES
router.get("/faqs", getFAQs);
router.post("/faqs", createFAQ);
router.put("/faqs/:id", updateFAQ);
router.delete("/faqs/:id", deleteFAQ);

export default router;
