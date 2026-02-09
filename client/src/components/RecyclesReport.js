import React from "react";
import AdminReportsLayout from "./AdminReportsLayout";

export default function RecyclesReport() {
  const data = [
    { item: "Dish washer", date: "17/12/2024", user: "Faisal Al Wahabi" },
    { item: "Air Conditioner", date: "29/01/2024", user: "Amal Al Abri" },
    { item: "Laptop", date: "17/07/2025", user: "Sulaiman Al Salmi" },
  ];

  return (
    <AdminReportsLayout title="Recycles">
      {data.map((r, i) => (
        <div className="reportCard" key={i}>
          <div><strong>Item Name:</strong> {r.item}</div>
          <div className="muted">Date: {r.date}</div>
          <div className="muted">Disposed By: {r.user}</div>
          <div className="link">More information</div>
        </div>
      ))}
    </AdminReportsLayout>
  );
}
