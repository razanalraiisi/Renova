import express from "express";
import { createPickupRequest, getAllPickupRequests } from "../controllers/pickupController.js";

const router = express.Router();

router.post("/create", createPickupRequest);
router.get("/all", getAllPickupRequests);

export default router;