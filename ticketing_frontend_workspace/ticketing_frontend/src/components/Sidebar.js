import React from "react";
import "./Sidebar.css";
import theme from "../theme";

// PUBLIC_INTERFACE
/**
 * Sidebar navigation to filter tickets by status/type.
 * @param {string[]} filters - Array of filter names (strings)
 * @param {string} activeFilter - Currently selected filter
 * @param {(f: string) => void} onFilterChange - Handler when filter is changed
 */
function Sidebar({ filters, activeFilter, onFilterChange }) {
  return (
    <aside className="sidebar-root">
      <div className="sidebar-title">Filter by Status</div>
      <ul className="sidebar-list">
        {filters.map(filter =>
          <li
            key={filter}
            className={`sidebar-item${activeFilter === filter ? " active" : ""}`}
            onClick={() => onFilterChange(filter)}
            style={activeFilter === filter
                ? {background: theme.colors.accent, color: "#fff"}
                : {}}
          >
            {filter}
          </li>
        )}
      </ul>
    </aside>
  );
}

export default Sidebar;
