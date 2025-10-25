import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-client';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// GET /api/subscription - Get user's current subscription
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

    // In a real implementation, this would fetch from the database
    // For now, we'll return the user's current plan from their profile
    const subscriptionData = {
      plan: user.plan,
      status: 'active',
      startDate: new Date().toISOString(), // Using current date as we don't have user creation date in client
      nextBillingDate: null,
      autoRenew: true,
      features: getPlanFeatures(user.plan)
    };

    return NextResponse.json({ 
      success: true, 
      subscription: subscriptionData
    });
  } catch (error) {
    console.error('Error in GET /api/subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get plan features
function getPlanFeatures(plan: string) {
  switch (plan) {
    case 'trial':
      return [
        'Up to 100 transactions per month',
        'Basic budgeting tools',
        'Email support'
      ];
    case 'basic':
      return [
        'Unlimited transactions',
        'Advanced budgeting tools',
        'Receipt storage',
        'Email support'
      ];
    case 'premium':
    case 'premium-annual':
      return [
        'Unlimited transactions',
        'Advanced budgeting tools',
        'Investment tracking',
        'AI financial advisor',
        'Priority email support'
      ];
    default:
      return [
        'Up to 100 transactions per month',
        'Basic budgeting tools',
        'Email support'
      ];
  }
}
