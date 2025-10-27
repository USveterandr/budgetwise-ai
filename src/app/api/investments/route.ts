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

    // In a real implementation, you would fetch investments from the database
    // For demo purposes, we'll return mock data
    const mockInvestments = [
      {
        id: 'inv_1',
        user_id: user.id,
        name: 'Tech Stocks',
        type: 'Stocks',
        value: 5000,
        change: 12.5
      },
      {
        id: 'inv_2',
        user_id: user.id,
        name: 'Bond Fund',
        type: 'Bonds',
        value: 3000,
        change: 3.2
      },
      {
        id: 'inv_3',
        user_id: user.id,
        name: 'Real Estate',
        type: 'REITs',
        value: 7500,
        change: 8.7
      }
    ];

    return NextResponse.json({ 
      success: true,
      investments: mockInvestments
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch investments' },
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

    // In a real implementation, you would parse the request body and create a new investment
    // For demo purposes, we'll return mock data
    const mockInvestment = {
      id: `inv_${Date.now()}`,
      user_id: user.id,
      name: 'New Investment',
      type: 'Other',
      value: 1000,
      change: 0
    };

    return NextResponse.json({ 
      success: true,
      investment: mockInvestment,
      message: 'Investment created successfully'
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create investment' },
      { status: 500 }
    );
  }
}

// PUT /api/investments/:id - Update an existing investment
export async function PUT(request: Request) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Investment ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // In a real implementation, this would update in the database
    // For now, we'll return mock data
    const updatedInvestment = {
      id,
      user_id: user.id,
      asset_name: body.asset_name || 'Apple Inc.',
      symbol: body.symbol || 'AAPL',
      shares: body.shares || 10,
      purchase_price: body.purchase_price || 150.00,
      current_price: (body.purchase_price || 150.00) * 1.1, // Simulate 10% gain
      value: (body.shares || 10) * (body.purchase_price || 150.00) * 1.1,
      profit_loss: (body.shares || 10) * (body.purchase_price || 150.00) * 0.1,
      purchase_date: body.purchase_date || '2023-01-15',
      created_at: '2023-01-15T10:30:00Z',
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      investment: updatedInvestment,
      message: 'Investment updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/investments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/investments/:id - Delete an investment
export async function DELETE(request: Request) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Investment ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would delete from the database
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Investment deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/investments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}