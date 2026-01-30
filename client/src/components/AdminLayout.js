import React from "react";
import { Container } from "reactstrap";
import AdminTopbar from "./AdminTopbar";

const AdminLayout = ({ children }) => {
  return (
    <div style={{ minHeight: "100vh", background: "#f2f3f5" }}>
      <AdminTopbar />
      <Container fluid style={{ padding: "18px 18px 40px" }}>
        {children}
      </Container>
    </div>
  );
};

export default AdminLayout;
