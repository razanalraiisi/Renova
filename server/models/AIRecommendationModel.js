import mongoose from "mongoose";

const aiRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    itemName: { type: String, default: "" },
    itemCategory: { type: String, default: "" },
    condition: { type: String, default: "" },
    aiRecommendation: {
      type: String,
      enum: ["Dispose", "Recycle", "Upcycle"],
      required: true,
    },
    confidenceScore: { type: Number, default: null },
    userFinalChoice: {
      type: String,
      enum: ["Dispose", "Recycle", "Upcycle", null],
      default: null,
    },
    requestMethod: {
      type: String,
      enum: ["pickup", "dropoff", null],
      default: null,
    },
    wasRecommendationFollowed: { type: Boolean, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

aiRecommendationSchema.index({ createdAt: -1 });
aiRecommendationSchema.index({ userId: 1, createdAt: -1 });
aiRecommendationSchema.index({ aiRecommendation: 1 });

const AIRecommendation = mongoose.model("AIRecommendation", aiRecommendationSchema);

export default AIRecommendation;
