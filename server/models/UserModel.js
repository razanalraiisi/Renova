import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // --------------------------
  // USER FIELDS
  // --------------------------
  uname: { type: String },
  phone: { type: String },
  pic: { type: String },

  // USER AUTO-ID
  userId: { type: String },
  userIdNumber: { type: Number },

  // --------------------------
  // COLLECTOR FIELDS
  // --------------------------
  companyName: { type: String },
  collectorType: { type: String },
  openHr: { type: String },
  acceptedCategories: { type: [String], default: [] },
  address: { type: String },

  // COLLECTOR AUTO-ID
  collectorId: { type: String },
  collectorIdNumber: { type: Number },

  // --------------------------
  // SHARED FIELDS
  // --------------------------
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["user", "collector", "admin"], 
    required: true 
  },

  // --------------------------
  // APPROVAL STATUS (NEW)
  // --------------------------
  isApproved: { 
    type: Boolean,
    default: function () {
      return this.role !== "collector"; // users/admins = true, collectors = false
    }
  }
}, { timestamps: true });  // ⭐ adds createdAt + updatedAt automatically

const User = mongoose.model("Users", userSchema);
export default User;
