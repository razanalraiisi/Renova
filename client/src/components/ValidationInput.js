import React from "react";

const ValidationInput = ({ label, error, children, showPasswordRules = false }) => {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div className="field-label fw-bold">{label}</div>

      <div className={`input-wrapper ${error ? "error-border" : ""}`}>
        {children}
        {error && <span className="error-icon">!</span>}
      </div>

      {error && <div className="error-text">{error}</div>}

      {showPasswordRules && error && (
        <div className="password-rules-box">
          <p><strong>Your password must contain:</strong></p>
          <ul>
            <li>At least <strong>one uppercase letter</strong></li>
            <li>At least <strong>one number</strong></li>
            <li>At least <strong>one symbol</strong> (!@#$ etc.)</li>
            <li>Minimum <strong>4 characters</strong></li>
            <li>Maximum <strong>10 characters</strong></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationInput;
