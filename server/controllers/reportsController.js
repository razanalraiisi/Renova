import PickupRequest from "../models/PickupRequestModel.js";
import DropOffRequest from "../models/DropOffRequestModel.js";
import User from "../models/UserModel.js";

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

    res.json({
      totalItems,
      topUser,
      topCategory,
      peakMonth,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
