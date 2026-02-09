import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  name: String,
  category: String, 
  risk: String,
  image: String,
  steps: [String],
});

export default mongoose.model("Device", DeviceSchema);
