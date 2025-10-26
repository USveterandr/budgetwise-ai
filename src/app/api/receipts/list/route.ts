import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// GET /api/receipts/list - Get all receipts for the current user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // In a real implementation, this would:
    // 1. Query the database for receipts belonging to the current user
    // 2. Apply pagination
    // 3. Return the receipts data
    
    // For demo purposes, we'll return mock data
    const mockReceipts = [
      {
        id: 'rcpt_1',
        user_id: user.id,
        transaction_id: null,
        file_key: 'receipts/rcpt_1.jpg',
        file_url: 'https://example.com/receipts/rcpt_1.jpg',
        uploaded_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: 'rcpt_2',
        user_id: user.id,
        transaction_id: null,
        file_key: 'receipts/rcpt_2.jpg',
        file_url: 'https://example.com/receipts/rcpt_2.jpg',
        uploaded_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        id: 'rcpt_3',
        user_id: user.id,
        transaction_id: null,
        file_key: 'receipts/rcpt_3.jpg',
        file_url: 'https://example.com/receipts/rcpt_3.jpg',
        uploaded_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      }
    ];

    return NextResponse.json({ 
      success: true,
      receipts: mockReceipts,
      total: mockReceipts.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}