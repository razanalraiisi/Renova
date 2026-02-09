import React from "react";
import { useNavigate } from "react-router-dom";
import AdminTopbar from "./AdminTopbar";
import "./AdminPages.css";
import AdminFooter from "./AdminFooter";


export default function AdminShell({
  children,
  showBack = true,
  backTo, // optional: "/admin/dashboard" etc
  title,  // optional: small page title inside panel
  rightAction, // optional: button or component on the right of the title row
}) {
  const navigate = useNavigate();

  const goBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <div className="adminPage">
      <AdminTopbar />

      <div className="adminBody">
        <div className="adminCardWrap">
          {(showBack || title || rightAction) && (
            <div className="adminPageHeaderRow">
              <div className="adminPageHeaderLeft">
                {showBack && (
                  <button className="backBtn" type="button" onClick={goBack}>
                    ← Back
                  </button>
                )}
                {title && <div className="adminInnerTitle">{title}</div>}
              </div>

              <div className="adminPageHeaderRight">{rightAction}</div>
            </div>
          )}

          {children}
        </div>
      </div>

          <AdminFooter />

    </div>
  );
}
