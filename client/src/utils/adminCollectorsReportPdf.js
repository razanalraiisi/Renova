import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

const BRAND = [0, 128, 170];

function isDeactivated(c) {
  return Boolean(c?.deactivatedAt);
}

/**
 * @param {{ title?: string, rows: object[], fileBase?: string }} opts
 * @returns {Promise<boolean>}
 */
export async function downloadAdminCollectorsReportPdf({
  title = "Collectors",
  rows,
  fileBase = "collectors-report",
}) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) {
    window.alert("No collectors to export.");
    return false;
  }
  try {
    let active = 0;
    let deactivated = 0;
    let sumAccepted = 0;
    let sumCompleted = 0;
    for (const c of list) {
      if (isDeactivated(c)) deactivated += 1;
      else active += 1;
      sumAccepted += Number(c?.requestsAccepted) || 0;
      sumCompleted += Number(c?.requestsCompleted) || 0;
    }

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
    doc.text(`Admin — ${title}`, 26, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 26, 22);
    doc.setTextColor(0, 0, 0);
    y = 40;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND);
    doc.text("Summary", 14, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const lines = [
      [`Collectors in export:`, String(list.length)],
      [`Active:`, String(active)],
      [`Deactivated:`, String(deactivated)],
      [`Total requests accepted (sum):`, String(sumAccepted)],
      [`Total requests completed (sum):`, String(sumCompleted)],
    ];
    for (const [a, b] of lines) {
      doc.setFont("helvetica", "bold");
      doc.text(a, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(b, 72, y);
      y += 5.5;
    }
    y += 6;

    const body = list.map((c) => [
      String(c.companyName ?? "").slice(0, 36),
      isDeactivated(c) ? "Deactivated" : "Active",
      String(c.email ?? "").slice(0, 36),
      String(c.phone ?? ""),
      String(c.collectorId ?? ""),
      String(c.collectorType ?? ""),
      String(Number(c.requestsAccepted) || 0),
      String(Number(c.requestsCompleted) || 0),
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Company", "Status", "Email", "Phone", "Collector ID", "Type", "Accepted", "Completed", "Joined"]],
      body,
      margin: { left: 12, right: 12 },
      styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
      headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    doc.save(`${fileBase}-${stamp}.pdf`);
    return true;
  } catch (e) {
    console.error("downloadAdminCollectorsReportPdf", e);
    return false;
  }
}
