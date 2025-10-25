import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-client';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// GET /api/budgets - Get all budgets for the current user
export async function GET(request: Request) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Call database worker to get user budgets
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/budgets/user/${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch budgets' },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      budgets: result.budgets 
    });
  } catch (error) {
    console.error('Error in GET /api/budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Create a new budget
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

    // Parse request body
    const budgetData = await request.json();

    // Validate required fields
    if (!budgetData.category || budgetData.limit_amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'Category and limit amount are required' },
        { status: 400 }
      );
    }

    // Validate limit amount
    if (isNaN(parseFloat(budgetData.limit_amount)) || parseFloat(budgetData.limit_amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Limit amount must be a positive number' },
        { status: 400 }
      );
    }

    // Call database worker to create budget
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...budgetData,
        user_id: user.id,
        limit_amount: parseFloat(budgetData.limit_amount),
        spent_amount: budgetData.spent_amount || 0
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create budget' },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      budget: result.budget,
      message: 'Budget created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}