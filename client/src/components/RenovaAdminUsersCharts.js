import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BAR_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { maxRotation: 45, minRotation: 0 }, grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
};

/** @param {{ users: object[] }} props — pass filtered set for chart */
export default function RenovaAdminUsersCharts({ users }) {
  const list = Array.isArray(users) ? users : [];

  const barData = useMemo(() => {
    const map = new Map();
    for (const u of list) {
      if (!u.createdAt) continue;
      const d = new Date(u.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    const keys = [...map.keys()].sort();
    const last = keys.slice(-8);
    if (last.length === 0) {
      return { labels: ["—"], datasets: [{ label: "New accounts", data: [0], backgroundColor: "#e2e8f0", borderRadius: 8 }] };
    }
    return {
      labels: last,
      datasets: [
        {
          label: "New accounts",
          data: last.map((k) => map.get(k) || 0),
          backgroundColor: "#0080aa",
          borderRadius: 8,
        },
      ],
    };
  }, [list]);

  if (list.length === 0) return null;

  return (
    <div className="renovaReportChartsRow">
      <div className="renovaReportChartCard" style={{ gridColumn: "1 / -1" }}>
        <h4 className="renovaReportChartTitle">Registrations by month (current filter)</h4>
        <div className="renovaReportChartBody">
          <Bar data={barData} options={BAR_OPTS} />
        </div>
      </div>
    </div>
  );
}
