import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    requestId: String,
    collectorName: String,
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;