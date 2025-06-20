//
// Centralized API utility for all backend requests (CRUD, auth, etc.)
//

export const API_BASE_URL = "https://vscode-internal-7052-dev.dev01.cloud.kavia.ai:3001";

// ---- TOKEN HELPERS ----
export function setToken(token) {
  localStorage.setItem("auth_token", token);
}
export function getToken() {
  return localStorage.getItem("auth_token");
}
export function removeToken() {
  localStorage.removeItem("auth_token");
}

// ---- AUTH ----
// PUBLIC_INTERFACE
/**
 * Login via backend (returns and stores access_token on success).
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>} access_token
 * Throws on failure.
 */
export async function login(username, password) {
  const resp = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      username,
      password,
      grant_type: "password"
    })
  });
  if (!resp.ok) {
    throw new Error("Invalid username or password");
  }
  const data = await resp.json();
  // FastAPI typically returns access_token
  if (!data.access_token) throw new Error("No token returned");
  setToken(data.access_token);
  return data.access_token;
}

/**
 * Register a new user via backend.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} user
 * Throws on failure.
 */
export async function register(username, email, password) {
  const resp = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return await resp.json();
}

/**
 * Fetch current user (requires token).
 * @returns {Promise<object>} user
 */
export async function getMe() {
  const token = getToken();
  if (!token) throw new Error("No token");
  const resp = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: "Bearer " + token
    }
  });
  if (!resp.ok) throw new Error("Failed to get user");
  return await resp.json();
}

/**
 * List users (may not require auth).
 */
export async function getUsers() {
  const resp = await fetch(`${API_BASE_URL}/users/`);
  if (!resp.ok) throw new Error("Failed to fetch user list");
  return await resp.json();
}

// ---- TICKETS ----

/**
 * List tickets (for current user).
 * @returns {Promise<array>} tickets array
 */
export async function getTickets() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const resp = await fetch(`${API_BASE_URL}/tickets/`, {
    headers: {
      Authorization: "Bearer " + token
    }
  });
  if (!resp.ok) throw new Error("Failed to fetch tickets");
  return await resp.json();
}

/**
 * Get a single ticket by ID.
 * @param {number} id
 * @returns {Promise<object>} ticket
 */
export async function getTicket(id) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const resp = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    headers: {
      Authorization: "Bearer " + token
    }
  });
  if (!resp.ok) throw new Error("Ticket not found");
  return await resp.json();
}

/**
 * Create a ticket.
 * @param {{title: string, description: string, status: string}} ticket
 * @returns {Promise<object>} new ticket
 */
export async function createTicket(ticket) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const resp = await fetch(`${API_BASE_URL}/tickets/`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: ticket.title,
      description: ticket.description
      // status is ignored on create (API sets it to "open")
    })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create ticket");
  }
  return await resp.json();
}

/**
 * Update a ticket by id.
 * @param {object} ticket - must include id, title, description, status
 * @returns {Promise<object>} updated ticket
 */
export async function updateTicket(ticket) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const resp = await fetch(`${API_BASE_URL}/tickets/${ticket.id}`, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status
    })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update ticket");
  }
  return await resp.json();
}

/**
 * Delete a ticket by id.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteTicket(id) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const resp = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  });
  if (!resp.ok) throw new Error("Failed to delete ticket");
}
