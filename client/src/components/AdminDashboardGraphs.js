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
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import "./AdminDashboardGraphs.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_CHART_DATA = "http://localhost:5000/admin/chart-data";
const CHART_COLOR = "#0080AA";

function GraphSection({ title, reportPath, navigate, children }) {
  return (
    <>
      <div className="graphCardHeader">
        <h3 className="graphCardTitle">{title}</h3>
        <button
          type="button"
          className="graphViewReportBtn"
          onClick={() => navigate(reportPath)}
        >
          View report
        </button>
      </div>
      <div className="graphChartArea">{children}</div>
    </>
  );
}

export default function AdminDashboardGraphs() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch(API_CHART_DATA);
        if (res.ok) {
          const data = await res.json();
          setChartData(data);
        }
      } catch (err) {
        console.error("Failed to load chart data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
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
