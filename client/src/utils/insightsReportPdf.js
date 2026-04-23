import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function formatCategoryLabel(key) {
  if (!key) return "—";
  const s = String(key).toLowerCase();
  if (s === "disposal") return "Disposal";
  if (s === "recycle") return "Recycle";
  if (s === "upcycle") return "Upcycle";
  return String(key).replace(/^./, (c) => c.toUpperCase());
}

/**
 * Builds the same metrics as the on-screen report summary and downloads a PDF.
 * @param {object} payload
 * @param {number} payload.totalItems
 * @param {{ name?: string, count?: number }} payload.topUser
 * @param {{ name?: string, count?: number, percentage?: number }} payload.topCategory
 * @param {string} [payload.peakMonth]
 * @param {string} [payload.generatedAt]
 * @returns {boolean} false if PDF generation failed
 */
export function downloadInsightsReportPdf(payload) {
  try {
    const totalItems = Number(payload?.totalItems) || 0;
    const topUser = payload?.topUser ?? {};
    const topCategory = payload?.topCategory ?? {};
    const peakMonth = payload?.peakMonth ?? "";
    const generatedAt =
      payload?.generatedAt ??
      new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

    const count = Number(topUser.count) || 0;
    const collectorLine =
      count > 0
        ? `${(topUser.name || "").trim() || "—"} (${count} request${count === 1 ? "" : "s"})`
        : "—";

    const catCount = Number(topCategory.count) || 0;
    const pct = Number(topCategory.percentage);
    const catLine =
      catCount > 0
        ? `${formatCategoryLabel(topCategory.name)} — ${
            Number.isFinite(pct) ? pct.toFixed(1) : "0.0"
          }% (${catCount} of ${totalItems} qualifying)`
        : "—";

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const margin = 14;
    let y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Admin dashboard — Report summary", margin, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Generated: ${generatedAt}`, margin, y);
    y += 7;

    const scopeText =
      "Scope: Accepted or completed pickup and drop-off requests with user category Recycle, Upcycle, or Dispose.";
    const scopeLines = doc.splitTextToSize(scopeText, 182);
    doc.text(scopeLines, margin, y);
    y += scopeLines.length * 5 + 8;

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Total items", String(totalItems)],
        ["Top collector", collectorLine],
        ["Top category", catLine],
        ["Peak month (volume)", peakMonth || "—"],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3.5, textColor: [30, 41, 59] },
      headStyles: {
        fillColor: [0, 128, 170],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 52 },
        1: { cellWidth: 128 },
      },
    });

    const tableEnd =
      typeof doc.lastAutoTable?.finalY === "number" ? doc.lastAutoTable.finalY + 10 : y + 40;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Renova admin reporting", margin, tableEnd);

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    doc.save(`renova-report-summary-${stamp}.pdf`);
    return true;
  } catch (err) {
    console.error("downloadInsightsReportPdf", err);
    return false;
  }
}
