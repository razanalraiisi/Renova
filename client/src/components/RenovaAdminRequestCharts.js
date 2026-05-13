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
import { summarizeAdminRequestRows, statusDistributionForChart } from "../utils/adminRequestReportStats.js";

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
    x: { ticks: { maxRotation: 0 }, grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
};

/** @param {{ rows: object[] }} props */
export default function RenovaAdminRequestCharts({ rows }) {
  const list = Array.isArray(rows) ? rows : [];

  const pieData = useMemo(() => {
    const stats = summarizeAdminRequestRows(list);
    const dist = statusDistributionForChart(stats);
    return {
      labels: dist.labels,
      datasets: [
        {
          data: dist.data,
          backgroundColor: dist.colors,
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [list]);

  const barData = useMemo(() => {
    const stats = summarizeAdminRequestRows(list);
    return {
      labels: ["Pickup", "Drop-off"],
      datasets: [
        {
          label: "Requests",
          data: [stats.pickup, stats.dropoff],
          backgroundColor: ["#0080aa", "#5cbad4"],
          borderRadius: 8,
        },
      ],
    };
  }, [list]);

  if (list.length === 0) return null;

  return (
    <div className="renovaReportChartsRow">
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Status distribution</h4>
        <div className="renovaReportChartBody">
          <Pie data={pieData} options={PIE_OPTS} />
        </div>
      </div>
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Pickup vs drop-off</h4>
        <div className="renovaReportChartBody">
          <Bar data={barData} options={BAR_OPTS} />
        </div>
      </div>
    </div>
  );
}
