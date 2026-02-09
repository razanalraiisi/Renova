import React from "react";
import AdminReportsLayout from "./AdminReportsLayout";

export default function UsersReport() {
  const users = [
    {
      name: "Razan Al Raisi",
      email: "razanraisi@gmail.com",
      phone: "73599445",
    },
    {
      name: "Khulood Al Naimi",
      email: "khuloodnaimi@yahoo.com",
      phone: "77896553",
    },
    {
      name: "Maryam Al Maani",
      email: "maryam.almaani@gmail.com",
      phone: "95697126",
    },
  ];

  return (
    <AdminReportsLayout title="Users report">
      {users.map((u, i) => (
        <div className="reportCard" key={i}>
          <div className="expandRow">
            👤 <strong>{u.name}</strong>
          </div>
          <div className="muted">Email: {u.email}</div>
          <div className="muted">Phone Number: {u.phone}</div>
          <div className="link">More information</div>
        </div>
      ))}
    </AdminReportsLayout>
  );
}
