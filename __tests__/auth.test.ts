import { isValidPassword, signup, login } from '../src/lib/auth';

describe('Auth Functions', () => {
  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('MySecurePass1')).toBe(true);
      expect(isValidPassword('TestPassword123!')).toBe(true);
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
    });
  });

  describe('signup', () => {
    it('should return success when signup is successful', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await signup('Test User', 'test@example.com', 'Password123', 'basic');
      expect(result.success).toBe(true);
    });

    it('should return error when user already exists', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ success: false, error: 'An account with this email address already exists. Please use a different email or try logging in instead.' }),
      });

      const result = await signup('Test User', 'test@example.com', 'Password123', 'basic');
      expect(result.success).toBe(false);
      expect(result.error).toBe('An account with this email address already exists. Please use a different email or try logging in instead.');
    });
  });

  describe('login', () => {
    it('should return user and token when login is successful', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: mockUser, token: 'mock-token' }),
      });

      const result = await login('test@example.com', 'Password123');
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should return error when login fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ success: false, error: 'Invalid credentials' }),
      });

      const result = await login('test@example.com', 'Password123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });
});