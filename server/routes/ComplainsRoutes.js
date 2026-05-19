import express from "express";
import { createComplaint, getAllComplaints } from "../controllers/complainsController.js";

const router = express.Router();

router.post("/", createComplaint);
router.get("/all", getAllComplaints);

export default router;