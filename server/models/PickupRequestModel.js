import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  deviceCategory: String,
  customCategory: {
    type: String,
    default: null
  },
  isBroadcastToAllCollectors: {
    type: Boolean,
    default: false
  },
  device: String,
  condition: String,
  dateTime: {
    type: String
  },
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
  scheduledDate: {
  type: Date,
  default: null
},
  rating: {
  type: Number,
  default: null
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PickupRequest = mongoose.model("PickupRequest", pickupSchema);

export default PickupRequest;