import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./DashboardLayout.css";

/**
 * DashboardLayout wraps child content with nav and sidebar.
 * @param {JSX.Element} children - Main page content
 * @param {object} rest - All props needed by Navbar/Sidebar
 */
function DashboardLayout({ sidebarFilters, activeFilter, onFilterChange, user, onLogout, children }) {
  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <Sidebar
        filters={sidebarFilters}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
