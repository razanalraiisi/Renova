import React, { useMemo, useState } from "react";
import AdminTopbar from "./AdminTopbar";
import "./AdminPages.css";
import "./AdminReports.css";

export default function AdminReportsLayout({
  title,
  children,
  onDownload,
  showFilter: showFilterProp = true,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onViewMore,
  viewMoreLabel = "View more",
  viewMoreDisabled = false,
  /** Stretch main card to viewport height; list area scrolls inside */
  fillViewport = false,
  /** Renders a small Back control above the title row (e.g. dashboard) */
  onBack,
  backLabel = "← Back",
  /**
   * When set, filter dropdowns use these lists (e.g. from live data).
   * Omit to keep legacy dummy labels for static demo pages.
   */
  itemSelectOptions,
  userSelectOptions,
  /** Called with current filter fields when user clicks Apply */
  onFilterApply,
  /** Called when user clicks Reset (after local fields clear) */
  onFilterReset,
}) {
  const dummyItems = useMemo(() => ["Dish washer", "Air Conditioner", "Laptop"], []);
  const dummyUsers = useMemo(() => ["Faisal Al Wahabi", "Amal Al Abri", "Sulaiman Al Salmi"], []);
  const items = itemSelectOptions ?? dummyItems;
  const users = userSelectOptions ?? dummyUsers;

  const [showFilter, setShowFilter] = useState(true);
  const [date, setDate] = useState("");
  const [item, setItem] = useState("");
  const [user, setUser] = useState("");

  /** When parent omits `searchValue`, keep query locally so typing always updates the field and notifies the parent. */
  const [localSearchDraft, setLocalSearchDraft] = useState("");
  const parentOwnsSearch =
    searchValue !== undefined && searchValue !== null;
  const searchInputValue = parentOwnsSearch ? String(searchValue) : localSearchDraft;

  const handleSearchInput = (e) => {
    const v = e.currentTarget.value;
    if (!parentOwnsSearch) setLocalSearchDraft(v);
    onSearchChange?.(v);
  };

  const apply = () => {
    onFilterApply?.({ date, item, user });
  };

  const reset = () => {
    setDate("");
    setItem("");
    setUser("");
    onFilterReset?.();
  };

  return (
    <div className={`adminPage${fillViewport ? " adminReportsPageFill" : ""}`}>
      <AdminTopbar />

      <div className={`adminBody${fillViewport ? " adminReportsBodyFill" : ""}`}>
        <div className={`adminCardWrap${fillViewport ? " adminCardWrapFill" : ""}`}>
          {onBack != null && (
            <div className="reportsBackRow">
              <button type="button" className="reportsBackBtn" onClick={onBack}>
                {backLabel}
              </button>
            </div>
          )}
          {/* Top row: Title + search + download */}
          <div className="reportsHeader">
            <h3 className="reportsTitle">{title}</h3>

            <div className="reportsActions">
              {onSearchChange != null && (
                <form
                  className="searchBox reportsHeaderSearch"
                  role="search"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <span aria-hidden="true">🔍</span>
                  <input
                    type="text"
                    inputMode="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    name="admin-report-search"
                    placeholder={searchPlaceholder ?? "Search"}
                    value={searchInputValue}
                    onChange={handleSearchInput}
                    aria-label={searchPlaceholder ?? "Search"}
                  />
                </form>
              )}
              <button
                className="downloadBtn"
                type="button"
                onClick={() => onDownload?.()}
              >
                ⬇ Download
              </button>
            </div>
          </div>

          {/* Main layout: filter + list (or list only when showFilter is false) */}
          <div
            className={`reportsMain${fillViewport ? " reportsMainFill" : ""}`}
            style={!showFilterProp ? { gridTemplateColumns: "1fr" } : undefined}
          >
            {showFilterProp && (
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
            )}

            {/* RIGHT LIST */}
            <div className={`reportsRightCol${fillViewport ? " reportsRightColFill" : ""}`}>
              <div className={`reportsContent${fillViewport ? " reportsContentFill" : ""}`}>{children}</div>
            </div>
          </div>

          {onViewMore != null && (
            <button
              type="button"
              className="viewMore viewMoreBtn"
              onClick={onViewMore}
              disabled={viewMoreDisabled}
            >
              {viewMoreLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
