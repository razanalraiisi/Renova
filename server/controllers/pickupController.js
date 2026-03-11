import PickupRequest from "../models/PickupRequestModel.js";

// CREATE REQUEST
export const createPickupRequest = async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      address,
      device,
      condition,
      requestType,
      category
    } = req.body;

    // get uploaded image if exists
    const image = req.file ? req.file.filename : null;

    const request = new PickupRequest({
      name,
      email,
      phone,
      address,
      device,
      condition,
      requestType,
      category,
      image
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


// GET ALL REQUESTS (for collector history)
export const getAllPickupRequests = async (req, res) => {
  try {

    const requests = await PickupRequest.find().sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};