import User from "../models/UserModel.js";
import PickupRequest from "../models/PickupRequestModel.js";
import DropOffRequest from "../models/DropOffRequestModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";

const appLoginUrl = () =>
  `${(process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "")}/login`;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findUserByEmail(email) {
  const e = (email || "").trim();
  if (!e) return null;
  return User.findOne({ email: new RegExp(`^${escapeRegex(e)}$`, "i") });
}

async function countRequestsByCategory(category) {
  const rx = new RegExp(`^${escapeRegex(String(category))}$`, "i");
  const [pickups, dropoffs] = await Promise.all([
    PickupRequest.countDocuments({ category: rx }),
    DropOffRequest.countDocuments({ category: rx }),
  ]);
  return pickups + dropoffs;
}

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
 
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: "Email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const ids = await generateUserId();
 
    const newUser = new User({
      uname,
      email: email.trim().toLowerCase(),
      password: hashed,
      phone,
      pic,
      role: "user",
      userId: ids.userId,
      userIdNumber: ids.userIdNumber,
      isApproved: true  // users are always approved
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
      location,
      locationConsent,
      openHr
    } = req.body;
 
    if (!companyName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
 
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: "Email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const ids = await generateCollectorId();
 
    const newCollector = new User({
      companyName,
      email: email.trim().toLowerCase(),
      password: hashed,
      phone,
      pic,
      collectorType,
      acceptedCategories,
      address,
      openHr,
      location,
      locationConsent,
      role: "collector",
      collectorId: ids.collectorId,
      collectorIdNumber: ids.collectorIdNumber,
      isApproved: false  
    });
 
    await newCollector.save();
    res.status(201).json({ message: "Collector registration submitted for approval." });
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
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: "Email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new User({
      email: email.trim().toLowerCase(),
      password: hashed,
      role: "admin",
      isApproved: true,
    });
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
 
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "User not found." });
 
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password." });
 
   
    if (user.role === "collector" && user.isApproved === false) {
      if (user.deactivatedAt) {
        return res.status(403).json({
          message:
            "Your collector account has been deactivated. Please contact support if you believe this is an error.",
        });
      }
      return res.status(403).json({
        message: "Your collector account is pending admin approval.",
      });
    }
 
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
 
    res.status(200).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
 
// --------------------
// ADMIN ACTIONS
// --------------------
 
// Get all pending collectors
export const getPendingCollectors = async (req, res) => {
  try {
    const collectors = await User.find({
      role: "collector",
      isApproved: false,
      deactivatedAt: null,
    }).sort({ createdAt: -1 });

    res.json(collectors);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Helper: format createdAt as "X min ago" / "Y hr ago" / "Z days ago"
function timeAgo(date) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

// Admin notifications: new collector registration requests (pending only)
export const getAdminNotifications = async (req, res) => {
  try {
    const collectors = await User.find({
      role: "collector",
      isApproved: false,
      deactivatedAt: null,
    })
      .sort({ createdAt: -1 })
      .select("_id companyName createdAt")
      .lean();
    const notifications = collectors.map((c) => ({
      id: String(c._id),
      title: "Collector Registration Request",
      message: `Company: ${c.companyName || "Unnamed"}`,
      timeAgo: timeAgo(c.createdAt),
      linkTo: "/admin/collectors-requests",
    }));
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
 
 
// Approve collector
export const approveCollector = async (req, res) => {
  try {
    const collector = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
 
    if (!collector) return res.status(404).json({ message: "Collector not found" });
 
    // -------------------------
    // SEND APPROVAL EMAIL
    // -------------------------
    const html = `
    <div style="font-family: Arial; padding: 20px; max-width: 600px; margin: auto; border-radius: 10px; background: #ffffff;">
      <div style="text-align: center;">
        <img src="https://i.imgur.com/lF0sKzC.png" width="70" style="margin-bottom: 10px;" />
        <h2 style="color: #008000;">Request Accepted</h2>
      </div>
 
      <p>Dear <strong>${collector.companyName}</strong>,</p>
      <p>We are pleased to inform you that your collector registration request has been <strong>accepted</strong> by our admin team.</p>
 
      <p><strong>Request Details:</strong></p>
      <ul>
        <li><strong>Collector ID:</strong> ${collector.collectorId}</li>
        <li><strong>Date Submitted:</strong> ${collector.createdAt.toDateString()}</li>
        <li><strong>Status:</strong> Accepted</li>
      </ul>
 
      <div style="text-align: center; margin-top: 20px;">
        <a href="${appLoginUrl()}"
          style="padding: 12px 20px; color: white; text-decoration: none; background-color: #0080AA; border-radius: 6px;">
          Login Now
        </a>
      </div>
 
      <p style="margin-top: 30px; color: #777; font-size: 12px; text-align: center;">
        © 2025 ReNova Team. All rights reserved.
      </p>
    </div>
    `;
 
    let emailSent = true;
    let emailError = null;
    try {
      await sendEmail(collector.email, "Your ReNova collector account is approved — you can log in", html);
    } catch (mailErr) {
      emailSent = false;
      emailError = mailErr.message || "Unknown email error";
      console.error("Approval email failed:", mailErr);
    }

    res.json({
      message: emailSent
        ? "Collector approved. A confirmation email was sent."
        : `Collector approved, but the email could not be sent: ${emailError}`,
      emailSent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
 
export const rejectCollector = async (req, res) => {
  try {
    const { reason } = req.body; // admin-written reason
 
    const collector = await User.findById(req.params.id);
    if (!collector) return res.status(404).json({ message: "Collector not found" });
 
    // -------------------------
    // SEND REJECTION EMAIL
    // -------------------------
    const html = `
    <div style="font-family: Arial; padding: 20px; max-width: 600px; margin: auto; border-radius: 10px; background: #ffffff;">
      <div style="text-align: center;">
        <img src="https://i.imgur.com/lF0sKzC.png" width="70" style="margin-bottom: 10px;" />
        <h2 style="color: #CC0000;">Request Rejected</h2>
      </div>
 
      <p>Dear <strong>${collector.companyName}</strong>,</p>
      <p>We regret to inform you that your collector registration request has been <strong>rejected</strong> by our admin team.</p>
 
      <p><strong>Reason for Deactivation:</strong> ${reason}</p>
 
      <p><strong>Request Details:</strong></p>
      <ul>
        <li><strong>Collector ID:</strong> ${collector.collectorId}</li>
        <li><strong>Date Submitted:</strong> ${collector.createdAt.toDateString()}</li>
        <li><strong>Status:</strong> Rejected</li>
      </ul>
 
      <div style="text-align: center; margin-top: 20px;">
        <a href="mailto:support@renova.com"
          style="padding: 12px 20px; color: white; text-decoration: none; background-color: #005A7A; border-radius: 6px;">
          Contact Support
        </a>
      </div>
 
      <p style="margin-top: 30px; color: #777; font-size: 12px; text-align: center;">
        Thank you for your understanding.<br/>© 2025 ReNova Team. All rights reserved.
      </p>
    </div>
    `;
 
    try {
      await sendEmail(collector.email, "Your ReNova Request Has Been Rejected", html);
    } catch (mailErr) {
      console.error("Rejection email failed:", mailErr);
      return res.status(503).json({
        message: `Could not send rejection email: ${mailErr.message}. The collector was not removed.`,
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Collector rejected and notified by email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
 
 
export const sendPasswordOtp = async (req, res) => {
  try {
    const raw = req.body?.email;
    const email = typeof raw === "string" ? raw.trim() : "";
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "No account found for this email." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const html = `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color:#0080AA;">Password reset</h2>
        <p>Use this verification code to reset your ReNova password:</p>
        <h1 style="letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in <strong>5 minutes</strong>.</p>
      </div>
    `;

    try {
      await sendEmail(user.email, "ReNova password reset code", html);
    } catch (mailErr) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      console.error(mailErr);
      return res.status(503).json({
        message: mailErr.message || "Could not send email. Check server email settings.",
      });
    }

    res.json({ message: "Check your email for a 6-digit code." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
 
 
export const verifyPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "No account found for this email." });

    if (String(user.otp || "") !== String(otp || "").trim()) {
      return res.status(400).json({ message: "Invalid code." });
    }

    if (!user.otpExpires || new Date(user.otpExpires).getTime() < Date.now()) {
      return res.status(400).json({ message: "Code has expired. Request a new one." });
    }

    res.json({ message: "Code verified. You can set a new password." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
 
 
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "No account found for this email." });

    if (!user.otp || !user.otpExpires || new Date(user.otpExpires).getTime() < Date.now()) {
      return res.status(400).json({
        message: "Reset session expired or invalid. Go back and request a new code.",
      });
    }
 
   
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
 
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password."
      });
    }
 
   
    const hashed = await bcrypt.hash(newPassword, 10);
 
    user.password = hashed;
    user.otp = null;
    user.otpExpires = null;
 
    await user.save();
 
    res.json({ message: "Password has been reset successfully." });
 
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
 
 
export const updateCollectorProfile = async (req, res) => {
  try {
    const { companyName, collectorType, openHr, phone, acceptedCategories, address } = req.body;
 
    const collector = await User.findById(req.params.id);
    if (!collector) return res.status(404).json({ message: "Collector not found" });
 
   
    collector.companyName = companyName || collector.companyName;
    collector.collectorType = collectorType || collector.collectorType;
    collector.openHr = openHr || collector.openHr;
    collector.phone = phone || collector.phone;
    collector.acceptedCategories = acceptedCategories || collector.acceptedCategories;
    collector.address = address || collector.address;
 
    await collector.save();
 
    res.json({ message: "Profile updated successfully.", user: collector });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
 

export const getApprovedCollectors = async (req, res) => {
  try {
    
    const collectors = await User.find({
      role: "collector",
      isApproved: true,
      location: { $exists: true, $ne: null },
    });
    res.json(collectors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
export const updateUserProfile = async (req, res) => {
  try {
    const { uname, phone, email } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only allow normal users here
    if (user.role !== "user") {
      return res.status(403).json({ message: "Not authorized" });
    }
      user.uname = uname;
      user.phone = phone;

    await user.save();

    res.json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Admin: dashboard stats (counts from MongoDB)
// --------------------
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCollectors,
      pendingCollectorRequests,
      disposals,
      recycles,
      upcycles,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "collector", isApproved: true }),
      User.countDocuments({
        role: "collector",
        isApproved: false,
        deactivatedAt: null,
      }),
      countRequestsByCategory("Dispose"),
      countRequestsByCategory("Recycle"),
      countRequestsByCategory("Upcycle"),
    ]);
    res.json({
      totalUsers,
      totalCollectors,
      pendingCollectorRequests,
      disposals,
      recycles,
      upcycles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Admin: approved + deactivated collectors (manage / report — same list)
// Excludes pending registration (isApproved false, no deactivatedAt)
// --------------------
export const getCollectors = async (req, res) => {
  try {
    const collectors = await User.find({
      role: "collector",
      $or: [{ isApproved: true }, { deactivatedAt: { $exists: true, $ne: null } }],
    })
      .sort({ createdAt: -1 })
      .select(
        "companyName address phone email collectorId collectorType openHr createdAt isApproved deactivatedAt"
      )
      .lean();

    if (collectors.length === 0) {
      return res.json([]);
    }

    const collectorIds = collectors.map((c) => c._id);

    const aggAccepted = (Model) =>
      Model.aggregate([
        {
          $match: {
            collectorId: { $in: collectorIds },
            status: { $in: ["Accepted", "Completed"] },
          },
        },
        { $group: { _id: "$collectorId", n: { $sum: 1 } } },
      ]);

    const aggCompleted = (Model) =>
      Model.aggregate([
        {
          $match: {
            collectorId: { $in: collectorIds },
            status: "Completed",
          },
        },
        { $group: { _id: "$collectorId", n: { $sum: 1 } } },
      ]);

    const [pickAccepted, pickCompleted, dropAccepted, dropCompleted] = await Promise.all([
      aggAccepted(PickupRequest),
      aggCompleted(PickupRequest),
      aggAccepted(DropOffRequest),
      aggCompleted(DropOffRequest),
    ]);

    const mergeCounts = (rows, into) => {
      for (const row of rows) {
        if (!row._id) continue;
        const k = String(row._id);
        into.set(k, (into.get(k) || 0) + row.n);
      }
    };

    const acceptedMap = new Map();
    const completedMap = new Map();
    mergeCounts(pickAccepted, acceptedMap);
    mergeCounts(dropAccepted, acceptedMap);
    mergeCounts(pickCompleted, completedMap);
    mergeCounts(dropCompleted, completedMap);

    const enriched = collectors.map((c) => {
      const id = String(c._id);
      return {
        ...c,
        requestsAccepted: acceptedMap.get(id) ?? 0,
        requestsCompleted: completedMap.get(id) ?? 0,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Admin: deactivate a collector (sets isApproved: false) and email them the reason
// --------------------
export const deactivateCollector = async (req, res) => {
  try {
    const { reason } = req.body || {};

    const collector = await User.findById(req.params.id);
    if (!collector) return res.status(404).json({ message: "Collector not found" });
    if (collector.role !== "collector") return res.status(400).json({ message: "Not a collector" });
    if (collector.deactivatedAt) {
      return res.status(400).json({ message: "Collector is already deactivated." });
    }

    collector.isApproved = false;
    collector.deactivatedAt = new Date();
    await collector.save();

    const reasonText = reason && String(reason).trim() ? reason : "No reason provided.";

    const html = `
    <div style="font-family: Arial; padding: 20px; max-width: 600px; margin: auto; border-radius: 10px; background: #ffffff;">
      <div style="text-align: center;">
        <img src="https://i.imgur.com/lF0sKzC.png" width="70" style="margin-bottom: 10px;" />
        <h2 style="color: #CC0000;">Collector Account Deactivated</h2>
      </div>

      <p>Dear <strong>${collector.companyName || "Collector"}</strong>,</p>
      <p>Your ReNova collector account has been <strong>deactivated</strong> by our admin team.</p>

      <p><strong>Reason for deactivation:</strong></p>
      <p style="background: #f5f5f5; padding: 12px; border-radius: 6px;">${reasonText}</p>

      <p><strong>Account details:</strong></p>
      <ul>
        <li><strong>Collector ID:</strong> ${collector.collectorId || "—"}</li>
        <li><strong>Status:</strong> Deactivated</li>
      </ul>

      <div style="text-align: center; margin-top: 20px;">
        <a href="mailto:support@renova.com"
          style="padding: 12px 20px; color: white; text-decoration: none; background-color: #005A7A; border-radius: 6px;">
          Contact Support
        </a>
      </div>

      <p style="margin-top: 30px; color: #777; font-size: 12px; text-align: center;">
        © 2025 ReNova Team. All rights reserved.
      </p>
    </div>
    `;

    let emailSent = true;
    let emailError = null;
    try {
      await sendEmail(collector.email, "Your ReNova Collector Account Has Been Deactivated", html);
    } catch (mailErr) {
      emailSent = false;
      emailError = mailErr.message || "Unknown email error";
      console.error("Deactivation email failed:", mailErr);
    }

    res.json({
      message: emailSent
        ? "Collector deactivated. A notification email was sent."
        : `Collector deactivated, but email could not be sent: ${emailError}`,
      emailSent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Admin profile: get / update (requires verifyAdmin middleware)
// --------------------
export const getAdminProfile = async (req, res) => {
  try {
    const admin = req.user;
    res.json({
      name: admin.uname || "",
      email: admin.email || "",
      mobile: admin.phone || "",
      location: admin.locationName || "",
      avatarUrl: admin.pic || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, mobile, location, avatarUrl } = req.body;
    const admin = await User.findById(req.user._id);
    if (!admin) return res.status(404).json({ message: "Admin not found." });
    if (name !== undefined) admin.uname = name;
    if (email !== undefined) admin.email = email;
    if (mobile !== undefined) admin.phone = mobile;
    if (location !== undefined) admin.locationName = location;
    if (avatarUrl !== undefined) admin.pic = avatarUrl;
    await admin.save();
    const updated = await User.findById(admin._id).select("-password").lean();
    res.json({
      message: "Profile updated successfully.",
      profile: {
        name: updated.uname || "",
        email: updated.email || "",
        mobile: updated.phone || "",
        location: updated.locationName || "",
        avatarUrl: updated.pic || "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Admin: all collector registration requests (history: pending + approved + deactivated)
// --------------------
export const getCollectorRequestsHistory = async (req, res) => {
  try {
    const collectors = await User.find({ role: "collector" })
      .sort({ createdAt: -1 })
      .select("companyName email phone address collectorType openHr collectorId isApproved deactivatedAt createdAt")
      .lean();
    const list = collectors.map((c) => {
      let status = "pending";
      if (c.isApproved) status = "approved";
      else if (c.deactivatedAt) status = "deactivated";
      return {
        _id: c._id,
        companyName: c.companyName,
        email: c.email,
        phone: c.phone,
        address: c.address,
        collectorType: c.collectorType,
        openHr: c.openHr,
        collectorId: c.collectorId,
        status,
        createdAt: c.createdAt,
      };
    });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Admin: reactivate a deactivated collector (like approving again)
// --------------------
export const reactivateCollector = async (req, res) => {
  try {
    const collector = await User.findById(req.params.id);
    if (!collector) return res.status(404).json({ message: "Collector not found" });
    if (collector.role !== "collector") return res.status(400).json({ message: "Not a collector" });
    if (!collector.deactivatedAt) {
      return res.status(400).json({ message: "Collector is not deactivated." });
    }

    collector.isApproved = true;
    collector.deactivatedAt = undefined;
    await collector.save();

    const html = `
    <div style="font-family: Arial; padding: 20px; max-width: 600px; margin: auto; border-radius: 10px; background: #ffffff;">
      <div style="text-align: center;">
        <img src="https://i.imgur.com/lF0sKzC.png" width="70" style="margin-bottom: 10px;" />
        <h2 style="color: #008000;">Collector Account Reactivated</h2>
      </div>

      <p>Dear <strong>${collector.companyName || "Collector"}</strong>,</p>
      <p>Your ReNova collector account has been <strong>reactivated</strong> by our admin team. You can log in and use the platform again.</p>

      <p><strong>Account details:</strong></p>
      <ul>
        <li><strong>Collector ID:</strong> ${collector.collectorId || "—"}</li>
        <li><strong>Status:</strong> Active</li>
      </ul>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${appLoginUrl()}"
          style="padding: 12px 20px; color: white; text-decoration: none; background-color: #0080AA; border-radius: 6px;">
          Log in
        </a>
      </div>

      <p style="margin-top: 30px; color: #777; font-size: 12px; text-align: center;">
        © 2025 ReNova Team. All rights reserved.
      </p>
    </div>
    `;

    let emailSent = true;
    let emailError = null;
    try {
      await sendEmail(collector.email, "Your ReNova Collector Account Has Been Reactivated", html);
    } catch (mailErr) {
      emailSent = false;
      emailError = mailErr.message || "Unknown email error";
      console.error("Reactivation email failed:", mailErr);
    }

    res.json({
      message: emailSent
        ? "Collector reactivated. A confirmation email was sent."
        : `Collector reactivated, but email could not be sent: ${emailError}`,
      emailSent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --------------------
// Admin: get all users (for Users report)
// Reads from MongoDB "users" collection via User model (UserModel.js)
// Schema fields: uname, phone, email, userId, role, createdAt (timestamps)
// --------------------
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .select(
        "uname email phone pic userId userIdNumber locationName createdAt updatedAt"
      )
      .lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};