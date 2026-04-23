// Use localhost for local development, and the Render URL for the hosted live site
const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '') 
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
    cache: 'no-store',
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

// --- Global Toast Notification System ---
// Override native window.alert to automatically convert all alerts in the app to on-screen toast messages
window.alert = function(message) {
    showToast(message);
};

window.showToast = function(message, type = 'info') {
    // Check if a toast container exists, if not create one
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }

    // Determine colors based on type (success, error, info) or keyword matching
    let bgColor = 'var(--glass-bg, rgba(15, 23, 42, 0.95))';
    let borderLeftColor = 'var(--primary-color, #38bdf8)';
    let textColor = 'var(--text-main, #ffffff)';
    
    let lowerMsg = "";
    if (typeof message === 'string') {
        lowerMsg = message.toLowerCase();
    }
    
    if (lowerMsg.includes('failed') || lowerMsg.includes('error') || lowerMsg.includes('expired') || lowerMsg.includes('not found') || type === 'error') {
        borderLeftColor = 'var(--danger-color, #ef4444)';
    } else if (lowerMsg.includes('success') || lowerMsg.includes('confirmed') || lowerMsg.includes('added') || lowerMsg.includes('created') || type === 'success') {
        borderLeftColor = 'var(--success-color, #22c55e)';
    }

    // Create the toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${bgColor};
        color: ${textColor};
        padding: 16px 20px;
        border-radius: 8px;
        border-left: 5px solid ${borderLeftColor};
        border-top: 1px solid rgba(255,255,255,0.1);
        border-right: 1px solid rgba(255,255,255,0.1);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(12px);
        font-family: inherit;
        font-size: 0.95rem;
        min-width: 280px;
        max-width: 400px;
        opacity: 0;
        transform: translateX(120%);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    `;

    toast.innerHTML = `
        <span style="line-height: 1.4; word-break: break-word;">${message}</span>
        <button style="background: none; border: none; color: ${textColor}; cursor: pointer; opacity: 0.6; font-size: 1.4rem; padding: 0; line-height: 1; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">&times;</button>
    `;

    // Add close functionality
    const closeBtn = toast.querySelector('button');
    closeBtn.onclick = () => removeToast(toast);

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
};

window.removeToast = function(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 400);
};
