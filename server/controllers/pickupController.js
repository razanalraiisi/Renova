import PickupRequest from "../models/PickupRequestModel.js";

// CREATE REQUEST
export const createPickupRequest = async (req, res) => {
  try {

    const request = new PickupRequest(req.body);

    await request.save();

    res.status(201).json({
      message: "Pickup request created",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET ALL REQUESTS (for collector history)
export const getAllPickupRequests = async (req, res) => {
  try {

    const requests = await PickupRequest.find().sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};