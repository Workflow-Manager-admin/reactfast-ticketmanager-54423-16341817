import React from "react";

// PUBLIC_INTERFACE
/**
 * Spinner - displays a simple animated loading indicator
 * @param {object} props - Optional style/class
 */
function Spinner({ style, className }) {
  return (
    <div className={`spinner-root${className ? " " + className : ""}`} style={{ textAlign: "center", padding: 20, ...style }}>
      <div className="spinner-icon" />
      <span className="spinner-label" style={{ display: "block", marginTop: 12, color: "#888" }}>
        Loading...
      </span>
    </div>
  );
}

export default Spinner;
