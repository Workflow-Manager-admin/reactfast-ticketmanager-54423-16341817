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

// --- Dummy placeholders for demo; integration with backend comes later ---
const DUMMY_USER = { username: "alice" };
const DUMMY_TICKETS = [
  { id: 1, title: "Login broken", description: "I can't login", status: "open", owner: "alice", created_at: "2024-06-12" },
  { id: 2, title: "Feature request", description: "Add dark mode", status: "in_progress", owner: "bob", created_at: "2024-06-11" },
  { id: 3, title: "Crash on save", description: "App crashes", status: "closed", owner: "carol", created_at: "2024-06-10" }
];

function App() {
  // App State
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState(DUMMY_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [authError, setAuthError] = useState("");

  // FILTERS
  const STATUS_FILTERS = ["All", "open", "in_progress", "closed"];

  // Authentication - placeholder logic
  function handleAuthenticate(username, password, isLogin) {
    // TODO: Integrate with backend. For now, always "succeed" if username provided.
    if (username && password) {
      setUser({ username });
      setAuthError("");
    } else {
      setAuthError("Invalid credentials");
    }
  }

  function handleLogout() {
    setUser(null);
    setSelectedTicketId(null);
    setCreating(false);
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

  // CRUD
  function handleCreateTicket(ticket) {
    // In real app, POST to backend.
    const nextId = Math.max(...tickets.map(t => t.id)) + 1;
    setTickets([
      ...tickets,
      { ...ticket, id: nextId, owner: user.username, created_at: new Date().toISOString().slice(0, 10) }
    ]);
    setCreating(false);
    setSelectedTicketId(nextId);
  }
  function handleSaveTicket(updated) {
    setTickets(tickets.map(t => t.id === updated.id ? { ...updated } : t));
    setSelectedTicketId(updated.id);
    setCreating(false);
  }
  function handleDeleteTicket(id) {
    setTickets(tickets.filter(t => t.id !== id));
    setSelectedTicketId(null);
    setCreating(false);
  }

  // FILTER tickets for display
  const visibleTickets =
    activeFilter === "All"
      ? tickets
      : tickets.filter(t => t.status === activeFilter);

  // RENDER
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
        {/* Conditional Rendering for Page Content */}
        {creating ? (
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