import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// --------------------
// Auto-ID Generators
// --------------------
async function generateUserId() {
  const lastUser = await User.findOne({ role: "user" }).sort({ userIdNumber: -1 });
  const nextNumber = lastUser ? lastUser.userIdNumber + 1 : 100;
  return { userId: `U${nextNumber}`, userIdNumber: nextNumber };
}

async function generateCollectorId() {
  const lastCollector = await User.findOne({ role: "collector" }).sort({ collectorIdNumber: -1 });
  const nextNumber = lastCollector ? lastCollector.collectorIdNumber + 1 : 100;
  return { collectorId: `C${nextNumber}`, collectorIdNumber: nextNumber };
}

// --------------------
// User Registration
// --------------------
export const registerUser = async (req, res) => {
  try {
    const { uname, email, password, phone, pic } = req.body;

    if (!uname || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const ids = await generateUserId();

    const newUser = new User({
      uname,
      email,
      password: hashed,
      phone,
      pic,
      role: "user",
      userId: ids.userId,
      userIdNumber: ids.userIdNumber
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Collector Registration
// --------------------
export const registerCollector = async (req, res) => {
  try {
    const {
      companyName,
      email,
      password,
      phone,
      pic,
      collectorType,
      acceptedCategories = [],
      address,
      openHr
    } = req.body;

    if (!companyName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const ids = await generateCollectorId();

    const newCollector = new User({
      companyName,
      email,
      password: hashed,
      phone,
      pic,
      collectorType,
      acceptedCategories,
      address,
      openHr,
      role: "collector",
      collectorId: ids.collectorId,
      collectorIdNumber: ids.collectorIdNumber
    });

    await newCollector.save();
    res.status(201).json({ message: "Collector registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Admin Registration
// --------------------
export const registerAdmin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;
    if (secretKey !== process.env.ADMIN_SECRET) return res.status(403).json({ message: "Unauthorized." });

    if (!email || !password) return res.status(400).json({ message: "All fields required." });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new User({ email, password: hashed, role: "admin" });
    await admin.save();
    res.status(201).json({ message: "Admin created." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Login
// --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password." });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
