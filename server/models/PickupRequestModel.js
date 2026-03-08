import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  device: String,
  condition: String,
  status: {
    type: String,
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PickupRequest = mongoose.model("PickupRequest", pickupSchema);

export default PickupRequest;