// Mock auth functions for testing frontend components
export const isAuthenticated = jest.fn(() => false);
export const getCurrentUser = jest.fn(() => null);
export const signup = jest.fn();
export const login = jest.fn();
export const isValidPassword = jest.fn((password) => {
  // Simple validation for testing
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
});
export const requestPasswordReset = jest.fn();
export const verifyPasswordResetToken = jest.fn();
export const resetPassword = jest.fn();
export const confirmEmail = jest.fn();
export const isAdmin = jest.fn(() => false);
export const hasPlanAccess = jest.fn(() => false);
export const logout = jest.fn();