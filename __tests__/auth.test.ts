import { isValidPassword } from '../src/lib/auth';

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
});