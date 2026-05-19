import React, { useCallback, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  summarizeAIRecommendationRows,
  recommendationDistributionForChart,
  followedVsIgnoredForChart,
  recommendationTrendForChart,
  topItemCategoriesForChart,
} from "../utils/aiRecommendationReportStats.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const PIE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom", labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
  },
};

const BAR_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { maxRotation: 45, minRotation: 0 }, grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
};

const LINE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
};

function buildInteractivePieOptions(base, onFilter, filterKeys, filterField) {
  if (!onFilter) return base;
  return {
    ...base,
    onClick: (_e, elements) => {
      if (!elements?.length) return;
      const key = filterKeys?.[elements[0].index];
      if (key) onFilter({ [filterField]: key });
    },
    plugins: {
      ...base.plugins,
      legend: {
        ...base.plugins?.legend,
        onClick: (_e, item) => {
          const key = filterKeys?.[item.index];
          if (key) onFilter({ [filterField]: key });
        },
      },
    },
  };
}

/**
 * @param {{ rows: object[], onChartFilter?: (patch: object) => void }} props
 */
export default function RenovaAdminAiCharts({ rows, onChartFilter }) {
  const list = Array.isArray(rows) ? rows : [];
  const interactive = typeof onChartFilter === "function";

  const stats = useMemo(() => summarizeAIRecommendationRows(list), [list]);

  const recDist = useMemo(() => recommendationDistributionForChart(stats), [stats]);
  const followDist = useMemo(() => followedVsIgnoredForChart(stats), [stats]);
  const trend = useMemo(() => recommendationTrendForChart(list), [list]);
  const topItems = useMemo(() => topItemCategoriesForChart(list), [list]);

  const pieData = useMemo(
    () => ({
      labels: recDist.labels,
      datasets: [
        {
          data: recDist.data,
          backgroundColor: recDist.colors,
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    }),
    [recDist]
  );

  const followPieData = useMemo(
    () => ({
      labels: followDist.labels,
      datasets: [
        {
          data: followDist.data,
          backgroundColor: followDist.colors,
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    }),
    [followDist]
  );

  const trendData = useMemo(
    () => ({
      labels: trend.labels,
      datasets: [
        {
          label: "AI uses",
          data: trend.data,
          borderColor: "#0080aa",
          backgroundColor: "rgba(0, 128, 170, 0.15)",
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [trend]
  );

  const topItemsData = useMemo(
    () => ({
      labels: topItems.labels,
      datasets: [
        {
          data: topItems.data,
          backgroundColor: "#0080aa",
          borderRadius: 6,
        },
      ],
    }),
    [topItems]
  );

  const mapFollowedFilter = useCallback(
    (label) => {
      const l = String(label).toLowerCase();
      if (l === "followed") return { followed: "yes" };
      if (l === "ignored") return { followed: "no" };
      if (l === "pending") return { followed: "pending" };
      return {};
    },
    []
  );

  const recPieOptions = useMemo(
    () =>
      buildInteractivePieOptions(PIE_OPTS, onChartFilter, recDist.filterKeys, "recommendation"),
    [onChartFilter, recDist.filterKeys]
  );

  const followPieOptions = useMemo(() => {
    if (!interactive) return PIE_OPTS;
    return {
      ...PIE_OPTS,
      onClick: (_e, elements) => {
        if (!elements?.length) return;
        const label = followDist.labels[elements[0].index];
        const patch = mapFollowedFilter(label);
        if (Object.keys(patch).length) onChartFilter(patch);
      },
      plugins: {
        ...PIE_OPTS.plugins,
        legend: {
          ...PIE_OPTS.plugins.legend,
          onClick: (_e, item) => {
            const label = followDist.labels[item.index];
            const patch = mapFollowedFilter(label);
            if (Object.keys(patch).length) onChartFilter(patch);
          },
        },
      },
    };
  }, [interactive, onChartFilter, followDist.labels, mapFollowedFilter]);

  if (list.length === 0) return null;

  return (
    <div className="renovaReportChartsRow renovaReportChartsRow--ai">
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Recommendation distribution</h4>
        {interactive && (
          <p className="renovaReportChartHint">Click a slice to filter by AI recommendation</p>
        )}
        <div className="renovaReportChartBody">
          <Pie data={pieData} options={recPieOptions} />
        </div>
      </div>
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Followed vs ignored</h4>
        {interactive && (
          <p className="renovaReportChartHint">Click a slice to filter by follow status</p>
        )}
        <div className="renovaReportChartBody">
          <Pie data={followPieData} options={followPieOptions} />
        </div>
      </div>
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Usage trend</h4>
        <div className="renovaReportChartBody">
          <Line data={trendData} options={LINE_OPTS} />
        </div>
      </div>
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Most common items</h4>
        <div className="renovaReportChartBody">
          <Bar data={topItemsData} options={BAR_OPTS} />
        </div>
      </div>
    </div>
  );
}
