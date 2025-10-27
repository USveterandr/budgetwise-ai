import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a real implementation, you would fetch receipts from the database
    // For demo purposes, we'll return mock data
    const mockReceipts = [
      {
        id: 'rcpt_1',
        user_id: user.id,
        merchant: 'Whole Foods',
        amount: 86.42,
        date: new Date(Date.now() - 86400000).toISOString(),
        category: 'Groceries'
      },
      {
        id: 'rcpt_2',
        user_id: user.id,
        merchant: 'Starbucks',
        amount: 5.75,
        date: new Date(Date.now() - 172800000).toISOString(),
        category: 'Food & Dining'
      },
      {
        id: 'rcpt_3',
        user_id: user.id,
        merchant: 'Shell',
        amount: 42.30,
        date: new Date(Date.now() - 259200000).toISOString(),
        category: 'Transportation'
      }
    ];

    return NextResponse.json({ 
      success: true,
      receipts: mockReceipts
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

export async function POST(_req: NextRequest) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a real implementation, you would parse the request body and create a new receipt
    // For demo purposes, we'll return mock data
    const mockReceipt = {
      id: `rcpt_${Date.now()}`,
      user_id: user.id,
      merchant: 'New Merchant',
      amount: 25.00,
      date: new Date().toISOString(),
      category: 'Other'
    };

    return NextResponse.json({ 
      success: true,
      receipt: mockReceipt,
      message: 'Receipt created successfully'
    });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create receipt' },
      { status: 500 }
    );
  }
}