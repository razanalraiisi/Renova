import express from "express";
import {
  getReportInsights,
  createReport
} from "../controllers/reportsController.js";

const router = express.Router();

// CREATE REPORT
router.post("/create", createReport);

// INSIGHTS
router.get("/insights", getReportInsights);

export default router;