import React from "react";
import "./TicketListPage.css";

/**
 * TicketListPage - shows ticket table and lets user select/view tickets.
 * @param {object[]} tickets - List of ticket objects
 * @param {function} onSelect - function(ticketId) called when a ticket is clicked
 */
function TicketListPage({ tickets, onSelect }) {
  return (
    <div className="ticket-list-root">
      <h2 className="ticket-list-title">Tickets</h2>
      {tickets.length === 0 ?
        <div className="empty-message">No tickets match your filter.</div>
        : (
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
                  onClick={() => onSelect(ticket.id)}
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
