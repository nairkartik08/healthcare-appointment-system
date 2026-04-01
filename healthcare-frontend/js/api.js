const BASE_URL = "http://localhost:8080";

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
    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      if (endpoint !== "/auth/login" && endpoint !== "/auth/register") {
        window.location.href = "login.html";
      }
      throw new Error("Unauthorized - Session expired or Invalid Credentials");
    }
    const errorText = await response.text();
    throw new Error(errorText || `API Error: ${response.status}`);
  }

  // Allow parsing text or json
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    return response.text();
  }
}
