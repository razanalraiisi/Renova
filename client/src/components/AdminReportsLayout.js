import React, { useMemo, useState } from "react";
import AdminTopbar from "./AdminTopbar";
import "./AdminPages.css";
import "./AdminReports.css";
import "./RenovaRichReport.css";

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
  /** Adds a Status dropdown (Pending / Accepted / Rejected / Completed) */
  showStatusFilter = false,
  /** Request category: Dispose / Recycle / Upcycle */
  showCategoryFilter = false,
  /** Pickup vs drop-off */
  showRequestSourceFilter = false,
  /** Rich report: summary stat cards (e.g. RenovaReportSummaryCards) */
  summarySlot = null,
  /** Rich report: charts row (e.g. RenovaAdminRequestCharts) */
  chartsSlot = null,
  /** Primary branded PDF export (collector-style document) */
  onDownloadPdf = null,
  /** Defaults to window.print; pass null to hide the print control */
  onPrint,
}) {
  const dummyItems = useMemo(() => ["Dish washer", "Air Conditioner", "Laptop"], []);
  const dummyUsers = useMemo(() => ["Faisal Al Wahabi", "Amal Al Abri", "Sulaiman Al Salmi"], []);
  const items = itemSelectOptions ?? dummyItems;
  const users = userSelectOptions ?? dummyUsers;

  const [showFilter, setShowFilter] = useState(true);
  const [date, setDate] = useState("");
  const [item, setItem] = useState("");
  const [user, setUser] = useState("");
  const [status, setStatus] = useState("");
  const [requestCategory, setRequestCategory] = useState("");
  const [requestSource, setRequestSource] = useState("");

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
    onFilterApply?.({
      date,
      item,
      user,
      status,
      category: requestCategory,
      source: requestSource,
    });
  };

  const reset = () => {
    setDate("");
    setItem("");
    setUser("");
    setStatus("");
    setRequestCategory("");
    setRequestSource("");
    onFilterReset?.();
  };

  const showPrintButton =
    onPrint !== null &&
    (typeof onPrint === "function" ||
      summarySlot != null ||
      chartsSlot != null ||
      onDownloadPdf != null);

  return (
    <div className={`adminPage${fillViewport ? " adminReportsPageFill" : ""}`}>
      <AdminTopbar />

      <div className={`adminBody${fillViewport ? " adminReportsBodyFill" : ""}`}>
        <div
          className={`adminCardWrap adminReportsPrintRoot${
            fillViewport ? " adminCardWrapFill" : ""
          }`}
        >
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

            <div className="reportsActions reportsActionBar">
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
              {showPrintButton && (
                <button
                  className="reportsActionPrint"
                  type="button"
                  onClick={typeof onPrint === "function" ? onPrint : () => window.print()}
                >
                  Print
                </button>
              )}
              {onDownloadPdf != null && (
                <button className="reportsActionPdf" type="button" onClick={() => onDownloadPdf()}>
                  Download PDF
                </button>
              )}
              {onDownload != null && (
                <button
                  className={onDownloadPdf != null ? "reportsActionCsv" : "downloadBtn"}
                  type="button"
                  onClick={() => onDownload()}
                >
                  {onDownloadPdf != null || showPrintButton ? "Download CSV" : "⬇ Download"}
                </button>
              )}
            </div>
          </div>

          {summarySlot != null && summarySlot !== false ? (
            <div className="reportsRichSummary">{summarySlot}</div>
          ) : null}
          {chartsSlot != null && chartsSlot !== false ? (
            <div className="reportsRichCharts">{chartsSlot}</div>
          ) : null}

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

                    {showStatusFilter && (
                      <div className="filterRow">
                        <div className="filterFieldLabel">Status:</div>
                        <select
                          className="filterInput"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    )}

                    {showCategoryFilter && (
                      <div className="filterRow">
                        <div className="filterFieldLabel">Category:</div>
                        <select
                          className="filterInput"
                          value={requestCategory}
                          onChange={(e) => setRequestCategory(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="Dispose">Dispose</option>
                          <option value="Recycle">Recycle</option>
                          <option value="Upcycle">Upcycle</option>
                        </select>
                      </div>
                    )}

                    {showRequestSourceFilter && (
                      <div className="filterRow">
                        <div className="filterFieldLabel">Type:</div>
                        <select
                          className="filterInput"
                          value={requestSource}
                          onChange={(e) => setRequestSource(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="pickup">Pickup</option>
                          <option value="dropoff">Drop-off</option>
                        </select>
                      </div>
                    )}

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
