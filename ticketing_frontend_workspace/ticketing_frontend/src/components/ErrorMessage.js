import React from "react";

// PUBLIC_INTERFACE
/**
 * ErrorMessage - stylized async error message with optional retry
 * @param {object} props
 * @param {string} props.message - The error string
 * @param {function} [props.onRetry] - Optional retry handler
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message-root" style={{
      background: "#fffbe8",
      border: "1px solid #ffe1c9",
      borderRadius: 7,
      color: "#b34b32",
      padding: "14px 18px",
      margin: "20px 0",
      textAlign: "center",
      fontWeight: 500,
      fontSize: "1.05rem"
    }}>
      <div style={{ marginBottom: onRetry ? 10 : 0 }}>
        {message}
      </div>
      {onRetry &&
        <button
          type="button"
          className="btn"
          style={{
            marginTop: 5,
            background: "#ff9800",
            color: "#fff",
            border: "none"
          }}
          onClick={onRetry}
        >
          Retry
        </button>
      }
    </div>
  );
}

export default ErrorMessage;
