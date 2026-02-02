import barImg from "../assets/bar.png";
import lineImg from "../assets/line.png";
import pieImg from "../assets/pie.png";
import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Button,
  Carousel,
  CarouselItem,
  CarouselControl,
} from "reactstrap";
import { useSelector } from "react-redux";
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
        <div key={idx} style={{ fontSize: 12, marginBottom: 4 }}>
          {t}
        </div>
      ))}
      <Button className="mini-btn" size="sm" onClick={onClick}>
        {buttonText}
      </Button>
    </div>
  );
};

/* ---------- Admin Dashboard ---------- */
const AdminDashboard = () => {
  const stats = useSelector((s) => s.admin?.stats) || {
    totalUsers: 315,
    collectors: 195,
    disposals: 456,
    recycles: 216,
    upcycles: 135,
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

  const chartSlides = useMemo(() => {
    return [
      {
        title: "Disposals",
        type: "bar",
        data: {
          labels: months.slice(0, 7),
          datasets: [
            {
              data: [55, 49, 55, 64, 74, 89, 70],
              backgroundColor: "#0080AA",
              borderRadius: 6,
            },
          ],
        },
      },
      {
        title: "Recycles - 2025",
        type: "line",
        data: {
          labels: months.slice(0, 7),
          datasets: [
            {
              data: [52, 40, 40, 52, 64, 84, 76],
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
          labels: months,
          datasets: [
            {
              data: [80, 86, 95, 110, 125, 140, 165, 185],
              backgroundColor: "#0080AA",
              borderRadius: 6,
            },
          ],
        },
      },
    ];
  }, []);

  const next = () => !animating && setActiveIndex((i) => (i + 1) % chartSlides.length);
  const prev = () => !animating && setActiveIndex((i) => (i === 0 ? chartSlides.length - 1 : i - 1));

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title, font: { size: 18, weight: "bold" } },
    },
    scales: { y: { beginAtZero: true } },
  });

  return (
    <div className="admin-board">
      <h3 className="admin-title">Admin Dashboard</h3>

      <Row>
        {/* LEFT COLUMN */}
        <Col md="2" style={{ minWidth: 200 }} className="side-column">
          <SideCard
            title="Users"
            lines={["Total users registered:", stats.totalUsers]}
            onClick={() => console.log("Users")}
          />
          <SideCard
            title="E-Waste Library"
            onClick={() => console.log("Library")}
          />
          <SideCard
            title="Users"
            lines={["Total users registered:", stats.totalUsers]}
            onClick={() => console.log("Users")}
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
                <div className="stat-card-value">{stats.collectors}</div>

                <div className="collector-btns">
                  <Button className="mini-btn" size="sm">Manage</Button>
                  <Button className="mini-btn" size="sm">Collector Requests</Button>
                </div>
              </div>
            </Col>

            {/* View All Graphs */}
            <Col md="4">
              <div className="graphs-card">
                <div className="graphs-icons">
                  <div className="graphs-icon-box">
                    <img src={barImg} alt="Bar" className="graphs-img" />
                  </div>
                  <div className="graphs-icon-box">
                    <img src={lineImg} alt="Line" className="graphs-img" />
                  </div>
                </div>

                <div className="graphs-right">
                  <Button className="mini-btn" size="sm">View All Graphs</Button>
                  <div className="graphs-donut-box">
                    <img src={pieImg} alt="Pie" className="graphs-donut-img" />
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* CHART */}
          <div className="center-graph-box">
            <Carousel activeIndex={activeIndex} next={next} previous={prev} interval={false}>
              {chartSlides.map((slide, idx) => (
                <CarouselItem
                  key={idx}
                  onExiting={() => setAnimating(true)}
                  onExited={() => setAnimating(false)}
                  style={{ height: 290 }}
                >
                  <div style={{ height: 290 }}>
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
        <Col md="2" style={{ minWidth: 200 }} className="side-column">
          <div className="side-card">
            <h6>Disposals</h6>
            <div><b>{stats.disposals}</b></div>
            <div>Recycles: <b>{stats.recycles}</b></div>
            <div>Upcycles: <b>{stats.upcycles}</b></div>
            <Button className="mini-btn" size="sm">View</Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
