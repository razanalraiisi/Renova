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

  const chartOptions = (title, showLegend = true) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: showLegend },
      title: { display: true, text: title, font: { size: 18, weight: "bold" } },
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
        type: "bar",
        data: {
          labels: labels7,
          datasets: [
            {
              label: "Pickup requests",
              data: d?.disposals?.data ?? empty7,
              backgroundColor: CHART_COLOR,
              borderRadius: 6,
            },
          ],
        },
      },
      recycles: {
        title: "Recycles by Month",
        type: "line",
        data: {
          labels: labels7,
          datasets: [
            {
              label: "Pickup requests",
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
      newUsers: {
        title: "New Users Registered by Month",
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
            <p className="graphsSubtitle">Detailed charts from your MongoDB data</p>
          </div>

          {loading ? (
            <div className="graphsLoading">Loading chart data…</div>
          ) : (
            <div className="graphsGrid graphsGridDetail">
              <div className="graphCard graphCardDetail">
                <Bar
                  data={charts.disposals.data}
                  options={chartOptions(charts.disposals.title)}
                />
              </div>

              <div className="graphCard graphCardDetail">
                <Line
                  data={charts.recycles.data}
                  options={chartOptions(charts.recycles.title)}
                />
              </div>

              <div className="graphCard graphCardDetail graphCardFullWidth">
                <Bar
                  data={charts.newUsers.data}
                  options={chartOptions(charts.newUsers.title)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
