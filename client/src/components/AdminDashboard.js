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

const StatCard = ({ title, value, lines = [], buttons = [] }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{value}</div>

      {lines.map((t, idx) => (
        <div key={idx} className="stat-card-sub">
          {t}
        </div>
      ))}

      <div className="stat-btn-row">
        {buttons.map((b, idx) => (
          <Button
            key={idx}
            className="mini-btn"
            size="sm"
            onClick={b.onClick}
          >
            {b.label}
          </Button>
        ))}
      </div>
    </div>
  );
};


const AdminDashboard = () => {
    // Redux placeholders (wire later)
    // You’ll create these values in adminSlice later — for now we fallback to defaults.
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
        const disposalsBar = {
            title: "Disposals",
            type: "bar",
            data: {
                labels: months.slice(0, 7),
                datasets: [
                    {
                        label: "Disposals",
                        data: [55, 49, 55, 64, 74, 89, 70],
                        backgroundColor: "#0080AA",
                        borderRadius: 6,
                    },
                ],
            },
        };

        const recyclesLine = {
            title: "Recycles - 2025",
            type: "line",
            data: {
                labels: months.slice(0, 7),
                datasets: [
                    {
                        label: "Recycles",
                        data: [52, 40, 40, 52, 64, 84, 76],
                        borderColor: "#0080AA",
                        backgroundColor: "rgba(0,128,170,0.15)",
                        tension: 0.35,
                        pointBackgroundColor: "#0080AA",
                    },
                ],
            },
        };

        const newUsersBar = {
            title: "New Users Registered",
            type: "bar",
            data: {
                labels: months,
                datasets: [
                    {
                        label: "New Users",
                        data: [80, 86, 95, 110, 125, 140, 165, 185],
                    },
                ],
            },
        };

        return [disposalsBar, recyclesLine, newUsersBar];
    }, []);

    const next = () => {
        if (animating) return;
        setActiveIndex((prev) => (prev === chartSlides.length - 1 ? 0 : prev + 1));
    };

    const prev = () => {
        if (animating) return;
        setActiveIndex((prev) => (prev === 0 ? chartSlides.length - 1 : prev - 1));
    };

    const chartOptions = (title) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: title, font: { size: 18, weight: "bold" } },
        },
        scales: {
            y: { beginAtZero: true },
        },
    });

    return (
        <div className="admin-board">
            <h3 className="admin-title">Admin Dashboard</h3>

            <Row>
                {/* LEFT COLUMN (stacked cards) */}
                <Col md="2" style={{ minWidth: 200 }}>
                    <SideCard
                        title="Users"
                        lines={[`Total users registered:`, `${stats.totalUsers}`]}
                        buttonText="View"
                        onClick={() => console.log("Go to admin users")}
                    />
                    <SideCard
                        title="E-Waste Library"
                        lines={[]}
                        buttonText="View"
                        onClick={() => console.log("Go to library")}
                    />
                    {/* Prototype shows Users again — keeping it for now */}
                    <SideCard
                        title="Users"
                        lines={[`Total users registered:`, `${stats.totalUsers}`]}
                        buttonText="View"
                        onClick={() => console.log("Go to admin users")}
                    />
                </Col>

                {/* CENTER AREA */}
                <Col md="8">
                    <Row className="mb-3">
                        <Col md="4">
                            <StatCard
                                title="Users"
                                value={stats.totalUsers}
                                lines={["Total users registered:"]}
                                buttons={[
                                    { label: "View", onClick: () => console.log("Users") },
                                ]}
                            />
                        </Col>

                        <Col md="4">
                            <StatCard
                                title="Collectors"
                                value={stats.collectors}
                                buttons={[
                                    { label: "Manage", onClick: () => console.log("Manage collectors") },
                                    { label: "Collector Requests", onClick: () => console.log("Requests") },
                                ]}
                            />

                        </Col>

                        <Col md="4">
                            <div
                                className="stat-card"
                                style={{
                                    background: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: 14,
                                }}
                            >
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ width: 70, height: 35, border: "1px solid #d7dbe0", borderRadius: 4 }} />
                                    <div style={{ width: 70, height: 35, border: "1px solid #d7dbe0", borderRadius: 4 }} />
                                </div>

                                <Button className="mini-btn" size="sm" onClick={() => console.log("View all graphs")}>
                                    View All Graphs
                                </Button>

                                <div style={{ width: 62, height: 62, border: "1px solid #d7dbe0", borderRadius: "50%" }} />
                            </div>
                        </Col>
                    </Row>

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

                            <CarouselControl direction="prev" directionText="Previous" onClickHandler={prev} />
                            <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
                        </Carousel>

                        {/* Dots like prototype */}
                        <div className="carousel-dots">
                            {chartSlides.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`dot ${idx === activeIndex ? "active" : ""}`}
                                    onClick={() => !animating && setActiveIndex(idx)}
                                    style={{ cursor: "pointer" }}
                                />
                            ))}
                        </div>
                    </div>
                </Col>

                {/* RIGHT COLUMN (disposals summary) */}
                <Col md="2" style={{ minWidth: 200 }}>
                    <div className="side-card">
                        <h6>Disposals:</h6>
                        <div style={{ fontSize: 12, marginBottom: 6 }}>
                            <b>{stats.disposals}</b>
                        </div>

                        <div style={{ fontSize: 12 }}>Recycles:</div>
                        <div style={{ fontSize: 12, marginBottom: 8 }}>
                            <b>{stats.recycles}</b>
                        </div>

                        <div style={{ fontSize: 12 }}>Upcycles:</div>
                        <div style={{ fontSize: 12, marginBottom: 10 }}>
                            <b>{stats.upcycles}</b>
                        </div>

                        <Button className="mini-btn" size="sm" onClick={() => console.log("Disposals view")}>
                            View
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
