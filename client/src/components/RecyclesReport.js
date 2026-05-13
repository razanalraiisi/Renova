import React from "react";
import AdminRequestReportPage from "./AdminRequestReportPage";

const API_REPORT = "http://localhost:5000/admin/report-requests?category=Recycle";

export default function RecyclesReport() {
  return (
    <AdminRequestReportPage
      apiUrl={API_REPORT}
      title="Recycles"
      pdfTitle="Recycles"
      fileSlug="recycles-report"
      emptyMessage="No recycle requests found yet."
      loadErrorVerb="Failed to load recycles"
    />
  );
}
