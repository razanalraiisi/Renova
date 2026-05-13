import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

const BRAND = [0, 128, 170];

/**
 * @param {{ title?: string, rows: object[], fileBase?: string }} opts
 * @returns {Promise<boolean>}
 */
export async function downloadAdminUsersReportPdf({ title = "Users report", rows, fileBase = "users-report" }) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) {
    window.alert("No users to export.");
    return false;
  }
  try {
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
    doc.text(`Users in this export: ${list.length}`, 14, y);
    y += 10;

    const body = list.map((u) => [
      String(u.uname ?? "").slice(0, 40),
      String(u.email ?? "").slice(0, 44),
      String(u.phone ?? ""),
      String(u.userId ?? ""),
      u.createdAt ? new Date(u.createdAt).toLocaleString() : "—",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Name", "Email", "Phone", "User ID", "Created"]],
      body,
      margin: { left: 12, right: 12 },
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
      headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    doc.save(`${fileBase}-${stamp}.pdf`);
    return true;
  } catch (e) {
    console.error("downloadAdminUsersReportPdf", e);
    return false;
  }
}
