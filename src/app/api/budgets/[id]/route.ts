import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-client';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// PUT /api/budgets/[id] - Update a specific budget
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const updates = await request.json();

    // Validate limit amount if provided
    if (updates.limit_amount !== undefined) {
      if (isNaN(parseFloat(updates.limit_amount)) || parseFloat(updates.limit_amount) <= 0) {
        return NextResponse.json(
          { success: false, error: 'Limit amount must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Resolve params
    const { id } = await params;

    // Call database worker to update budget
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        updates
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update budget' },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      budget: result.budget,
      message: 'Budget updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /api/budgets/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[id] - Delete a specific budget
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Resolve params
    const { id } = await params;

    // Call database worker to delete budget
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete budget' },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: result.message || 'Budget deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/budgets/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}