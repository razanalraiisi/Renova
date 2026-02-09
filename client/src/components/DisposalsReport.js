import React from "react";
import AdminReportsLayout from "./AdminReportsLayout";

export default function DisposalsReport() {
  const data = [
    { item: "Dish washer", date: "17/12/2024", user: "Faisal Al Wahabi" },
    { item: "Air Conditioner", date: "29/01/2024", user: "Amal Al Abri" },
    { item: "Laptop", date: "17/07/2025", user: "Sulaiman Al Salmi" },
  ];

  return (
    <AdminReportsLayout title="Disposals">
      {data.map((d, i) => (
        <div className="reportCard" key={i}>
          <div><strong>Item Name:</strong> {d.item}</div>
          <div className="muted">Date: {d.date}</div>
          <div className="muted">Disposed By: {d.user}</div>
          <div className="link">More information</div>
        </div>
      ))}
    </AdminReportsLayout>
  );
}
