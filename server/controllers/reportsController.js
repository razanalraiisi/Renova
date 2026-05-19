import PickupRequest from "../models/PickupRequestModel.js";
import DropOffRequest from "../models/DropOffRequestModel.js";
import User from "../models/UserModel.js";
import Report from "../models/ReportModel.js";
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Normalize user-chosen flow: Dispose / Recycle / Upcycle → disposal | recycle | upcycle */
const STAGE_ADD_CAT_KEY = {
  $addFields: {
    catKey: {
      $let: {
        vars: {
          c: {
            $toLower: {
              $trim: {
                input: { $ifNull: ["$category", ""] },
                chars: " \t\n",
              },
            },
          },
        },
        in: {
          $switch: {
            branches: [
              {
                case: { $regexMatch: { input: "$$c", regex: /dispos/ } },
                then: "disposal",
              },
              {
                case: { $regexMatch: { input: "$$c", regex: /recycl/ } },
                then: "recycle",
              },
              {
                case: { $regexMatch: { input: "$$c", regex: /upcycl/ } },
                then: "upcycle",
              },
            ],
            default: "other",
          },
        },
      },
    },
  },
};

/** Items that “went through” the system: accepted or completed, one of the three categories */
const STAGE_QUALIFIED = {
  $match: {
    status: { $in: ["Accepted", "Completed"] },
    catKey: { $in: ["disposal", "recycle", "upcycle"] },
  },
};

function formatPeakMonth(doc) {
  if (!doc || doc._id == null) return "";
  const y = doc._id.y;
  const m = doc._id.m;
  if (typeof y !== "number" || typeof m !== "number" || m < 1 || m > 12) return "";
  return `${MONTH_LABELS[m - 1]} ${y}`;
}

function roundPct(count, total) {
  if (!total || total <= 0) return 0;
  return Math.round((count / total) * 10000) / 100;
}

/**
 * GET /api/reports/insights
 * Pickup + drop-off merged:
 * - totalItems: Accepted + Completed, category Recycle / Upcycle / Dispose (normalized)
 * - topUser: collector with most of those requests (lookup → companyName / uname / email)
 * - topCategory: most common among those three on the same set; percentage = count / totalItems
 * - peakMonth: busiest calendar month on that same qualified set
 * - categoryBreakdown: counts and % for each qualifying category
 * - collectorsLeaderboard: top collectors (up to 25) on that set
 * - itemsWithoutCollector: qualifying items with no collectorId
 */
export const getReportInsights = async (req, res) => {
  try {
    const userColl = User.collection.name;
    const dropoffColl = DropOffRequest.collection.name;

    const mergeThenFacet = [
      { $project: { category: 1, createdAt: 1, collectorId: 1, status: 1 } },
      {
        $unionWith: {
          coll: dropoffColl,
          pipeline: [
            { $project: { category: 1, createdAt: 1, collectorId: 1, status: 1 } },
          ],
        },
      },
      {
        $facet: {
          totalFacet: [STAGE_ADD_CAT_KEY, STAGE_QUALIFIED, { $count: "totalItems" }],
          topUserFacet: [
            STAGE_ADD_CAT_KEY,
            STAGE_QUALIFIED,
            { $match: { collectorId: { $exists: true, $ne: null } } },
            { $group: { _id: "$collectorId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: userColl,
                localField: "_id",
                foreignField: "_id",
                as: "u",
              },
            },
            { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                count: 1,
                name: {
                  $let: {
                    vars: {
                      raw: {
                        $ifNull: [
                          "$u.companyName",
                          { $ifNull: ["$u.uname", { $ifNull: ["$u.email", ""] }] },
                        ],
                      },
                    },
                    in: { $trim: { input: { $toString: "$$raw" }, chars: " \t\n" } },
                  },
                },
              },
            },
          ],
          topCategoryFacet: [
            STAGE_ADD_CAT_KEY,
            STAGE_QUALIFIED,
            { $group: { _id: "$catKey", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
          ],
          peakMonthFacet: [
            STAGE_ADD_CAT_KEY,
            STAGE_QUALIFIED,
            {
              $match: {
                createdAt: { $exists: true, $type: "date" },
              },
            },
            {
              $group: {
                _id: {
                  y: { $year: "$createdAt" },
                  m: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 1 },
          ],
          /** All category counts on the same qualified set (for admin detail page). */
          categoryBreakdownFacet: [
            STAGE_ADD_CAT_KEY,
            STAGE_QUALIFIED,
            { $group: { _id: "$catKey", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          /** Top collectors on the qualified set (name resolved like topUser). */
          collectorsLeaderboardFacet: [
            STAGE_ADD_CAT_KEY,
            STAGE_QUALIFIED,
            { $match: { collectorId: { $exists: true, $ne: null } } },
            { $group: { _id: "$collectorId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 25 },
            {
              $lookup: {
                from: userColl,
                localField: "_id",
                foreignField: "_id",
                as: "u",
              },
            },
            { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                count: 1,
                name: {
                  $let: {
                    vars: {
                      raw: {
                        $ifNull: [
                          "$u.companyName",
                          { $ifNull: ["$u.uname", { $ifNull: ["$u.email", ""] }] },
                        ],
                      },
                    },
                    in: { $trim: { input: { $toString: "$$raw" }, chars: " \t\n" } },
                  },
                },
              },
            },
          ],
          withoutCollectorFacet: [
            STAGE_ADD_CAT_KEY,
            STAGE_QUALIFIED,
            {
              $match: {
                $or: [
                  { collectorId: { $exists: false } },
                  { collectorId: null },
                ],
              },
            },
            { $count: "c" },
          ],
        },
      },
    ];

    const [facetRow] = await PickupRequest.aggregate(mergeThenFacet);

    const totalItems =
      facetRow?.totalFacet?.[0]?.totalItems != null
        ? Number(facetRow.totalFacet[0].totalItems)
        : 0;

    const topUserDoc = facetRow?.topUserFacet?.[0];
    const topUser = {
      name: topUserDoc?.name ? String(topUserDoc.name) : "",
      count: topUserDoc?.count != null ? Number(topUserDoc.count) : 0,
    };

    const catDoc = facetRow?.topCategoryFacet?.[0];
    const catCount = catDoc?.count != null ? Number(catDoc.count) : 0;
    const topCategory = {
      name: catDoc?._id ? String(catDoc._id) : "",
      count: catCount,
      percentage: roundPct(catCount, totalItems),
    };

    const peakMonth = formatPeakMonth(facetRow?.peakMonthFacet?.[0]);

    const catRows = facetRow?.categoryBreakdownFacet ?? [];
    const categoryBreakdown = catRows.map((row) => {
      const c = row?.count != null ? Number(row.count) : 0;
      const key = row?._id != null ? String(row._id) : "";
      return {
        name: key,
        count: c,
        percentage: roundPct(c, totalItems),
      };
    });

    const lbRows = facetRow?.collectorsLeaderboardFacet ?? [];
    const collectorsLeaderboard = lbRows.map((row) => ({
      name: row?.name ? String(row.name) : "",
      count: row?.count != null ? Number(row.count) : 0,
    }));

    const withoutDoc = facetRow?.withoutCollectorFacet?.[0];
    const itemsWithoutCollector =
      withoutDoc?.c != null ? Number(withoutDoc.c) : 0;

    res.json({
      totalItems,
      topUser,
      topCategory,
      peakMonth,
      categoryBreakdown,
      collectorsLeaderboard,
      itemsWithoutCollector,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
export const createReport = async (req, res) => {
  try {
    const { requestId, collectorId, userId, reason } = req.body;

    const reporterId = req.user?._id;
    const reporterRole = req.user?.role;

    let reportedId = null;
    let reportedName = null;
    let reportedRole = null;

    /**
     * CASE 1: USER reports COLLECTOR
     */
    if (collectorId) {
      const collector = await User.findById(collectorId);

      if (collector) {
        reportedId = collector._id;
        reportedName = collector.companyName || collector.uname;
        reportedRole = "collector";
      }
    }

    /**
     * CASE 2: COLLECTOR reports USER
     */
    if (userId) {
      const user = await User.findById(userId);

      if (user) {
        reportedId = user._id;
        reportedName = user.uname || user.email;
        reportedRole = "user";
      }
    }

    const report = await Report.create({
      requestId,
      reason,

      reporterId,
      reporterRole,

      reportedId,
      reportedName,
      reportedRole,

      status: "open",
    });

    return res.status(201).json({
      message: "Report submitted successfully",
      report,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/reports/collectors
 * Fetch all approved collectors for the report dropdown
 */
export const getAllCollectors = async (req, res) => {
  try {
    const collectors = await User.find({ 
      role: 'collector', 
      isApproved: true 
    }).select('_id companyName uname email');

    res.status(200).json({
      success: true,
      collectors
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch collectors"
    });
  }
};

/**
 * GET /api/reports/users
 * Fetch all regular users (not collectors) for reporting
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ 
      role: 'user'
    }).select('_id uname email phone');

    res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};
// ===============================
// ADMIN: GET ALL REPORTS
// ===============================
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// ===============================
// ADMIN: IGNORE REPORT
// ===============================
export const ignoreReport = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Report.findByIdAndUpdate(
      id,
      {
        status: "ignored",
        actionTaken: "ignored",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to ignore report" });
  }
};

// ===============================
// ADMIN: DEACTIVATE REPORTED USER / COLLECTOR
// ===============================
export const deactivateReportedUser = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (!report.reportedId) {
      return res.status(400).json({ message: "No reported user found" });
    }

    await User.findByIdAndUpdate(report.reportedId, {
      isActive: false, // make sure this exists in User model
    });

    await Report.findByIdAndUpdate(id, {
      status: "actioned",
      actionTaken: "deactivated",
    });

    res.json({
      message: "Account deactivated successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};