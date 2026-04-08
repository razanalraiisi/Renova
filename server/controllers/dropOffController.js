
import DropOffRequest from "../models/DropOffRequestModel.js";
import User from "../models/UserModel.js";

export const createDropOffRequest = async (req, res) => {
  try {
    const {
      name,
      phone,
      deviceCategory,
      device,
      condition,
      dateTime,
      address,
      category
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const userId = req.user?._id; 

    const request = new DropOffRequest({
      name,
      phone,
      deviceCategory,
      device,
      condition,
      dateTime,
      address,
      category,
      userId,
    });

    await request.save();

    res.status(201).json({
      message: "Drop-off request created",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Accept a drop-off request
 */
export const acceptDropOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const collectorId = req.user?._id;

    const request = await DropOffRequest.findByIdAndUpdate(
      id,
      { 
        status: "Accepted", 
        collectorId, 
        acceptedAt: new Date()
      },
      { new: true }
    );

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const rejectDropOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const collectorId = req.user?._id;

    const request = await DropOffRequest.findByIdAndUpdate(
      id,
      { status: "Rejected", rejectReason: reason, collectorId },
      { new: true }
    );

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllDropOffRequests = async (req, res) => {
  try {
    const { collectorId } = req.params;

    const collector = await User.findById(collectorId);
    if (!collector) {
      return res.status(404).json({ message: "Collector not found" });
    }

    const requests = await DropOffRequest.find({
      deviceCategory: { $in: collector.acceptedCategories },
      status: "Pending"
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const completeDropOffRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DropOffRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "Accepted") {
      return res.status(400).json({ message: "Only accepted requests can be marked as completed." });
    }

    request.status = "Completed";
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};