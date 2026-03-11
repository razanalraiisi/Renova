import express from "express";
import { createPickupRequest, getAllPickupRequests } from "../controllers/pickupController.js";
import multer from "multer";

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

router.post("/create", upload.single("image"), createPickupRequest);
router.get("/all", getAllPickupRequests);

export default router;