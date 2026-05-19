import express from "express";
import {
  getReportInsights,
  createReport,
  getAllCollectors,
  getAllUsers,
  getAllReports,
  ignoreReport,
  deactivateReportedUser
} from "../controllers/reportsController.js";

const router = express.Router();

// CREATE REPORT
router.post("/create", createReport);

// GET ALL COLLECTORS
router.get("/collectors", getAllCollectors);

// GET ALL USERS
router.get("/users", getAllUsers);

// INSIGHTS
router.get("/insights", getReportInsights);
// GET ALL REPORTS (ADMIN)
router.get("/all", getAllReports);

// IGNORE REPORT
router.post("/:id/ignore", ignoreReport);

// DEACTIVATE REPORTED USER/COLLECTOR
router.post("/:id/deactivate", deactivateReportedUser);
export default router;