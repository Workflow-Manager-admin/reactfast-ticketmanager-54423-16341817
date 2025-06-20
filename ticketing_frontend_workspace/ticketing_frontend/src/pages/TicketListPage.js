import React, { useEffect, useState } from "react";
import "./TicketListPage.css";
import { getTickets } from "../api";

/**
 * TicketListPage - shows ticket table, loads tickets async, supports refresh/error/loading UX.
 * @param {function} onSelect - function(ticketId) called when a ticket is clicked
 */
function TicketListPage({ onSelect }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Load tickets (initial and refresh)
  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to fetch tickets.");
      setTickets([]);
    }
    setLoading(false);
  };

  // Manual refresh handler (optional)
  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const data = await getTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to refresh ticket list.");
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="ticket-list-root">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2 className="ticket-list-title" style={{ marginBottom: 0 }}>Tickets</h2>
        <button
          type="button"
          className="btn"
          style={{ marginLeft: 10, padding: "6px 18px" }}
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {loading ? (
        <div style={{ padding: 18 }}>Loading tickets...</div>
      ) : error ? (
        <div className="empty-message" style={{ color: "#d32f2f", fontWeight: 500 }}>
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-message">No tickets found.</div>
      ) : (
        <table className="ticket-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr
                key={ticket.id}
                className="ticket-row"
                onClick={() => onSelect && onSelect(ticket.id)}
              >
                <td>{ticket.id}</td>
                <td>{ticket.title}</td>
                <td><span className={`status-badge status-${ticket.status}`}>{ticket.status}</span></td>
                <td>{ticket.created_at ? ticket.created_at.slice(0, 10) : ""}</td>
                <td>{ticket.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TicketListPage;
