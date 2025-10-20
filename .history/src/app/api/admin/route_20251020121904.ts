import { NextResponse } from 'next/server';

// Make this route static for export
export const dynamic = 'force-static';
export const revalidate = 0;

// Mock data for admin dashboard
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', plan: 'premium', status: 'active', lastActive: '2025-10-19T10:30:00Z' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', plan: 'free', status: 'active', lastActive: '2025-10-19T14:15:00Z' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', plan: 'pro', status: 'suspended', lastActive: '2025-10-18T09:45:00Z' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', plan: 'premium', status: 'active', lastActive: '2025-10-20T08:20:00Z' },
];

const mockAnalytics = {
  totalUsers: 1247,
  activeUsers: 892,
  suspendedUsers: 45,
  freeUsers: 623,
  premiumUsers: 412,
  proUsers: 212,
  monthlyRevenue: 8456.75,
  annualRevenue: 97254.20,
  recentSignups: 23,
  cancellations: 5
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  // Mock implementation for static export
  // In a real implementation, this would query the Cloudflare D1 database
  
  switch (action) {
    case 'users':
      return NextResponse.json({ users: mockUsers });
    
    case 'analytics':
      return NextResponse.json({ analytics: mockAnalytics });
    
    case 'toggle-user':
      return NextResponse.json({ 
        success: true, 
        message: 'User status updated successfully' 
      });
    
    default:
      return NextResponse.json({ 
        success: true, 
        message: 'Admin API endpoint' 
      });
  }
}