import React from "react";
import theme from "../theme";
import "./Navbar.css";

// PUBLIC_INTERFACE
/**
 * App-wide navigation bar at the top of the dashboard.
 * Contains logo, title, and right-side user/profile actions.
 */
function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar-root" style={{ background: theme.colors.primary }}>
      <div className="navbar-left">
        <span className="navbar-logo" style={{ color: theme.colors.accent }}>
          <b>&#9733;</b>
        </span>
        <span className="navbar-title" style={{ color: "#fff" }}>Ticket Manager</span>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-username">{user.username}</span>
            <button className="navbar-btn" onClick={onLogout}>Logout</button>
          </>
        ) : null}
      </div>
    </nav>
  );
}

export default Navbar;
