import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";
import logo from "../assets/logo.png";
import { summarizeAdminRequestRows, statusDistributionForChart } from "./adminRequestReportStats.js";

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
 * Collector-aligned admin PDF: teal header, logo, summary, status doughnut, data table.
 * @param {object} opts
 * @param {string} opts.title — e.g. "Recycles"
 * @param {string} [opts.subtitle]
 * @param {Array<object>} opts.rows — filtered admin request rows
 * @param {boolean} [opts.includeCategoryColumn]
 * @param {string} opts.fileBase — filename without extension
 * @returns {Promise<boolean>}
 */
export async function downloadAdminRequestsReportPdf({
  title,
  subtitle = "",
  rows,
  includeCategoryColumn = false,
  fileBase,
}) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) {
    window.alert("No rows to export. Adjust filters or load data first.");
    return false;
  }

  try {
    const stats = summarizeAdminRequestRows(list);
    const dist = statusDistributionForChart(stats);

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageWidth, 32, "F");

    try {
      const img = new Image();
      img.src = logo;
      await new Promise((resolve, reject) => {
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
      /* ignore logo */
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(`Admin — ${title}`, 26, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 26, 22);

    doc.setTextColor(0, 0, 0);
    y = 40;

    if (subtitle) {
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const subLines = doc.splitTextToSize(subtitle, pageWidth - 28);
      doc.text(subLines, 14, y);
      y += subLines.length * 4.5 + 4;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND);
    doc.text("Summary statistics", 14, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const summaryLines = [
      [`Total requests:`, String(stats.total)],
      [`Pending:`, String(stats.pending)],
      [`Accepted:`, String(stats.accepted)],
      [`Completed:`, String(stats.completed)],
      [`Rejected:`, String(stats.rejected)],
      [`Pickup:`, String(stats.pickup)],
      [`Drop-off:`, String(stats.dropoff)],
    ];
    for (const [a, b] of summaryLines) {
      doc.setFont("helvetica", "bold");
      doc.text(a, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(b, 52, y);
      y += 5;
    }
    y += 4;

    /** Status chart (same technique as collector request PDF). */
    let chartY = y;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 360;
      canvas.height = 220;
      canvas.style.display = "none";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");

      const chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: dist.labels,
          datasets: [
            {
              data: dist.data,
              backgroundColor: dist.colors,
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: { position: "bottom", labels: { font: { size: 10 }, boxWidth: 12 } },
          },
        },
      });

      await new Promise((r) => setTimeout(r, 400));
      const chartImage = canvas.toDataURL("image/png");
      chart.destroy();
      document.body.removeChild(canvas);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...BRAND);
      doc.text("Status distribution", 14, chartY);
      chartY += 6;
      doc.addImage(chartImage, "PNG", 40, chartY, 120, 62);
      chartY += 70;
    } catch {
      chartY += 4;
    }

    y = Math.max(y, chartY);

    if (y > 230) {
      doc.addPage();
      y = 16;
    }

    const head = includeCategoryColumn
      ? [["Device", "User", "Category", "Status", "Source", "Date"]]
      : [["Device", "User", "Status", "Source", "Date"]];

    const body = list.map((r) => {
      const src = String(r.source || "").toLowerCase() === "dropoff" ? "Drop-off" : "Pickup";
      if (includeCategoryColumn) {
        return [
          String(r.device ?? "").slice(0, 36),
          String(r.name ?? "").slice(0, 28),
          String(r.category ?? ""),
          String(r.status ?? ""),
          src,
          formatRowDate(r.createdAt),
        ];
      }
      return [
        String(r.device ?? "").slice(0, 42),
        String(r.name ?? "").slice(0, 36),
        String(r.status ?? ""),
        src,
        formatRowDate(r.createdAt),
      ];
    });

    autoTable(doc, {
      startY: y,
      head,
      body,
      margin: { left: 12, right: 12 },
      styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
      headStyles: {
        fillColor: BRAND,
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    doc.save(`${fileBase}-${stamp}.pdf`);
    return true;
  } catch (err) {
    console.error("downloadAdminRequestsReportPdf", err);
    return false;
  }
}
