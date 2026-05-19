import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  reporterName: { type: String },
  reporterRole: { type: String },

  reportedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  reportedName: { type: String },
  reportedRole: { type: String },

  requestId: { type: String },
  requestStatus: { type: String },

  type: { type: String }, // 'user' | 'collector'
  reason: { type: String },
  notes: { type: String },

  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  collectorName: { type: String },

  status: { type: String, default: 'open' }, // open | actioned | ignored
  actionTaken: { type: String },
  actionReason: { type: String },
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;
