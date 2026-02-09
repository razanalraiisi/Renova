import React from "react";
import AdminReportsLayout from "./AdminReportsLayout";

export default function CollectorsReport() {
  const collectors = [
    {
      name: "Oman Environmental Services Holding Company",
      address: "HCF5+XF9, Muscat",
      phone: "24228401",
    },
    {
      name: "Recycling Services LLC Misfa",
      address: "F7C9+9MW, Misfah As Safil",
      phone: "24489922",
    },
    {
      name: "Be’ah plastic recycling service",
      address: "Oman avenues, 2nd floor, Muscat",
      phone: "24556792",
    },
  ];

  return (
    <AdminReportsLayout title="Collectors Reports">
      {collectors.map((c, i) => (
        <div className="reportCard" key={i}>
          <div className="expandRow">
            » <strong>{c.name}</strong>
          </div>
          <div className="muted">Address: {c.address}</div>
          <div className="muted">Phone: {c.phone}</div>
        </div>
      ))}
    </AdminReportsLayout>
  );
}
