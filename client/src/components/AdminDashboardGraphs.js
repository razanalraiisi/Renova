import React from "react";
import AdminTopbar from "./AdminTopbar";
import "./AdminDashboardGraphs.css";

import pieImg from "../assets/pie.png";
import barImg from "../assets/bar.png";
import lineImg from "../assets/line.png";
import newUsersImg from "../assets/new-users.png"; // ✅ make sure this filename exists

export default function AdminDashboardGraphs() {
  return (
    <div className="adminPage">
      <AdminTopbar />

      <div className="adminBody">
        <div className="adminPanelPlain">
          <h2 className="dashTitle">Admin Dashboard</h2>

          <div className="graphsGrid">
            <div className="graphCard">
              <img className="graphImg" src={pieImg} alt="Recycle / Dispose / Upcycle" />
            </div>

            <div className="graphCard">
              <img className="graphImg" src={barImg} alt="Disposals (bar)" />
            </div>

            <div className="graphCard">
              <img className="graphImg" src={lineImg} alt="Disposals (line)" />
            </div>

            <div className="graphCard">
              <img className="graphImg" src={newUsersImg} alt="New Users Registered" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
