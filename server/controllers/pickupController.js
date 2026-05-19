// controllers/pickupController.js
import PickupRequest from "../models/PickupRequestModel.js";
import User from "../models/UserModel.js";
//import { ratePickup } from "../controllers/pickupController.js";
/**
 * Create a new pickup request
 */
export const createPickupRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      deviceCategory,
      device,
      condition,
      dateTime,
      requestType,
      category,
      customCategory,
      isBroadcastToAllCollectors
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const userId = req.user?._id; // Use logged-in user

    const request = new PickupRequest({
      name,
      email,
      phone,
      address,
      deviceCategory,
      device,
      condition,
      dateTime,
      requestType,
      category,
      image,
      userId,
      customCategory: customCategory || null,
      isBroadcastToAllCollectors: isBroadcastToAllCollectors === 'true' || isBroadcastToAllCollectors === true,
    });

    await request.save();

    res.status(201).json({
      message: "Pickup request created",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all pickup requests for the logged-in user
 */
export const getUserPickupRequests = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requests = await PickupRequest.find({ userId }).sort({ createdAt: -1 });

    res.json(Array.isArray(requests) ? requests : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all pickup requests for a collector
 */
export const getAllPickupRequests = async (req, res) => {
  try {
    const { collectorId } = req.params;

    const collector = await User.findById(collectorId);
    if (!collector) {
      return res.status(404).json({ message: "Collector not found" });
    }

    // Build query: get broadcast requests OR matching category requests
    const requests = await PickupRequest.find({
      status: "Pending",
      $or: [
        // Broadcast requests visible to all collectors
        { isBroadcastToAllCollectors: true },
        // Category-matched requests (only if not broadcast)
        {
          isBroadcastToAllCollectors: { $ne: true },
          deviceCategory: { $in: collector.acceptedCategories }
        }
      ]
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// controllers/pickupController.js
export const acceptPickupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const collectorId = req.user?._id;

    const request = await PickupRequest.findByIdAndUpdate(
      id,
      { 
        status: "Accepted", 
        collectorId, 
        acceptedAt: new Date() // <-- ADD THIS LINE
      },
      { new: true }
    );

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reject a pickup request
 */
export const rejectPickupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const collectorId = req.user?._id;

    const request = await PickupRequest.findByIdAndUpdate(
      id,
      { status: "Rejected", rejectReason: reason, collectorId },
      { new: true }
    );

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get history of pickup requests for a collector
 */
export const getCollectorHistory = async (req, res) => {
  try {
    const { collectorId } = req.params;

    const collector = await User.findById(collectorId);
    if (!collector) {
      return res.status(404).json({ message: "Collector not found" });
    }

    // ✅ ONLY show requests processed by this collector
    const requests = await PickupRequest.find({
      collectorId: collectorId,
      status: { $in: ["Accepted", "Rejected", "Completed"] }
    }).sort({ createdAt: -1 });

    res.json(Array.isArray(requests) ? requests : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cancel a pickup request
 */
export const cancelPickupRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await PickupRequest.findByIdAndUpdate(
      id,
      { status: "Canceled" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Complete a pickup request
 */
export const completePickupRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await PickupRequest.findById(id);
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

/**
 * Reschedule a request by updating its date
 */
export const reschedulePickupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    if (!newDate) {
      return res.status(400).json({ message: "New date is required" });
    }

    const request = await PickupRequest.findByIdAndUpdate(
      id,
      { scheduledDate: new Date(newDate) },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Rescheduled successfully", request });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/*export const ratePickup = async (req, res) => {
  try {
    const { rating, collectorId } = req.body;

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    // Save rating to request
    pickup.rating = rating;

    await pickup.save();

    res.status(200).json({
      message: "Rating submitted successfully",
      pickup
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
export {
  ratePickup
};*/