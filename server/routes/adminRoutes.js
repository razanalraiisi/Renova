import express from "express";
import {
  getPendingCollectors,
  approveCollector,
  rejectCollector
} from "../controllers/authController.js";
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
} from "../controllers/deviceController.js";


const router = express.Router();

router.get("/pendingCollectors", getPendingCollectors);
router.put("/approveCollector/:id", approveCollector);
router.post("/rejectCollector/:id", rejectCollector);

router.get("/devices", getDevices);
router.post("/devices", createDevice);
router.put("/devices/:id", updateDevice);
router.delete("/devices/:id", deleteDevice);


export default router;
