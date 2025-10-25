import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-client';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// GET /api/subscription/plans - Get available subscription plans
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

    // Define available plans
    const plans = [
      {
        id: 'trial',
        name: 'Free Trial',
        price: 0,
        period: 'forever',
        features: [
          'Up to 100 transactions per month',
          'Basic budgeting tools',
          'Email support'
        ],
        limitations: [
          'Limited to 100 transactions per month',
          'No investment tracking',
          'No AI financial advisor'
        ]
      },
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 4.99,
        period: 'month',
        features: [
          'Unlimited transactions',
          'Advanced budgeting tools',
          'Receipt storage',
          'Email support'
        ],
        limitations: [
          'No investment tracking',
          'No AI financial advisor'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        price: 9.99,
        period: 'month',
        features: [
          'Unlimited transactions',
          'Advanced budgeting tools',
          'Investment tracking',
          'AI financial advisor',
          'Priority email support'
        ],
        limitations: []
      },
      {
        id: 'premium-annual',
        name: 'Premium Annual',
        price: 99.99,
        period: 'year',
        features: [
          'Unlimited transactions',
          'Advanced budgeting tools',
          'Investment tracking',
          'AI financial advisor',
          'Priority email support',
          '1 month free compared to monthly'
        ],
        limitations: []
      }
    ];

    return NextResponse.json({ 
      success: true, 
      plans
    });
  } catch (error) {
    console.error('Error in GET /api/subscription/plans:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}