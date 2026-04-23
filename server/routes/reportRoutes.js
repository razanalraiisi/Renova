import express from "express";
import { getReportInsights } from "../controllers/reportsController.js";

const router = express.Router();

router.get("/insights", getReportInsights);

export default router;
