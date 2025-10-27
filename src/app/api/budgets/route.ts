import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
// import { db } from '@/lib/db'; // Not used in this file

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

    // In a real implementation, you would fetch budgets from the database
    // For demo purposes, we'll return mock data
    const mockBudgets = [
      {
        id: 'budget_1',
        user_id: user.id,
        category: 'Food & Dining',
        allocated: 500,
        spent: 340,
        period: 'monthly'
      },
      {
        id: 'budget_2',
        user_id: user.id,
        category: 'Transportation',
        allocated: 300,
        spent: 180,
        period: 'monthly'
      },
      {
        id: 'budget_3',
        user_id: user.id,
        category: 'Entertainment',
        allocated: 200,
        spent: 150,
        period: 'monthly'
      }
    ];

    return NextResponse.json({ 
      success: true,
      budgets: mockBudgets
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
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

    // In a real implementation, you would parse the request body and create a new budget
    // For demo purposes, we'll return mock data
    const mockBudget = {
      id: `budget_${Date.now()}`,
      user_id: user.id,
      category: 'New Category',
      allocated: 100,
      spent: 0,
      period: 'monthly'
    };

    return NextResponse.json({ 
      success: true,
      budget: mockBudget,
      message: 'Budget created successfully'
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}