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

const TABLE_HEAD = {
  fillColor: [0, 128, 170],
  textColor: 255,
  fontStyle: "bold",
  fontSize: 9,
};

const TABLE_BODY = {
  fontSize: 9,
  cellPadding: 3,
  textColor: [30, 41, 59],
};

function nextSectionStart(doc, margin, minY = 14) {
  const prev = typeof doc.lastAutoTable?.finalY === "number" ? doc.lastAutoTable.finalY : minY;
  let y = prev + 12;
  const pageH = doc.internal.pageSize.getHeight();
  if (y > pageH - 40) {
    doc.addPage();
    y = minY;
  }
  return y;
}

/**
 * Report summary PDF: dashboard headline metrics, then ranked collectors and categories.
 * @param {object} payload
 * @param {number} payload.totalItems
 * @param {{ name?: string, count?: number }} payload.topUser
 * @param {{ name?: string, count?: number, percentage?: number }} payload.topCategory
 * @param {string} [payload.peakMonth]
 * @param {Array<{ name?: string, count?: number, percentage?: number }>} [payload.categoryBreakdown]
 * @param {Array<{ name?: string, count?: number }>} [payload.collectorsLeaderboard]
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

    const collectorsRaw = Array.isArray(payload?.collectorsLeaderboard)
      ? payload.collectorsLeaderboard
      : [];
    const categoryRaw = Array.isArray(payload?.categoryBreakdown) ? payload.categoryBreakdown : [];
    const categorySorted = [...categoryRaw].sort(
      (a, b) => (Number(b?.count) || 0) - (Number(a?.count) || 0)
    );

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

    /** Summary table (same headline stats as the three dashboard cards, plus context). */
    autoTable(doc, {
      startY: y,
      head: [["Dashboard metric", "Value"]],
      body: [
        ["Total qualifying items", String(totalItems)],
        ["Top collector", collectorLine],
        ["Top category (action mix)", catLine],
        ["Peak month (volume)", peakMonth || "—"],
      ],
      theme: "grid",
      styles: TABLE_BODY,
      headStyles: TABLE_HEAD,
      columnStyles: {
        0: { cellWidth: 62 },
        1: { cellWidth: 118 },
      },
    });

    /** Collectors: full leaderboard so #2, #3, … appear in the PDF. */
    let startY = nextSectionStart(doc, margin);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Collectors ranked", margin, startY);

    const collectorBody =
      collectorsRaw.length > 0
        ? collectorsRaw.map((r, i) => [
            String(i + 1),
            ((r?.name ?? "") + "").trim() || "—",
            String(Number(r?.count) || 0),
          ])
        : [["—", "No collector-attributed items yet", "0"]];

    autoTable(doc, {
      startY: startY + 5,
      head: [["Rank", "Collector", "Requests"]],
      body: collectorBody,
      theme: "grid",
      styles: TABLE_BODY,
      headStyles: TABLE_HEAD,
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 118 },
        2: { cellWidth: 46 },
      },
    });

    /** Categories: all ranked rows (#1 dispose, #2 recycle, …). */
    startY = nextSectionStart(doc, margin);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Categories ranked (action mix)", margin, startY);

    const catBody =
      categorySorted.length > 0
        ? categorySorted.map((r, i) => {
            const c = Number(r?.count) || 0;
            const p = Number(r?.percentage);
            const share = Number.isFinite(p) ? `${p.toFixed(1)}%` : "0%";
            return [
              String(i + 1),
              formatCategoryLabel(r?.name),
              String(c),
              share,
            ];
          })
        : [["—", "—", "0", "0%"]];

    autoTable(doc, {
      startY: startY + 5,
      head: [["Rank", "Category", "Count", "Share"]],
      body: catBody,
      theme: "grid",
      styles: TABLE_BODY,
      headStyles: TABLE_HEAD,
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 72 },
        2: { cellWidth: 28 },
        3: { cellWidth: 64 },
      },
    });

    const tableEnd =
      typeof doc.lastAutoTable?.finalY === "number" ? doc.lastAutoTable.finalY + 10 : startY + 40;
    doc.setFont("helvetica", "normal");
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
