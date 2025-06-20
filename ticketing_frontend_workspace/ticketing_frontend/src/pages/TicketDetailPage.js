import React, { useState } from "react";
import "./TicketDetailPage.css";

/**
 * TicketDetailPage - for displaying/updating a single ticket.
 * Props:
 *   - ticket: ticket object (may include id, title, description, status)
 *   - onSave: function(updatedTicket) for save/submit
 *   - onDelete: function(id) for delete
 *   - onCancel: function() to return/view list
 *   - editing: boolean, enables form inputs
 */
function TicketDetailPage({ ticket, onSave, onDelete, onCancel, editing }) {
  const [editTicket, setEditTicket] = useState(ticket);

  // Update local copy when ticket prop changes (for route changes)
  React.useEffect(() => setEditTicket(ticket), [ticket]);

  if (!ticket) return <div className="ticket-detail-root">Not found.</div>;

  const handleChange = e => {
    setEditTicket({ ...editTicket, [e.target.name]: e.target.value });
  };

  const handleSave = e => {
    e.preventDefault();
    onSave(editTicket);
  };

  return (
    <div className="ticket-detail-root">
      <h2 className="ticket-detail-title">{editing ? "Edit Ticket" : "Ticket Details"}</h2>
      <form className="ticket-detail-form" onSubmit={editing ? handleSave : e => e.preventDefault()}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={editTicket.title}
            onChange={handleChange}
            disabled={!editing}
          />
        </label>
        <label>
          Status:
          <select
            name="status"
            value={editTicket.status}
            onChange={handleChange}
            disabled={!editing}
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
            value={editTicket.description}
            onChange={handleChange}
            rows={4}
            disabled={!editing}
          />
        </label>
        <div className="ticket-detail-actions">
          {editing
            ? <>
                <button type="submit" className="btn primary">Save</button>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
              </>
            : <button type="button" className="btn primary" onClick={() => onCancel()}>Back</button>
          }
          {editing && !!ticket.id &&
            <button type="button" className="btn danger" onClick={() => onDelete(ticket.id)}>
              Delete
            </button>
          }
        </div>
      </form>
    </div>
  );
}

export default TicketDetailPage;
