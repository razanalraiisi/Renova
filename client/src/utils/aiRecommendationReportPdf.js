import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";
import { summarizeAIRecommendationRows, recommendationDistributionForChart } from "./aiRecommendationReportStats.js";

const BRAND = [0, 128, 170];

function formatRowDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

/**
 * @param {object} opts
 * @param {string} opts.subtitle
 * @param {Array<object>} opts.rows
 * @param {string} opts.fileBase
 */
export async function downloadAIRecommendationReportPdf({ subtitle = "", rows, fileBase }) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) {
    window.alert("No rows to export. Adjust filters or load data first.");
    return false;
  }

  try {
    const stats = summarizeAIRecommendationRows(list);
    const dist = recommendationDistributionForChart(stats);

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageWidth, 32, "F");

    try {
      const img = new Image();
      img.src = logo;
      await new Promise((resolve) => {
        img.onload = () => {
          try {
            doc.addImage(img, "PNG", 12, 6, 11, 11);
          } catch {
            /* ignore */
          }
          resolve();
        };
        img.onerror = () => resolve();
      });
    } catch {
      /* ignore */
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("Admin — Decide For Me History", 26, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 26, 22);

    doc.setTextColor(0, 0, 0);
    y = 40;

    doc.setFontSize(11);
    doc.text(`Total AI uses: ${stats.total}`, 14, y);
    y += 6;
    doc.text(`Follow rate: ${stats.followRatePercent}%`, 14, y);
    y += 6;
    doc.text(`Most suggested: ${stats.mostSuggested}`, 14, y);
    y += 8;

    if (subtitle) {
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(subtitle, 14, y);
      y += 8;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Recommendation distribution", 14, y);
    y += 5;
    dist.labels.forEach((label, i) => {
      doc.setFontSize(9);
      doc.text(`  ${label}: ${dist.data[i]}`, 14, y);
      y += 5;
    });
    y += 4;

    const tableBody = list.map((r) => [
      r.itemName || "—",
      r.aiRecommendation || "—",
      r.userFinalChoice || "—",
      r.wasRecommendationFollowed === true
        ? "Yes"
        : r.wasRecommendationFollowed === false
          ? "No"
          : "Pending",
      r.userName || "—",
      formatRowDate(r.createdAt),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Item", "AI rec.", "User choice", "Followed", "User", "Date"]],
      body: tableBody,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BRAND, textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 },
    });

    doc.save(`${fileBase}-${new Date().toISOString().slice(0, 10)}.pdf`);
    return true;
  } catch (err) {
    console.error("downloadAIRecommendationReportPdf:", err);
    return false;
  }
}
