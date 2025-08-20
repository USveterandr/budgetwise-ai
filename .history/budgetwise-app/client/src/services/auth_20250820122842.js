import api from './api';

class AuthService {
  static async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  static async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  static async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  static async resetPassword(token, password) {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  static async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.user;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user data');
    }
  }

  static isAuthenticated() {
    return !!localStorage.getItem('userToken');
  }

  static getToken() {
    return localStorage.getItem('userToken');
  }
}

export default AuthService;