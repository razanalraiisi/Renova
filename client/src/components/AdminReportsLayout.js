import React from "react";
import AdminTopbar from "./AdminTopbar";
import "./AdminPages.css";
import "./AdminReports.css";

export default function AdminReportsLayout({ title, children }) {
  return (
    <div className="adminPage">
      <AdminTopbar />

      <div className="adminBody">
        <div className="adminCardWrap">
          {/* Header row inside panel */}
          <div className="reportsHeader">
            <h3 className="reportsTitle">{title}</h3>

            <div className="reportsActions">
              <div className="searchBox">
                🔍 <input placeholder="search" />
              </div>
              <button className="downloadBtn" type="button">
                ⬇ Download
              </button>
            </div>
          </div>

          {/* Page content */}
          <div className="reportsContent">{children}</div>

          <div className="viewMore">View More</div>
        </div>
      </div>
    </div>
  );
}
