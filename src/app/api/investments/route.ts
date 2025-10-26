import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// GET /api/investments - Get all investments for the current user
export async function GET() {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a real implementation, this would fetch from the database
    // For now, we'll return mock data
    const investments = [
      {
        id: 'inv_1',
        user_id: user.id,
        asset_name: 'Apple Inc.',
        symbol: 'AAPL',
        shares: 10,
        purchase_price: 150.00,
        current_price: 175.50,
        value: 1755.00,
        profit_loss: 255.00,
        purchase_date: '2023-01-15',
        created_at: '2023-01-15T10:30:00Z',
        updated_at: '2023-01-15T10:30:00Z'
      },
      {
        id: 'inv_2',
        user_id: user.id,
        asset_name: 'Microsoft Corp.',
        symbol: 'MSFT',
        shares: 5,
        purchase_price: 300.00,
        current_price: 335.25,
        value: 1676.25,
        profit_loss: 176.25,
        purchase_date: '2023-02-20',
        created_at: '2023-02-20T14:45:00Z',
        updated_at: '2023-02-20T14:45:00Z'
      },
      {
        id: 'inv_3',
        user_id: user.id,
        asset_name: 'Tesla Inc.',
        symbol: 'TSLA',
        shares: 8,
        purchase_price: 200.00,
        current_price: 185.75,
        value: 1486.00,
        profit_loss: -114.00,
        purchase_date: '2023-03-10',
        created_at: '2023-03-10T09:15:00Z',
        updated_at: '2023-03-10T09:15:00Z'
      }
    ];

    return NextResponse.json({ 
      success: true, 
      investments,
      total_value: investments.reduce((sum, inv) => sum + inv.value, 0),
      total_profit_loss: investments.reduce((sum, inv) => sum + inv.profit_loss, 0)
    });
  } catch (error) {
    console.error('Error in GET /api/investments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/investments - Create a new investment
export async function POST(request: Request) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['asset_name', 'symbol', 'shares', 'purchase_price', 'purchase_date'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate data types
    if (typeof body.shares !== 'number' || body.shares <= 0) {
      return NextResponse.json(
        { success: false, error: 'Shares must be a positive number' },
        { status: 400 }
      );
    }
    
    if (typeof body.purchase_price !== 'number' || body.purchase_price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Purchase price must be a positive number' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would insert into the database
    // For now, we'll return mock data
    const newInvestment = {
      id: `inv_${Date.now()}`,
      user_id: user.id,
      asset_name: body.asset_name,
      symbol: body.symbol,
      shares: body.shares,
      purchase_price: body.purchase_price,
      current_price: body.purchase_price * 1.1, // Simulate 10% gain
      value: body.shares * body.purchase_price * 1.1,
      profit_loss: body.shares * body.purchase_price * 0.1,
      purchase_date: body.purchase_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      investment: newInvestment,
      message: 'Investment created successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/investments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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