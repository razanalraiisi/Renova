// routes/pickupRoutes.js
import express from "express";
import multer from "multer";
import { 
  createPickupRequest, 
  getUserPickupRequests, 
  getAllPickupRequests, 
  acceptPickupRequest, 
  rejectPickupRequest,
  cancelPickupRequest,
  getCollectorHistory
} from "../controllers/pickupController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* STORAGE FOR IMAGES */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* USER ROUTES */
router.post("/create", protect, upload.single("image"), createPickupRequest);
router.get("/user/requests", protect, getUserPickupRequests);
router.put("/cancel/:id", protect, cancelPickupRequest);

/* COLLECTOR / ADMIN ROUTES */
router.get("/all/:collectorId", getAllPickupRequests);
router.get("/history/:collectorId", getCollectorHistory);
router.put("/accept/:id", protect, acceptPickupRequest);
router.put("/reject/:id", protect, rejectPickupRequest);

export default router;