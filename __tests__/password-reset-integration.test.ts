// Integration tests for password reset functionality
import { isValidPassword, requestPasswordReset, verifyPasswordResetToken, resetPassword } from '../src/lib/auth';

// Mock the fetch API for testing
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('Password Reset Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('MySecurePass1')).toBe(true);
      expect(isValidPassword('TestPassword123!')).toBe(true);
      expect(isValidPassword('ValidPass123@')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      // Too short
      expect(isValidPassword('Pass1')).toBe(false);
      
      // No uppercase
      expect(isValidPassword('password123')).toBe(false);
      
      // No lowercase
      expect(isValidPassword('PASSWORD123')).toBe(false);
      
      // No number
      expect(isValidPassword('Password')).toBe(false);
      
      // Too short with valid chars
      expect(isValidPassword('Pass1')).toBe(false);
      
      // Empty password
      expect(isValidPassword('')).toBe(false);
      
      // Only numbers
      expect(isValidPassword('12345678')).toBe(false);
      
      // Only uppercase letters
      expect(isValidPassword('PASSWORD')).toBe(false);
      
      // Only lowercase letters
      expect(isValidPassword('password')).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    it('should successfully request password reset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'If an account exists with that email, you will receive a password reset link shortly.'
        })
      });

      const result = await requestPasswordReset('test@example.com');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('If an account exists with that email, you will receive a password reset link shortly.');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://budgetwise-database-worker.isaactrinidadllc.workers.dev/auth/forgot-password',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' })
        })
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await requestPasswordReset('test@example.com');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please try again.');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'API error'
        })
      });

      const result = await requestPasswordReset('test@example.com');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });

    it('should handle API errors with no specific error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false
        })
      });

      const result = await requestPasswordReset('test@example.com');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to request password reset.');
    });

    it('should handle non-OK responses with success=false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Invalid request'
        })
      });

      const result = await requestPasswordReset('test@example.com');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request');
    });
  });

  describe('verifyPasswordResetToken', () => {
    it('should successfully verify a valid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Token is valid.'
        })
      });

      const result = await verifyPasswordResetToken('valid-token');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Token is valid.');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://budgetwise-database-worker.isaactrinidadllc.workers.dev/auth/reset-password/verify',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'valid-token' })
        })
      );
    });

    it('should handle invalid tokens', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Invalid or expired reset token.'
        })
      });

      const result = await verifyPasswordResetToken('invalid-token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or expired reset token.');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await verifyPasswordResetToken('test-token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please try again.');
    });

    it('should handle API errors with no specific error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false
        })
      });

      const result = await verifyPasswordResetToken('test-token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or expired reset token.');
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token and password', async () => {
      // First validate the password
      const isValid = isValidPassword('NewPassword123');
      expect(isValid).toBe(true);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Password reset successfully. You can now log in with your new password.'
        })
      });

      const result = await resetPassword('valid-token', 'NewPassword123');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset successfully. You can now log in with your new password.');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://budgetwise-database-worker.isaactrinidadllc.workers.dev/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'valid-token', newPassword: 'NewPassword123' })
        })
      );
    });

    it('should reject invalid passwords', async () => {
      const result = await resetPassword('valid-token', 'weak');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await resetPassword('test-token', 'NewPassword123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please try again.');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Invalid token'
        })
      });

      const result = await resetPassword('invalid-token', 'NewPassword123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });

    it('should handle API errors with no specific error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false
        })
      });

      const result = await resetPassword('test-token', 'NewPassword123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to reset password.');
    });

    it('should handle empty password', async () => {
      const result = await resetPassword('valid-token', '');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    });

    it('should handle password with only numbers', async () => {
      const result = await resetPassword('valid-token', '12345678');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    });

    it('should handle password with only lowercase letters', async () => {
      const result = await resetPassword('valid-token', 'password');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    });

    it('should handle password with only uppercase letters', async () => {
      const result = await resetPassword('valid-token', 'PASSWORD');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    });

    it('should handle password with correct length but missing uppercase', async () => {
      const result = await resetPassword('valid-token', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    });

    it('should handle password with correct length but missing lowercase', async () => {
      const result = await resetPassword('valid-token', 'PASSWORD123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    });

    it('should handle password with correct length but missing number', async () => {
      const result = await resetPassword('valid-token', 'PasswordTest');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    });

    it('should accept valid password with special characters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Password reset successfully. You can now log in with your new password.'
        })
      });

      const result = await resetPassword('valid-token', 'ValidPass123!');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset successfully. You can now log in with your new password.');
    });
  });
});