// routes/dropOffRoutes.js
import express from "express";
import { 
  createDropOffRequest, 
  acceptDropOffRequest, 
  rejectDropOffRequest, 
  completeDropOffRequest,
  getAllDropOffRequests
} from "../controllers/dropOffController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* USER ROUTES */
router.post("/create", protect, createDropOffRequest);

/* COLLECTOR ROUTES */
router.get("/all/:collectorId", protect, getAllDropOffRequests);
router.put("/accept/:id", protect, acceptDropOffRequest);
router.put("/reject/:id", protect, rejectDropOffRequest);
router.put("/complete/:id", protect, completeDropOffRequest);

export default router;