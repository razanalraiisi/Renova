import React from "react";
import AdminRequestReportPage from "./AdminRequestReportPage";

const API_REPORT = "http://localhost:5000/admin/report-requests?category=Upcycle";

export default function UpcyclesReport() {
  return (
    <AdminRequestReportPage
      apiUrl={API_REPORT}
      title="Upcycles"
      pdfTitle="Upcycles"
      fileSlug="upcycles-report"
      emptyMessage="No upcycle requests found yet."
      loadErrorVerb="Failed to load upcycles"
    />
  );
}
