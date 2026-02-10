import React, { useMemo, useState } from "react";
import AdminTopbar from "./AdminTopbar";
import "./AdminPages.css";
import "./AdminReports.css";

export default function AdminReportsLayout({ title, children }) {
  // UI-only options (dummy)
  const items = useMemo(() => ["Dish washer", "Air Conditioner", "Laptop"], []);
  const users = useMemo(() => ["Faisal Al Wahabi", "Amal Al Abri", "Sulaiman Al Salmi"], []);

  const [showFilter, setShowFilter] = useState(true);
  const [date, setDate] = useState("2022-06-20");
  const [item, setItem] = useState("");
  const [user, setUser] = useState("");

  const apply = () => {
    // UI-only: close filter like the screenshot
    setShowFilter(false);
  };

  const reset = () => {
    setDate("2022-06-20");
    setItem("");
    setUser("");
  };

  return (
    <div className="adminPage">
      <AdminTopbar />

      <div className="adminBody">
        <div className="adminCardWrap">
          {/* Top row: Title + search + download */}
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

          {/* Main layout: filter + list */}
          <div className="reportsMain">
            {/* LEFT FILTER */}
            <div className="filterCol">
              <div className="filterTopRow">
                <div className="filterLabelMain">Filter By:</div>

                <button
                  type="button"
                  className="filterClose"
                  onClick={() => setShowFilter(false)}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {showFilter && (
                <div className="filterCard">
                  <div className="filterLabel">Filter By:</div>

                  <div className="filterRow">
                    <div className="filterFieldLabel">Date:</div>
                    <input
                      type="date"
                      className="filterInput"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="filterRow">
                    <div className="filterFieldLabel">Item:</div>
                    <select
                      className="filterInput"
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                    >
                      <option value=""> </option>
                      {items.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filterRow">
                    <div className="filterFieldLabel">User:</div>
                    <select
                      className="filterInput"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                    >
                      <option value=""> </option>
                      {users.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filterBtns">
                    <button className="filterApply" type="button" onClick={apply}>
                      Apply
                    </button>
                    <button className="filterReset" type="button" onClick={reset}>
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT LIST */}
            <div className="reportsRightCol">
              <div className="reportsContent">{children}</div>
            </div>
          </div>

          <div className="viewMore">View More</div>
        </div>
      </div>
    </div>
  );
}
