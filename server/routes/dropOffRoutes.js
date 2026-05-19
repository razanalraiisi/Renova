// routes/dropOffRoutes.js
import express from "express";
import multer from "multer";
import { 
  createDropOffRequest, 
  getUserDropOffRequests,
  acceptDropOffRequest, 
  rejectDropOffRequest, 
  completeDropOffRequest,
  cancelDropOffRequest,
  getAllDropOffRequests,
  getCollectorDropOffHistory,
  rateDropoff
} from "../controllers/dropOffController.js";
import { protect } from "../middleware/authMiddleware.js";
import { rescheduleDropOffRequest } from "../controllers/dropOffController.js";
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
router.post("/create", protect, upload.single("image"), createDropOffRequest);
router.get("/user/requests", protect, getUserDropOffRequests);
router.put("/cancel/:id", protect, cancelDropOffRequest);
//router.put("/reschedule/:id", protect, (req, res) => res.status(200).json({ message: "Reschedule logic needed in controller" }));
/* COLLECTOR ROUTES */
router.get("/all/:collectorId", protect, getAllDropOffRequests);
router.get("/history/:collectorId", protect, getCollectorDropOffHistory);
router.put("/accept/:id", protect, acceptDropOffRequest);
router.put("/reject/:id", protect, rejectDropOffRequest);
router.put("/complete/:id", protect, completeDropOffRequest);
router.put("/reschedule/:id", protect, rescheduleDropOffRequest);
router.put("/rate/:id", protect, rateDropoff);
export default router;