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
import {
  RENOVA_CHART_TEAL,
  RENOVA_CHART_TEAL_DARK,
  requestsPerUser,
} from "../utils/adminUsersReportStats.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BAR_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const v = Number(ctx.parsed?.y) || 0;
          return ` ${v} request${v === 1 ? "" : "s"}`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: { maxRotation: 45, minRotation: 0, color: "#64748b" },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, color: "#64748b" },
      grid: { color: "rgba(0, 128, 170, 0.08)" },
    },
  },
};

function truncateLabel(name, max = 14) {
  const s = String(name || "—").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/** @param {{ users: object[], requests?: object[] }} props */
export default function RenovaAdminUsersCharts({ users, requests = [] }) {
  const list = Array.isArray(users) ? users : [];
  const reqList = Array.isArray(requests) ? requests : [];

  const registrationsData = useMemo(() => {
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
      return {
        labels: ["—"],
        datasets: [{ label: "New accounts", data: [0], backgroundColor: "#e2e8f0", borderRadius: 8 }],
      };
    }
    return {
      labels: last,
      datasets: [
        {
          label: "New accounts",
          data: last.map((k) => map.get(k) || 0),
          backgroundColor: RENOVA_CHART_TEAL,
          borderRadius: 8,
        },
      ],
    };
  }, [list]);

  const requestsByUserData = useMemo(() => {
    const rows = requestsPerUser(list, reqList);
    if (rows.length === 0) {
      return {
        labels: ["—"],
        datasets: [{ label: "Requests", data: [0], backgroundColor: "#e2e8f0", borderRadius: 8 }],
      };
    }
    return {
      labels: rows.map((r) => truncateLabel(r.name)),
      datasets: [
        {
          label: "Requests",
          data: rows.map((r) => r.count),
          backgroundColor: RENOVA_CHART_TEAL,
          hoverBackgroundColor: RENOVA_CHART_TEAL_DARK,
          borderRadius: 8,
        },
      ],
    };
  }, [list, reqList]);

  const requestsChartOpts = useMemo(
    () => ({
      ...BAR_OPTS,
      plugins: {
        ...BAR_OPTS.plugins,
        tooltip: {
          callbacks: {
            title: (items) => {
              const rows = requestsPerUser(list, reqList);
              const idx = items[0]?.dataIndex;
              return rows[idx]?.name ?? items[0]?.label ?? "";
            },
            label: BAR_OPTS.plugins.tooltip.callbacks.label,
          },
        },
      },
    }),
    [list, reqList]
  );

  if (list.length === 0) return null;

  return (
    <div className="renovaReportChartsRow">
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Registrations by month (current filter)</h4>
        <div className="renovaReportChartBody">
          <Bar data={registrationsData} options={BAR_OPTS} />
        </div>
      </div>
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Requests per user (current filter)</h4>
        <div className="renovaReportChartBody">
          <Bar data={requestsByUserData} options={requestsChartOpts} />
        </div>
      </div>
    </div>
  );
}
