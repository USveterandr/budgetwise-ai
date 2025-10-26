import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// GET /api/receipts/[id] - Get a specific receipt
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // In a real implementation, this would:
    // 1. Query the database for the receipt with the given ID
    // 2. Verify the receipt belongs to the current user
    // 3. Return the receipt data
    
    // For demo purposes, we'll return mock data
    const receiptData = {
      id,
      user_id: user.id,
      transaction_id: null,
      file_key: `receipts/${id}.jpg`,
      file_url: `https://example.com/receipts/${id}.jpg`,
      uploaded_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true,
      receipt: receiptData
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}

// PUT /api/receipts/[id] - Update a receipt
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    // In a real implementation, this would:
    // 1. Validate the update data
    // 2. Update the receipt record in the database
    // 3. Return the updated receipt data
    
    // For demo purposes, we'll return mock data
    const updatedReceipt = {
      id,
      user_id: user.id,
      transaction_id: body.transaction_id || null,
      file_key: `receipts/${id}.jpg`,
      file_url: `https://example.com/receipts/${id}.jpg`,
      uploaded_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true,
      receipt: updatedReceipt,
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

// DELETE /api/receipts/[id] - Delete a receipt
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // In a real implementation, this would:
    // 1. Query the database for the receipt
    // 2. Verify the receipt belongs to the current user
    // 3. Delete the file from R2 storage
    // 4. Delete the receipt record from the database
    
    // For demo purposes, we'll just return success
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