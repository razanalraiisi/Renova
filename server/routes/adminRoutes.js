import express from "express";
import {
  getPendingCollectors,
  approveCollector,
  rejectCollector
} from "../controllers/authController.js";

const router = express.Router();

router.get("/pendingCollectors", getPendingCollectors);
router.put("/approveCollector/:id", approveCollector);
router.delete("/rejectCollector/:id", rejectCollector);

export default router;
