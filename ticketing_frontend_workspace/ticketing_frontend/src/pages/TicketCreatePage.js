import React, { useState } from "react";
import "./TicketDetailPage.css"; // reuse styles

/**
 * TicketCreatePage - form for creating a new ticket.
 * @param {function} onCreate - function(newTicket) called on submission
 * @param {function} onCancel - function() to cancel
 */
function TicketCreatePage({ onCreate, onCancel }) {
  const [ticket, setTicket] = useState({
    title: "",
    status: "open",
    description: "",
  });

  const handleChange = e =>
    setTicket({ ...ticket, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    onCreate(ticket);
  };

  return (
    <div className="ticket-detail-root">
      <h2 className="ticket-detail-title">Create Ticket</h2>
      <form className="ticket-detail-form" onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={ticket.title}
            onChange={handleChange}
            required
            minLength={3}
          />
        </label>
        <label>
          Status:
          <select
            name="status"
            value={ticket.status}
            onChange={handleChange}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={ticket.description}
            onChange={handleChange}
            rows={4}
          />
        </label>
        <div className="ticket-detail-actions">
          <button type="submit" className="btn primary">Create</button>
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default TicketCreatePage;
