import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-client';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// POST /api/subscription/upgrade - Upgrade user's subscription plan
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
    const { newPlanId } = await request.json();

    // Validate required fields
    if (!newPlanId) {
      return NextResponse.json(
        { success: false, error: 'New plan ID is required' },
        { status: 400 }
      );
    }

    // Validate plan ID
    const validPlans = ['trial', 'basic', 'premium', 'premium-annual'];
    if (!validPlans.includes(newPlanId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Process payment through Stripe
    // 2. Update user's plan in the database
    // 3. Return updated subscription information

    // For now, we'll simulate a successful upgrade
    // In a real app, you would integrate with Stripe here

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription upgraded successfully',
      newPlan: newPlanId
    });
  } catch (error) {
    console.error('Error in POST /api/subscription/upgrade:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}