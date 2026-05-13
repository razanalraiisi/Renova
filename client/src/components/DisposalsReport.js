import React from "react";
import AdminRequestReportPage from "./AdminRequestReportPage";

const API_REPORT = "http://localhost:5000/admin/report-requests?category=Dispose";

export default function DisposalsReport() {
  return (
    <AdminRequestReportPage
      apiUrl={API_REPORT}
      title="Disposals"
      pdfTitle="Disposals"
      fileSlug="disposals-report"
      emptyMessage="No disposal requests found yet."
      loadErrorVerb="Failed to load disposals"
    />
  );
}
