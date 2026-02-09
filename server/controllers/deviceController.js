import Device from "../models/Device.js";

export const getDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch {
    res.status(500).json({ message: "Failed to fetch devices" });
  }
};

export const createDevice = async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();
    res.status(201).json(device);
  } catch {
    res.status(400).json({ message: "Failed to create device" });
  }
};

export const updateDevice = async (req, res) => {
  try {
    await Device.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: "Failed to update device" });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    await Device.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: "Failed to delete device" });
  }
};
