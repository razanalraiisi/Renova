import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const PIE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom", labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
  },
};

const BAR_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { maxRotation: 35, minRotation: 0 }, grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
};

function isDeactivated(c) {
  return Boolean(c?.deactivatedAt);
}

/** @param {{ collectors: object[] }} props */
export default function RenovaAdminCollectorsCharts({ collectors }) {
  const list = Array.isArray(collectors) ? collectors : [];

  const statusPie = useMemo(() => {
    let active = 0;
    let deactivated = 0;
    for (const c of list) {
      if (isDeactivated(c)) deactivated += 1;
      else active += 1;
    }
    if (active === 0 && deactivated === 0) {
      return {
        labels: ["No data"],
        datasets: [{ data: [1], backgroundColor: ["#e2e8f0"], borderColor: "#fff", borderWidth: 2 }],
      };
    }
    return {
      labels: ["Active", "Deactivated"],
      datasets: [
        {
          data: [active, deactivated],
          backgroundColor: ["#0080aa", "#cbd5e1"],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [list]);

  const typeBar = useMemo(() => {
    const map = new Map();
    for (const c of list) {
      const t = (c.collectorType && String(c.collectorType).trim()) || "Unspecified";
      map.set(t, (map.get(t) || 0) + 1);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (entries.length === 0) {
      return {
        labels: ["—"],
        datasets: [{ label: "Collectors", data: [0], backgroundColor: "#e2e8f0", borderRadius: 8 }],
      };
    }
    return {
      labels: entries.map(([k]) => (k.length > 24 ? `${k.slice(0, 22)}…` : k)),
      datasets: [
        {
          label: "Collectors",
          data: entries.map(([, v]) => v),
          backgroundColor: "#0080aa",
          borderRadius: 8,
        },
      ],
    };
  }, [list]);

  if (list.length === 0) return null;

  return (
    <div className="renovaReportChartsRow">
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Active vs deactivated</h4>
        <div className="renovaReportChartBody">
          <Pie data={statusPie} options={PIE_OPTS} />
        </div>
      </div>
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Collectors by type</h4>
        <div className="renovaReportChartBody">
          <Bar data={typeBar} options={BAR_OPTS} />
        </div>
      </div>
    </div>
  );
}
