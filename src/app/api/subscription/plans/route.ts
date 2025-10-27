import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a real implementation, you would fetch subscription plans from the database
    // For demo purposes, we'll return mock data
    const mockPlans = [
      {
        id: 'basic',
        name: 'Basic',
        price: 9.99,
        period: 'month',
        features: ['Basic expense tracking', 'Monthly reports', 'Email support']
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 19.99,
        period: 'month',
        features: ['Advanced analytics', 'Investment tracking', 'Priority support', 'Budget planning']
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 29.99,
        period: 'month',
        features: ['All Premium features', 'AI-powered insights', 'Tax preparation', 'Financial advisor access']
      }
    ];

    return NextResponse.json({ 
      success: true,
      plans: mockPlans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
