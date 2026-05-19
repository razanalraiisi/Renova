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
  adminVerifyCurrentPasswordAndSendOtp,
  adminVerifyChangePasswordOtp,
  adminCompletePasswordChange,
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
import {
  createAIRecommendation,
  finalizeAIRecommendation,
  getAIRecommendations,
  getAIRecommendationSummary,
} from "../controllers/aiRecommendationController.js";
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
router.get("/ai-recommendations/summary", getAIRecommendationSummary);
router.get("/ai-recommendations", getAIRecommendations);
router.post("/ai-recommendations", createAIRecommendation);
router.patch("/ai-recommendations/:id/finalize", finalizeAIRecommendation);
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
router.post("/profile/change-password/verify-current", verifyAdmin, adminVerifyCurrentPasswordAndSendOtp);
router.post("/profile/change-password/verify-otp", verifyAdmin, adminVerifyChangePasswordOtp);
router.post("/profile/change-password/complete", verifyAdmin, adminCompletePasswordChange);

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
