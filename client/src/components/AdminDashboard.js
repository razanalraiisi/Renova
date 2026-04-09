import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import barImg from "../assets/bar.png";
import lineImg from "../assets/line.png";
import pieImg from "../assets/pie.png";

import {
  Row,
  Col,
  Button,
  Carousel,
  CarouselItem,
  CarouselControl,
} from "reactstrap";
import "./AdminDashboard.css";

// Chart.js
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

/* ---------- Side Card ---------- */
const SideCard = ({ title, lines = [], buttonText = "View", onClick }) => {
  return (
    <div className="side-card">
      <h6>{title}</h6>
      {lines.map((t, idx) => (
        <div key={idx} className="side-card-line">
          {t}
        </div>
      ))}
      <Button className="mini-btn" size="sm" onClick={onClick}>
        {buttonText}
      </Button>
    </div>
  );
};

const API_STATS = "http://localhost:5000/admin/stats";
const API_CHART_DATA = "http://localhost:5000/admin/chart-data";

/* ---------- Admin Dashboard ---------- */
const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    collectors: 0,
    disposals: 0,
    recycles: 0,
    upcycles: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_STATS);
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({
            ...prev,
            totalUsers: data.totalUsers ?? 0,
            collectors: data.totalCollectors ?? 0,
            disposals: data.disposals ?? 0,
            recycles: data.recycles ?? 0,
            upcycles: data.upcycles ?? 0,
          }));
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const [chartData, setChartData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

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
      }
    };
    fetchChartData();
  }, []);

  const chartSlides = useMemo(() => {
    const d = chartData;
    const empty7 = [0, 0, 0, 0, 0, 0, 0];
    const empty8 = [0, 0, 0, 0, 0, 0, 0, 0];
    const labels7 = d?.disposals?.labels ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const labels8 = d?.newUsers?.labels ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    const dataDisposals = d?.disposals?.data ?? empty7;
    const dataRecycles = d?.recycles?.data ?? empty7;
    const dataUpcycles = d?.upcycles?.data ?? empty7;
    const dataNewUsers = d?.newUsers?.data ?? empty8;

    return [
      {
        title: "Disposals",
        type: "bar",
        data: {
          labels: labels7,
          datasets: [
            {
              data: dataDisposals,
              backgroundColor: "#0080AA",
              borderRadius: 6,
            },
          ],
        },
      },
      {
        title: "Recycles",
        type: "line",
        data: {
          labels: labels7,
          datasets: [
            {
              data: dataRecycles,
              borderColor: "#0080AA",
              backgroundColor: "rgba(0,128,170,0.15)",
              tension: 0.35,
              pointBackgroundColor: "#0080AA",
            },
          ],
        },
      },
      {
        title: "Upcycles",
        type: "line",
        data: {
          labels: labels7,
          datasets: [
            {
              data: dataUpcycles,
              borderColor: "#0080AA",
              backgroundColor: "rgba(0,128,170,0.15)",
              tension: 0.35,
              pointBackgroundColor: "#0080AA",
            },
          ],
        },
      },
      {
        title: "New Users Registered",
        type: "bar",
        data: {
          labels: labels8,
          datasets: [
            {
              data: dataNewUsers,
              backgroundColor: "#0080AA",
              borderRadius: 6,
            },
          ],
        },
      },
    ];
  }, [chartData]);

  const next = () =>
    !animating && setActiveIndex((i) => (i + 1) % chartSlides.length);
  const prev = () =>
    !animating &&
    setActiveIndex((i) => (i === 0 ? chartSlides.length - 1 : i - 1));

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 4, bottom: 8, left: 4, right: 8 },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 15, weight: "bold" },
        padding: { bottom: 6, top: 2 },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { maxTicksLimit: 6 } },
      x: { ticks: { maxRotation: 45, minRotation: 0, autoSkip: true } },
    },
  });

  return (
    <div className="admin-board">
      <h3 className="admin-title">Welcome Admin!</h3>

      <Row className="admin-dash-grid gx-3 align-items-stretch">
        {/* LEFT COLUMN */}
        <Col md="2" className="side-column">
          <SideCard
            title="Users"
            lines={["Total users registered:", statsLoading ? "…" : stats.totalUsers]}
            onClick={() => navigate("/admin/reports/users")}
          />
          <SideCard
            title="E-Waste Library"
            onClick={() => navigate("/admin/devices")}
          />
          <SideCard
            title="Collectors"
            lines={["Total collectors:", statsLoading ? "…" : stats.collectors]}
            onClick={() => navigate("/admin/manage-collectors")}
          />
        </Col>

        {/* CENTER COLUMN */}
        <Col md="8" className="center-column">
          {/* TOP CARDS */}
          <Row className="top-cards-row">
            {/* Collectors */}
            <Col md="4">
              <div className="stat-card">
                <div className="stat-card-title">Collectors</div>
                <div className="stat-card-value">{statsLoading ? "…" : stats.collectors}</div>

                <div className="collector-btns">
                  <Button
                    className="mini-btn"
                    size="sm"
                    onClick={() => navigate("/admin/collectors-requests")}
                  >
                    Collector Requests
                  </Button>
                </div>
              </div>
            </Col>

            {/* View All Graphs */}
            <Col md="6">
              <div className="graphs-card">
                <div className="graphs-icons-row">
                  <div className="graphs-icon-box">
                    <img src={barImg} alt="Bar" className="graphs-img" />
                  </div>
                  <div className="graphs-icon-box">
                    <img src={lineImg} alt="Line" className="graphs-img" />
                  </div>
                  <div className="graphs-donut-box">
                    <img src={pieImg} alt="Pie" className="graphs-donut-img" />
                  </div>
                </div>
                <Button
                  className="mini-btn graphs-card-btn"
                  size="sm"
                  onClick={() => navigate("/admin/dashboard/graphs")}
                >
                  View All Graphs
                </Button>
              </div>
            </Col>
          </Row>

          {/* CHART */}
          <div className="center-graph-box">
            <Carousel
              activeIndex={activeIndex}
              next={next}
              previous={prev}
              interval={false}
            >
              {chartSlides.map((slide, idx) => (
                <CarouselItem
                  key={idx}
                  onExiting={() => setAnimating(true)}
                  onExited={() => setAnimating(false)}
                >
                  <div className="dashboard-carousel-chart-wrap">
                    {slide.type === "bar" ? (
                      <Bar data={slide.data} options={chartOptions(slide.title)} />
                    ) : (
                      <Line data={slide.data} options={chartOptions(slide.title)} />
                    )}
                  </div>
                </CarouselItem>
              ))}
              <CarouselControl direction="prev" onClickHandler={prev} />
              <CarouselControl direction="next" onClickHandler={next} />
            </Carousel>

            <div className="carousel-dots">
              {chartSlides.map((_, i) => (
                <div
                  key={i}
                  className={`dot ${i === activeIndex ? "active" : ""}`}
                  onClick={() => !animating && setActiveIndex(i)}
                />
              ))}
            </div>
          </div>
        </Col>

        {/* RIGHT COLUMN */}
        <Col md="2" className="side-column">
          <div className="side-card">
            <h6>Disposals</h6>
            <div className="side-card-line">
              <b>{statsLoading ? "…" : stats.disposals}</b>
            </div>
            <div className="side-card-line">
              Recycles: <b>{statsLoading ? "…" : stats.recycles}</b>
            </div>
            <div className="side-card-line">
              Upcycles: <b>{statsLoading ? "…" : stats.upcycles}</b>
            </div>

            <Button
              className="mini-btn"
              size="sm"
              onClick={() => navigate("/admin/dashboard/graphs")}
            >
              View
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
