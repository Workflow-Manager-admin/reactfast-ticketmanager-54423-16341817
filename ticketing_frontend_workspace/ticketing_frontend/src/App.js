import React, { useState } from "react";
import "./App.css";
import DashboardLayout from "./layout/DashboardLayout";
import AuthPage from "./pages/AuthPage";
import TicketListPage from "./pages/TicketListPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import TicketCreatePage from "./pages/TicketCreatePage";

// For API requests in the future, use:
//   import { API_BASE_URL } from "./api";
// All ticketing backend fetches should use API_BASE_URL as root.

// Note: In a full app, React Router would be used, but for the template, do explicit rendering by state

import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  removeToken,
} from "./api";
import { getTickets as apiGetTickets, createTicket as apiCreateTicket, updateTicket as apiUpdateTicket, deleteTicket as apiDeleteTicket } from "./api";

function App() {
  // App State
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [authError, setAuthError] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // FILTERS
  const STATUS_FILTERS = ["All", "open", "in_progress", "closed"];

  // --- Initial Auth Check (on mount) ---
  React.useEffect(() => {
    async function checkAuth() {
      setLoadingUser(true);
      try {
        const me = await getMe();
        setUser(me);
        setAuthError("");
      } catch (err) {
        setUser(null);
      }
      setLoadingUser(false);
    }
    checkAuth();
  }, []);

  // --- Load tickets when authenticated ---
  React.useEffect(() => {
    if (!user) {
      setTickets([]);
      return;
    }
    setLoadingTickets(true);
    apiGetTickets()
      .then(data => {
        setTickets(Array.isArray(data) ? data : []);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false));
  }, [user]);

  // Authentication (backend)
  async function handleAuthenticate(username, password, isLogin) {
    setAuthError("");
    setLoadingUser(true);
    try {
      if (isLogin) {
        await apiLogin(username, password);
        // Now fetch user
        const me = await getMe();
        setUser(me);
        setAuthError("");
      } else {
        // Registration - use demo email for this template (no field for email in AuthPage)
        let email = username.includes("@") ? username : `${username}@user.local`;
        await apiRegister(username, email, password);
        // Immediately log in user after registration
        await apiLogin(username, password);
        const me = await getMe();
        setUser(me);
        setAuthError("");
      }
    } catch (err) {
      setUser(null);
      setAuthError(err?.message || "Authentication failed");
      removeToken();
    }
    setLoadingUser(false);
  }

  // Logout
  function handleLogout() {
    removeToken();
    setUser(null);
    setSelectedTicketId(null);
    setCreating(false);
    setAuthError("");
  }

  // TICKET selection handlers
  function handleSelectTicket(ticketId) {
    setSelectedTicketId(ticketId);
    setCreating(false);
  }
  function handleBackToList() {
    setSelectedTicketId(null);
    setCreating(false);
  }
  function handleNewTicket() {
    setCreating(true);
    setSelectedTicketId(null);
  }

  // CRUD - backend powered
  async function handleCreateTicket(ticket) {
    try {
      const newTicket = await apiCreateTicket(ticket);
      setTickets(prev => [...prev, newTicket]);
      setCreating(false);
      setSelectedTicketId(newTicket.id);
    } catch (err) {
      alert(err?.message || "Failed to create ticket");
    }
  }

  async function handleSaveTicket(updated) {
    try {
      const saved = await apiUpdateTicket(updated);
      setTickets(prev => prev.map(t => t.id === saved.id ? saved : t));
      setSelectedTicketId(saved.id);
      setCreating(false);
    } catch (err) {
      alert(err?.message || "Failed to update ticket");
    }
  }

  async function handleDeleteTicket(id) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await apiDeleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
      setSelectedTicketId(null);
      setCreating(false);
    } catch (err) {
      alert(err?.message || "Failed to delete ticket");
    }
  }

  // FILTER tickets for display
  const visibleTickets =
    activeFilter === "All"
      ? tickets
      : tickets.filter(t => t.status === activeFilter);

  // RENDER
  if (loadingUser) {
    return <div style={{ padding: 60 }}>Loading user...</div>;
  }
  if (!user) {
    return (
      <AuthPage
        onAuthenticate={handleAuthenticate}
        errorMessage={authError}
      />
    );
  }

  return (
    <DashboardLayout
      sidebarFilters={STATUS_FILTERS}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      user={user}
      onLogout={handleLogout}
    >
      <div style={{ padding: "17px 0" }}>
        {loadingTickets ? (
          <div style={{ padding: 25 }}>Loading tickets...</div>
        ) : creating ? (
          <TicketCreatePage
            onCreate={handleCreateTicket}
            onCancel={handleBackToList}
          />
        ) : selectedTicketId ? (
          <TicketDetailPage
            ticket={tickets.find(t => t.id === selectedTicketId)}
            editing={true}
            onSave={handleSaveTicket}
            onDelete={handleDeleteTicket}
            onCancel={handleBackToList}
          />
        ) : (
          <>
            <button
              className="btn primary"
              style={{ marginBottom: 18, marginLeft: 10 }}
              onClick={handleNewTicket}
            >
              + New Ticket
            </button>
            <TicketListPage
              tickets={visibleTickets}
              onSelect={handleSelectTicket}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default App;