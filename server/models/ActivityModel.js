import mongoose from "mongoose";

/**
 * One row per logged activity (dispose / recycle / upcycle flow).
 * userId references Users (regular users or collectors); $lookup resolves display name.
 */
const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

activitySchema.index({ userId: 1 });
activitySchema.index({ category: 1 });
activitySchema.index({ createdAt: 1 });

export default mongoose.model("Activity", activitySchema);
