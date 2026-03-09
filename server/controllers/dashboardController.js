import User from "../models/UserModel.js";
import PickupRequest from "../models/PickupRequestModel.js";

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

/**
 * GET /admin/chart-data
 * Returns chart-ready data from MongoDB for the dashboard carousel:
 * - disposals: PickupRequest count by month (last 7 months)
 * - recycles: PickupRequest count by month (last 7 months; same source as disposals)
 * - newUsers: User (role "user") count by month (last 8 months)
 */
export const getChartData = async (req, res) => {
  try {
    const last7 = getLastNMonths(7);
    const last8 = getLastNMonths(8);

    const disposalsData = await Promise.all(
      last7.map(({ start, end }) =>
        PickupRequest.countDocuments({
          createdAt: { $gte: start, $lt: end },
        })
      )
    );
    const recyclesData = await Promise.all(
      last7.map(({ start, end }) =>
        PickupRequest.countDocuments({
          createdAt: { $gte: start, $lt: end },
        })
      )
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
