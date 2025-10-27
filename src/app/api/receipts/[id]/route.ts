import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // In a real implementation, you would fetch the receipt from the database
    // For demo purposes, we'll return mock data
    const mockReceipt = {
      id,
      user_id: user.id,
      merchant: 'Sample Merchant',
      amount: 42.50,
      date: new Date().toISOString(),
      category: 'Food & Dining'
    };

    return NextResponse.json({ 
      success: true,
      receipt: mockReceipt
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}

export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // In a real implementation, you would parse the request body and update the receipt
    // For demo purposes, we'll return mock data
    const mockReceipt = {
      id,
      user_id: user.id,
      merchant: 'Updated Merchant',
      amount: 50.00,
      date: new Date().toISOString(),
      category: 'Shopping'
    };

    return NextResponse.json({ 
      success: true,
      receipt: mockReceipt,
      message: 'Receipt updated successfully'
    });
  } catch (error) {
    console.error('Error updating receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update receipt' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // In a real implementation, you would delete the receipt from the database
    // For demo purposes, we'll just return a success message
    return NextResponse.json({ 
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete receipt' },
      { status: 500 }
    );
  }
}