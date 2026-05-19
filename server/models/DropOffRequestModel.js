import mongoose from "mongoose";

const dropOffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  deviceCategory: String,
  customCategory: {
    type: String,
    default: null
  },
  isBroadcastToAllCollectors: {
    type: Boolean,
    default: false
  },
  device: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  dateTime: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  rejectReason: String,
  requestType: {
    type: String,
    default: "DropOff"
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
  /*rating: {
  type: Number,
  min: 1,
  max: 5,
  default: null
},*/
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DropOffRequest = mongoose.model("DropOffRequest", dropOffSchema);

export default DropOffRequest;