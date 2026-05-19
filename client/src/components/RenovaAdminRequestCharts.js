import React, { useCallback, useMemo } from "react";
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
import {
  summarizeAdminRequestRows,
  statusDistributionForChart,
  pickupDropoffStackedBarForChart,
  REQUEST_CATEGORY_CHART_SERIES,
  barIndexToSourceFilter,
} from "../utils/adminRequestReportStats.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function withAlpha(hex, alpha = 0.35) {
  if (!hex || hex.length < 7) return hex;
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

function filtersMatch(active, key, value) {
  if (value == null || value === "") return false;
  return String(active?.[key] ?? "").toLowerCase() === String(value).toLowerCase();
}

/** Draw pickup / drop-off totals above each stacked bar. */
const barTotalsLabelPlugin = {
  id: "barTotalsLabel",
  afterDatasetsDraw(chart) {
    const totals = chart.options?.plugins?.pickupDropoffTotals;
    const { ctx, scales } = chart;
    if (!Array.isArray(totals) || !scales?.x || !scales?.y) return;

    totals.forEach((total, index) => {
      if (!total || total <= 0) return;
      const x = scales.x.getPixelForValue(index);
      const y = scales.y.getPixelForValue(total) - 8;

      ctx.save();
      ctx.fillStyle = "#006d90";
      ctx.font = "bold 13px Segoe UI, Tahoma, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(String(total), x, y);
      ctx.restore();
    });
  },
};

ChartJS.register(barTotalsLabelPlugin);

const BASE_PIE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom", labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
  },
};

const BASE_STACKED_BAR_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { usePointStyle: true, padding: 12, font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        footer: (items) => {
          const total = items.reduce((sum, item) => sum + (item.parsed?.y || 0), 0);
          return total > 0 ? `Total: ${total}` : "";
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      ticks: { maxRotation: 0, color: "#006d90", font: { weight: "600" } },
      grid: { display: false },
    },
    y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
  },
};

/**
 * @param {{
 *   rows: object[],
 *   activeFilters?: object,
 *   onChartFilter?: (patch: { status?: string, category?: string, source?: string }) => void,
 * }} props
 */
export default function RenovaAdminRequestCharts({ rows, activeFilters = {}, onChartFilter }) {
  const list = Array.isArray(rows) ? rows : [];
  const interactive = typeof onChartFilter === "function";

  const setPointer = useCallback((event, elements) => {
    const target = event?.native?.target;
    if (target) target.style.cursor = interactive && elements?.length ? "pointer" : "";
  }, [interactive]);

  const applyFilterPatch = useCallback(
    (patch) => {
      if (!interactive) return;
      onChartFilter(patch);
    },
    [interactive, onChartFilter]
  );

  const pieMeta = useMemo(() => {
    const stats = summarizeAdminRequestRows(list);
    return statusDistributionForChart(stats);
  }, [list]);

  const pieData = useMemo(
    () => ({
      labels: pieMeta.labels,
      datasets: [
        {
          data: pieMeta.data,
          backgroundColor: pieMeta.colors.map((color, i) => {
            const key = pieMeta.filterKeys?.[i];
            if (!interactive || !activeFilters.status || !key) return color;
            return filtersMatch(activeFilters, "status", key)
              ? color
              : withAlpha(color, 0.4);
          }),
          borderColor: pieMeta.colors.map((color, i) => {
            const key = pieMeta.filterKeys?.[i];
            if (interactive && activeFilters.status && key && filtersMatch(activeFilters, "status", key)) {
              return "#004d66";
            }
            return "#fff";
          }),
          borderWidth: pieMeta.colors.map((_, i) => {
            const key = pieMeta.filterKeys?.[i];
            return interactive && activeFilters.status && key && filtersMatch(activeFilters, "status", key)
              ? 3
              : 2;
          }),
        },
      ],
    }),
    [pieMeta, activeFilters, interactive]
  );

  const requestStats = useMemo(() => summarizeAdminRequestRows(list), [list]);

  const barData = useMemo(() => {
    const chart = pickupDropoffStackedBarForChart(list);
    const dim = (color, seriesLabel, barIndex) => {
      if (!interactive) return color;
      const source = barIndexToSourceFilter(barIndex);
      const sourceActive = activeFilters.source && !filtersMatch(activeFilters, "source", source);
      const catActive = activeFilters.category && !filtersMatch(activeFilters, "category", seriesLabel);
      if (sourceActive || catActive) return withAlpha(color, 0.35);
      return color;
    };
    return {
      ...chart,
      labels: [`Pickup (${requestStats.pickup})`, `Drop-off (${requestStats.dropoff})`],
      datasets: chart.datasets.map((ds) => ({
        ...ds,
        backgroundColor: [dim(ds.backgroundColor, ds.label, 0), dim(ds.backgroundColor, ds.label, 1)],
        borderColor: "#fff",
        borderWidth: 1,
      })),
    };
  }, [list, requestStats.pickup, requestStats.dropoff, activeFilters, interactive]);

  const handlePieClick = useCallback(
    (_event, elements) => {
      if (!elements?.length) return;
      const idx = elements[0].index;
      const filterKey = pieMeta.filterKeys?.[idx];
      if (!filterKey) return;
      applyFilterPatch({ status: filterKey });
    },
    [applyFilterPatch, pieMeta.filterKeys]
  );

  const handleBarClick = useCallback(
    (_event, elements) => {
      if (!elements?.length) return;
      const { datasetIndex, index } = elements[0];
      const series = REQUEST_CATEGORY_CHART_SERIES[datasetIndex];
      if (!series) return;
      applyFilterPatch({
        source: barIndexToSourceFilter(index),
        category: series.label,
      });
    },
    [applyFilterPatch]
  );

  const pieOptions = useMemo(
    () => ({
      ...BASE_PIE_OPTS,
      onHover: setPointer,
      onClick: interactive ? handlePieClick : undefined,
      plugins: {
        ...BASE_PIE_OPTS.plugins,
        legend: {
          ...BASE_PIE_OPTS.plugins.legend,
          onClick: interactive
            ? (_e, legendItem) => {
                const filterKey = pieMeta.filterKeys?.[legendItem.index];
                if (filterKey) applyFilterPatch({ status: filterKey });
              }
            : undefined,
        },
        tooltip: interactive
          ? {
              callbacks: {
                afterLabel: (ctx) => {
                  const key = pieMeta.filterKeys?.[ctx.dataIndex];
                  if (!key) return "";
                  return filtersMatch(activeFilters, "status", key)
                    ? "Click to clear filter"
                    : "Click to filter list";
                },
              },
            }
          : undefined,
      },
    }),
    [interactive, handlePieClick, setPointer, pieMeta.filterKeys, applyFilterPatch, activeFilters]
  );

  const stackedBarOptions = useMemo(
    () => ({
      ...BASE_STACKED_BAR_OPTS,
      onHover: setPointer,
      onClick: interactive ? handleBarClick : undefined,
      plugins: {
        ...BASE_STACKED_BAR_OPTS.plugins,
        pickupDropoffTotals: [requestStats.pickup, requestStats.dropoff],
        legend: {
          ...BASE_STACKED_BAR_OPTS.plugins.legend,
          onClick: interactive
            ? (_e, legendItem) => {
                const series = REQUEST_CATEGORY_CHART_SERIES[legendItem.datasetIndex];
                if (series) applyFilterPatch({ category: series.label });
              }
            : undefined,
        },
        tooltip: interactive
          ? {
              ...BASE_STACKED_BAR_OPTS.plugins.tooltip,
              callbacks: {
                ...BASE_STACKED_BAR_OPTS.plugins.tooltip.callbacks,
                afterLabel: () => "Click to filter by type & category",
              },
            }
          : BASE_STACKED_BAR_OPTS.plugins.tooltip,
      },
    }),
    [
      interactive,
      handleBarClick,
      setPointer,
      requestStats.pickup,
      requestStats.dropoff,
      applyFilterPatch,
    ]
  );

  if (list.length === 0) return null;

  const pickupFiltered = filtersMatch(activeFilters, "source", "pickup");
  const dropoffFiltered = filtersMatch(activeFilters, "source", "dropoff");

  return (
    <div className="renovaReportChartsRow">
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Status distribution</h4>
        {interactive && (
          <p className="renovaReportChartHint">Click a slice or legend item to filter the list</p>
        )}
        <div className="renovaReportChartBody">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
      <div className="renovaReportChartCard">
        <h4 className="renovaReportChartTitle">Pickup vs drop-off by category</h4>
        <div className="renovaReportChartTotals">
          <span
            className={interactive ? "renovaReportChartTotalBtn" : undefined}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={interactive ? () => applyFilterPatch({ source: "pickup" }) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      applyFilterPatch({ source: "pickup" });
                    }
                  }
                : undefined
            }
            data-active={pickupFiltered || undefined}
          >
            Total pickups: <strong>{requestStats.pickup}</strong>
          </span>
          <span
            className={interactive ? "renovaReportChartTotalBtn" : undefined}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={interactive ? () => applyFilterPatch({ source: "dropoff" }) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      applyFilterPatch({ source: "dropoff" });
                    }
                  }
                : undefined
            }
            data-active={dropoffFiltered || undefined}
          >
            Total drop-offs: <strong>{requestStats.dropoff}</strong>
          </span>
        </div>
        {interactive && (
          <p className="renovaReportChartHint">
            Click a bar segment, legend, or total above to filter
          </p>
        )}
        <div className="renovaReportChartBody renovaReportChartBody--stackedBar">
          <Bar data={barData} options={stackedBarOptions} />
        </div>
      </div>
    </div>
  );
}
