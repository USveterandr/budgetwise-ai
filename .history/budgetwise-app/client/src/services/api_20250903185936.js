// api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Helper function to get a cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Fetch CSRF token on initial service creation if we're on the client side
    if (typeof document !== 'undefined' && !document.cookie.includes('XSRF-TOKEN')) {
      this.getCsrfToken().catch(console.error);
    }
  }

  // Method to explicitly fetch and store the CSRF token (optional, but good for initial load)
  async getCsrfToken() {
    try {
      const tokenEndpoint = `${this.baseURL}/csrf-token`;
      const response = await fetch(tokenEndpoint, { credentials: 'include' });
      if (response.ok) {
        const { csrfToken } = await response.json();
        // Set the token in a cookie if not already there, or Helmet will handle it.
        // This part is illustrative; Helmet sets the cookie on its own routes.
        // Client just needs to ensure the cookie is sent.
        // If Helmet sets XSRF-TOKEN, it will be available via getCookie('XSRF-TOKEN')
        // after a request to a protected route or /csrf-token.
        console.log("CSRF token fetched:", csrfToken);
        // You might want to store it in memory or state if needed,
        // but relying on the cookie (sent by fetch with credentials: 'include')
        // and the X-XSRF-TOKEN header is the standard pattern.
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important: Send cookies for CSRF
      ...options,
    };

    // Add CSRF token for state-changing methods
    // Helmet's CSRF middleware expects the X-XSRF-TOKEN header
    // to match the XSRF-TOKEN cookie.
    const method = options.method?.toUpperCase() || 'GET';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = getCookie('XSRF-TOKEN');
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      } else {
        // Optionally, log a warning if CSRF token is not found for a state-changing request.
        console.warn('CSRF token (XSRF-TOKEN cookie) not found for request to:', url);
        // Consider fetching the token and retrying, or failing the request.
        // For now, we'll let it proceed; Helmet might reject it.
      }
    }

    // Add auth token if available
    const userToken = localStorage.getItem('userToken'); // Changed variable name to avoid conflict
