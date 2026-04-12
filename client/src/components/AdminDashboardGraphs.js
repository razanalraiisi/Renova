import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopbar from "./AdminTopbar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import "./AdminDashboardGraphs.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_CHART_DATA = "http://localhost:5000/admin/chart-data";
const API_STATS = "http://localhost:5000/admin/stats";
const API_COLLECTOR_OUTCOMES =
  "http://localhost:5000/admin/chart-collector-accept-reject";
const CHART_COLOR = "#0080AA";
const REJECT_COLOR = "#dc2626";
const ACTIVITY_PIE_COLORS = ["#0080AA", "#006D90", "#5CBAD4"];

function GraphSection({ title, reportPath, navigate, children }) {
  return (
    <>
      <div className="graphCardHeader">
        <h3 className="graphCardTitle">{title}</h3>
        {reportPath ? (
          <button
            type="button"
            className="graphViewReportBtn"
            onClick={() => navigate(reportPath)}
          >
            View report
          </button>
        ) : null}
      </div>
      <div className="graphChartArea">{children}</div>
    </>
  );
}

export default function AdminDashboardGraphs() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState({
    disposals: 0,
    recycles: 0,
    upcycles: 0,
  });
  const [collectorOutcomes, setCollectorOutcomes] = useState({
    labels: [],
    accepted: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [chartRes, statsRes, outcomeRes] = await Promise.all([
          fetch(API_CHART_DATA),
          fetch(API_STATS),
          fetch(API_COLLECTOR_OUTCOMES),
        ]);
        if (chartRes.ok) {
          setChartData(await chartRes.json());
        }
        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats({
            disposals: s.disposals ?? 0,
            recycles: s.recycles ?? 0,
            upcycles: s.upcycles ?? 0,
          });
        }
        if (outcomeRes.ok) {
          const o = await outcomeRes.json();
          setCollectorOutcomes({
            labels: Array.isArray(o.labels) ? o.labels : [],
            accepted: Array.isArray(o.accepted) ? o.accepted : [],
            rejected: Array.isArray(o.rejected) ? o.rejected : [],
          });
        }
      } catch (err) {
        console.error("Failed to load chart data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const embedChartOptions = (showLegend = true) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: showLegend },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
      x: { grid: { display: false } },
    },
  });

  const activityPieData = useMemo(
    () => ({
      labels: ["Disposals", "Recycles", "Upcycles"],
      datasets: [
        {
          data: [stats.disposals, stats.recycles, stats.upcycles],
          backgroundColor: ACTIVITY_PIE_COLORS,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    }),
    [stats.disposals, stats.recycles, stats.upcycles]
  );

  const activityPieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { size: 12 },
            color: "#333",
          },
        },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = Number(ctx.raw) || 0;
              const arr = ctx.dataset?.data ?? [];
              const total = arr.reduce((a, b) => a + (Number(b) || 0), 0);
              const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0";
              return ` ${ctx.label}: ${v} (${pct}%)`;
            },
          },
        },
      },
    }),
    []
  );

  const collectorOutcomeBarData = useMemo(
    () => ({
      labels: collectorOutcomes.labels,
      datasets: [
        {
          label: "Accepted (incl. completed)",
          data: collectorOutcomes.accepted,
          backgroundColor: CHART_COLOR,
          borderRadius: 4,
        },
        {
          label: "Rejected",
          data: collectorOutcomes.rejected,
          backgroundColor: REJECT_COLOR,
          borderRadius: 4,
        },
      ],
    }),
    [collectorOutcomes]
  );

  const collectorOutcomeBarOptions = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v =
                ctx.parsed.x !== undefined ? ctx.parsed.x : ctx.parsed.y;
              return ` ${ctx.dataset.label}: ${v}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          stacked: false,
          ticks: { stepSize: 1 },
          grid: { color: "rgba(0,0,0,0.06)" },
        },
        y: {
          stacked: false,
          ticks: { autoSkip: false, font: { size: 11 } },
          grid: { display: false },
        },
      },
    }),
    []
  );

  const charts = useMemo(() => {
    const d = chartData;
    const empty7 = [0, 0, 0, 0, 0, 0, 0];
    const empty8 = [0, 0, 0, 0, 0, 0, 0, 0];
    const labels7 = d?.disposals?.labels ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const labels8 = d?.newUsers?.labels ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

    return {
      disposals: {
        title: "Disposals by Month",
        reportPath: "/admin/reports/disposals",
        type: "bar",
        data: {
          labels: labels7,
          datasets: [
            {
              label: "Requests (pickup + drop-off)",
              data: d?.disposals?.data ?? empty7,
              backgroundColor: CHART_COLOR,
              borderRadius: 6,
            },
          ],
        },
      },
      recycles: {
        title: "Recycles by Month",
        reportPath: "/admin/reports/recycles",
        type: "line",
        data: {
          labels: labels7,
          datasets: [
            {
              label: "Requests (pickup + drop-off)",
              data: d?.recycles?.data ?? empty7,
              borderColor: CHART_COLOR,
              backgroundColor: "rgba(0,128,170,0.15)",
              tension: 0.35,
              pointBackgroundColor: CHART_COLOR,
              fill: true,
            },
          ],
        },
      },
      upcycles: {
        title: "Upcycles by Month",
        reportPath: "/admin/reports/upcycles",
        type: "line",
        data: {
          labels: labels7,
          datasets: [
            {
              label: "Requests (pickup + drop-off)",
              data: d?.upcycles?.data ?? empty7,
              borderColor: CHART_COLOR,
              backgroundColor: "rgba(0,128,170,0.15)",
              tension: 0.35,
              pointBackgroundColor: CHART_COLOR,
              fill: true,
            },
          ],
        },
      },
      newUsers: {
        title: "New Users Registered by Month",
        reportPath: "/admin/reports/users",
        type: "bar",
        data: {
          labels: labels8,
          datasets: [
            {
              label: "New users",
              data: d?.newUsers?.data ?? empty8,
              backgroundColor: CHART_COLOR,
              borderRadius: 6,
            },
          ],
        },
      },
    };
  }, [chartData]);

  return (
    <div className="adminPage">
      <AdminTopbar />

      <div className="adminBody">
        <div className="adminPanelPlain">
          <div className="graphsPageHeader">
            <button
              type="button"
              className="graphsBackBtn"
              onClick={() => navigate("/admin/dashboard")}
            >
              ← Back to Dashboard
            </button>
            <h2 className="dashTitle">View All Graphs</h2>
            <p className="graphsSubtitle">Detailed charts from real data</p>
          </div>

          {loading ? (
            <div className="graphsLoading">Loading chart data…</div>
          ) : (
            <div className="graphsGrid graphsGridDetail">
              <div className="graphCard graphCardDetail graphCardSpanRow graphCardPieOverview">
                <GraphSection
                  title="Activity overview (totals)"
                  reportPath={null}
                  navigate={navigate}
                >
                  <Pie data={activityPieData} options={activityPieOptions} />
                </GraphSection>
              </div>

              <div
                className="graphCard graphCardDetail graphCardSpanRow graphCardCollectorOutcomes"
                style={{
                  minHeight: Math.max(
                    360,
                    collectorOutcomes.labels.length * 32 + 140
                  ),
                  height: Math.max(
                    360,
                    collectorOutcomes.labels.length * 32 + 140
                  ),
                }}
              >
                <GraphSection
                  title="Collector decisions (pickup + drop-off)"
                  reportPath="/admin/manage-collectors"
                  navigate={navigate}
                >
                  {collectorOutcomes.labels.length === 0 ? (
                    <p
                      className="graphsSubtitle"
                      style={{ margin: "24px 0", textAlign: "center" }}
                    >
                      No accepted or rejected requests with an assigned collector
                      yet.
                    </p>
                  ) : (
                    <Bar
                      data={collectorOutcomeBarData}
                      options={collectorOutcomeBarOptions}
                    />
                  )}
                </GraphSection>
              </div>

              <div className="graphCard graphCardDetail">
                <GraphSection
                  title={charts.disposals.title}
                  reportPath={charts.disposals.reportPath}
                  navigate={navigate}
                >
                  <Bar
                    data={charts.disposals.data}
                    options={embedChartOptions(true)}
                  />
                </GraphSection>
              </div>

              <div className="graphCard graphCardDetail">
                <GraphSection
                  title={charts.recycles.title}
                  reportPath={charts.recycles.reportPath}
                  navigate={navigate}
                >
                  <Line
                    data={charts.recycles.data}
                    options={embedChartOptions(true)}
                  />
                </GraphSection>
              </div>

              <div className="graphCard graphCardDetail graphCardSpanRow">
                <GraphSection
                  title={charts.upcycles.title}
                  reportPath={charts.upcycles.reportPath}
                  navigate={navigate}
                >
                  <Line
                    data={charts.upcycles.data}
                    options={embedChartOptions(true)}
                  />
                </GraphSection>
              </div>

              <div className="graphCard graphCardDetail graphCardFullWidth">
                <GraphSection
                  title={charts.newUsers.title}
                  reportPath={charts.newUsers.reportPath}
                  navigate={navigate}
                >
                  <Bar
                    data={charts.newUsers.data}
                    options={embedChartOptions(true)}
                  />
                </GraphSection>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
