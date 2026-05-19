
import DropOffRequest from "../models/DropOffRequestModel.js";
import User from "../models/UserModel.js";
//import { rateDropoff } from "../controllers/deviceController.js";
export const createDropOffRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      deviceCategory,
      device,
      condition,
      dateTime,
      address,
      category,
      customCategory,
      isBroadcastToAllCollectors
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const userId = req.user?._id;
    
    // Use email from logged-in user or from form submission
    const userEmail = req.user?.email || email;

    const request = new DropOffRequest({
      name,
      email: userEmail,
      phone,
      deviceCategory,
      device,
      condition,
      dateTime,
      address,
      category,
      image,
      userId,
      customCategory: customCategory || null,
      isBroadcastToAllCollectors: isBroadcastToAllCollectors === 'true' || isBroadcastToAllCollectors === true,
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
 * Get all drop-off requests for the logged-in user
 */
export const getUserDropOffRequests = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requests = await DropOffRequest.find({ userId })
      .sort({ createdAt: -1 });

    // manually fetch collector names
    const formattedRequests = await Promise.all(
      requests.map(async (req) => {

        let collectorName = null;

        if (req.collectorId) {
          const collector = await User.findById(req.collectorId);

          collectorName = collector?.uname || null;
        }

        return {
          ...req._doc,
          collectorName
        };
      })
    );

    res.json(formattedRequests);

  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
};
export const acceptDropOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const collectorId = req.user?._id;

    console.log("Collector ID:", collectorId);
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

    // Build query: get broadcast requests OR matching category requests
    const requests = await DropOffRequest.find({
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

/**
 * Cancel a drop-off request
 */
export const cancelDropOffRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DropOffRequest.findByIdAndUpdate(
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
 * Get history of drop-off requests for a collector
 */
export const getCollectorDropOffHistory = async (req, res) => {
  try {
    const { collectorId } = req.params;

    const collector = await User.findById(collectorId);
    if (!collector) {
      return res.status(404).json({ message: "Collector not found" });
    }

    // Get requests processed by this collector
    const requests = await DropOffRequest.find({
      collectorId: collectorId,
      status: { $in: ["Accepted", "Rejected", "Completed"] }
    }).sort({ createdAt: -1 });

    res.json(Array.isArray(requests) ? requests : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reschedule a drop-off request
 */
export const rescheduleDropOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    if (!newDate) {
      return res.status(400).json({ message: "New date is required" });
    }

    const request = await DropOffRequest.findByIdAndUpdate(
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
/*export const rateDropoff = async (req, res) => {
  try {
    const { rating, collectorId } = req.body;

    const dropoff = await DropOff.findById(req.params.id);

    if (!dropoff) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    dropoff.rating = rating;

    await dropoff.save();

    res.status(200).json({
      message: "Rating submitted successfully",
      dropoff
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
export {
  rateDropoff
};*/