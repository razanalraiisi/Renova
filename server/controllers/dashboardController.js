import mongoose from "mongoose";
import User from "../models/UserModel.js";
import PickupRequest from "../models/PickupRequestModel.js";
import DropOffRequest from "../models/DropOffRequestModel.js";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getLastNMonths(n) {
  const now = new Date();
  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    result.push({
      label: MONTHS[d.getMonth()],
      start,
      end,
    });
  }
  return result;
}

async function countCategoryInMonth(category, start, end) {
  const rx = new RegExp(`^${escapeRegex(category)}$`, "i");
  const [pickups, dropoffs] = await Promise.all([
    PickupRequest.countDocuments({
      category: rx,
      createdAt: { $gte: start, $lt: end },
    }),
    DropOffRequest.countDocuments({
      category: rx,
      createdAt: { $gte: start, $lt: end },
    }),
  ]);
  return pickups + dropoffs;
}

/**
 * GET /admin/chart-data
 * Returns chart-ready data from MongoDB for the dashboard carousel:
 * - disposals: Dispose pickup + drop-off count by month (last 7 months)
 * - recycles: Recycle pickup + drop-off count by month (last 7 months)
 * - upcycles: Upcycle pickup + drop-off count by month (last 7 months)
 * - newUsers: User (role "user") count by month (last 8 months)
 */
export const getChartData = async (req, res) => {
  try {
    const last7 = getLastNMonths(7);
    const last8 = getLastNMonths(8);

    const disposalsData = await Promise.all(
      last7.map(({ start, end }) => countCategoryInMonth("Dispose", start, end))
    );
    const recyclesData = await Promise.all(
      last7.map(({ start, end }) => countCategoryInMonth("Recycle", start, end))
    );
    const upcyclesData = await Promise.all(
      last7.map(({ start, end }) => countCategoryInMonth("Upcycle", start, end))
    );
    const newUsersData = await Promise.all(
      last8.map(({ start, end }) =>
        User.countDocuments({
          role: "user",
          createdAt: { $gte: start, $lt: end },
        })
      )
    );

    res.json({
      disposals: {
        labels: last7.map((m) => m.label),
        data: disposalsData,
      },
      recycles: {
        labels: last7.map((m) => m.label),
        data: recyclesData,
      },
      upcycles: {
        labels: last7.map((m) => m.label),
        data: upcyclesData,
      },
      newUsers: {
        labels: last8.map((m) => m.label),
        data: newUsersData,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET /admin/report-requests?category=Recycle
 * Pickup + drop-off rows for admin reports (matched by category, case-insensitive).
 */
export const getAdminRequestsByCategory = async (req, res) => {
  try {
    const raw = (req.query.category || "").trim();
    if (!raw) {
      return res.status(400).json({ message: "Query parameter category is required." });
    }
    const rx = new RegExp(`^${escapeRegex(raw)}$`, "i");
    const [pickups, dropoffs] = await Promise.all([
      PickupRequest.find({ category: rx }).sort({ createdAt: -1 }).lean(),
      DropOffRequest.find({ category: rx }).sort({ createdAt: -1 }).lean(),
    ]);
    const merged = [
      ...pickups.map((r) => ({ ...r, source: "pickup" })),
      ...dropoffs.map((r) => ({ ...r, source: "dropoff" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET /admin/report-requests-all
 * All pickup + drop-off requests (every category), newest first.
 */
export const getAdminAllRequests = async (req, res) => {
  try {
    const [pickups, dropoffs] = await Promise.all([
      PickupRequest.find({}).sort({ createdAt: -1 }).lean(),
      DropOffRequest.find({}).sort({ createdAt: -1 }).lean(),
    ]);
    const merged = [
      ...pickups.map((r) => ({ ...r, source: "pickup" })),
      ...dropoffs.map((r) => ({ ...r, source: "dropoff" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET /admin/chart-collector-accept-reject
 * Per collector: pickup + drop-off counts where the collector acted — accepted (Accepted + Completed) vs Rejected.
 */
export const getCollectorAcceptRejectChart = async (req, res) => {
  try {
    const perCollector = (Model) =>
      Model.aggregate([
        {
          $match: {
            collectorId: { $exists: true, $ne: null },
            status: { $in: ["Accepted", "Completed", "Rejected"] },
          },
        },
        {
          $group: {
            _id: "$collectorId",
            accepted: {
              $sum: {
                $cond: [{ $in: ["$status", ["Accepted", "Completed"]] }, 1, 0],
              },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
            },
          },
        },
      ]);

    const [pickRows, dropRows] = await Promise.all([
      perCollector(PickupRequest),
      perCollector(DropOffRequest),
    ]);

    const map = new Map();
    const merge = (rows) => {
      for (const r of rows) {
        if (!r._id) continue;
        const k = String(r._id);
        const cur = map.get(k) || { accepted: 0, rejected: 0 };
        cur.accepted += Number(r.accepted) || 0;
        cur.rejected += Number(r.rejected) || 0;
        map.set(k, cur);
      }
    };
    merge(pickRows);
    merge(dropRows);

    if (map.size === 0) {
      return res.json({ labels: [], accepted: [], rejected: [] });
    }

    const oidList = [...map.keys()]
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const users = await User.find({ _id: { $in: oidList } })
      .select("companyName collectorId")
      .lean();

    const nameById = new Map(
      users.map((u) => [
        String(u._id),
        (u.companyName && String(u.companyName).trim()) || u.collectorId || String(u._id),
      ])
    );

    const series = [...map.entries()].map(([id, v]) => ({
      name: nameById.get(id) || "Unknown collector",
      accepted: v.accepted,
      rejected: v.rejected,
      total: v.accepted + v.rejected,
    }));

    series.sort((a, b) => b.total - a.total);
    const limit = 35;
    const top = series.slice(0, limit);

    res.json({
      labels: top.map((s) => s.name),
      accepted: top.map((s) => s.accepted),
      rejected: top.map((s) => s.rejected),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
