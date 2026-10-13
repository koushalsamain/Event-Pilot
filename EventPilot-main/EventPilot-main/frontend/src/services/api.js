/**
 * REST API Client for EventPilot (Command Nexus)
 * Handles all JSON requests and responses between React and Flask.
 */

let activeBaseUrl = "/api";

async function fetchWithFallback(endpoint, config) {
  // Candidate URLs in priority order
  const host = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
  const candidates = [
    activeBaseUrl,
    "/api",
    `http://${host}:5000/api`,
    "http://127.0.0.1:5000/api",
  ];

  // Remove duplicates
  const uniqueUrls = [...new Set(candidates.map((base) => `${base}${endpoint}`))];

  let lastError = null;
  for (const url of uniqueUrls) {
    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }

      // Remember working base url
      const matchedBase = candidates.find((b) => url.startsWith(b));
      if (matchedBase) activeBaseUrl = matchedBase;

      return data;
    } catch (err) {
      lastError = err;
      // Try next candidate
    }
  }

  throw lastError || new Error("Failed to reach REST API server");
}

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  };

  return fetchWithFallback(endpoint, config);
}

export const api = {
  // System Health
  checkHealth: () => request("/health"),

  // Events
  getEvents: () => request("/events"),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (eventData) =>
    request("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),
  updateEvent: (id, eventData) =>
    request(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(eventData),
    }),

  // Dashboard & Live Control Board
  getDashboard: (eventId) => request(`/events/${eventId}/dashboard`),

  // Tasks & Action Queue
  getTasks: (eventId) => request(`/events/${eventId}/tasks`),
  createTask: (eventId, taskData) =>
    request(`/events/${eventId}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    }),
  updateTask: (taskId, taskData) =>
    request(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(taskData),
    }),
  deleteTask: (taskId) =>
    request(`/tasks/${taskId}`, {
      method: "DELETE",
    }),

  // Gap Detection & Priority Recommendation Engine
  getRisks: (eventId) => request(`/events/${eventId}/risks`),
  getRecommendations: (eventId) => request(`/events/${eventId}/recommendations`),
  applyRecommendation: (eventId, actionTask) =>
    request(`/events/${eventId}/recommendations/apply`, {
      method: "POST",
      body: JSON.stringify({ action_task: actionTask }),
    }),
  simulateGap: (eventId, gapType) =>
    request(`/events/${eventId}/simulate-gap`, {
      method: "POST",
      body: JSON.stringify({ gap_type: gapType }),
    }),

  // Reset demo database
  resetDatabase: () =>
    request("/reset", {
      method: "POST",
    }),

  // Notifications (Automatic Smart Alerts + Custom Personal Alerts)
  getNotifications: (eventId) => request(`/events/${eventId}/notifications`),
  createNotification: (eventId, alertData) =>
    request(`/events/${eventId}/notifications`, {
      method: "POST",
      body: JSON.stringify(alertData),
    }),
  updateNotification: (notifId, statusData) =>
    request(`/notifications/${notifId}`, {
      method: "PATCH",
      body: JSON.stringify(statusData),
    }),
  clearNotifications: (eventId) =>
    request(`/events/${eventId}/notifications/clear`, {
      method: "POST",
    }),

  // Team
  getTeam: () => request("/team"),
};

export default api;
