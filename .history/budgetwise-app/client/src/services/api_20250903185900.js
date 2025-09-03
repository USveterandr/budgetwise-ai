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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Create a singleton instance
const api = new ApiService();

export default api;