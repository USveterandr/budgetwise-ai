import { NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { GET } from '@/app/api/investments/route';

// Mock the NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
    })),
  },
}));

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));

describe('Investment API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/investments', () => {
    it('should return investments for authenticated user', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' };
      (auth.getCurrentUser as jest.Mock).mockReturnValue(mockUser);

      const response = await GET();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.investments).toBeDefined();
      expect(Array.isArray(data.investments)).toBe(true);
    });

    it('should return 401 for unauthenticated requests', async () => {
      (auth.getCurrentUser as jest.Mock).mockReturnValue(null);

      const response = await GET();
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
      expect(response.status).toBe(401);
    });
  });
});