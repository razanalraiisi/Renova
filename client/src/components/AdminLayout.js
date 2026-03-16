import React from "react";
import AdminTopbar from "./AdminTopbar";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout-root">
      <AdminTopbar />
      <main className="admin-layout-main">
        <div className="admin-layout-content">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
