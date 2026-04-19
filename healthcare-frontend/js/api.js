// Use localhost for local development, and the Render URL for the hosted live site
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? "http://localhost:8080" 
    : "https://healthcare-appointment-system-7d21.onrender.com";

/**
 * Custom fetch wrapper to automatically inject Authorization header
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Fallback if not JSON
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch (err) { }
    }

    if (response.status === 401 || response.status === 403) {
      if (endpoint !== "/auth/login" && endpoint !== "/auth/register") {
        localStorage.clear();
        window.location.href = "login.html";
      }
    }
    throw new Error(errorMessage);
  }

  // Allow parsing text or json
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    return response.text();
  }
}
