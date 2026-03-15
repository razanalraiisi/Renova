import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  deviceCategory: String,
  device: String,
  condition: String,
  rejectReason: String,
  requestType: {
    type: String,
    default: "Pickup"
  },
  category: {
    type: String
  },
  image: {
    type: String
  },
  status: {
    type: String,
    default: "Pending"
  },
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  userId: {            
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PickupRequest = mongoose.model("PickupRequest", pickupSchema);

export default PickupRequest;