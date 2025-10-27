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

    // In a real implementation, you would generate reports based on user data
    // For demo purposes, we'll return mock data
    const mockReports = {
      spendingByCategory: [
        { category: 'Food & Dining', amount: 420.50 },
        { category: 'Transportation', amount: 280.75 },
        { category: 'Entertainment', amount: 150.25 },
        { category: 'Shopping', amount: 320.00 }
      ],
      incomeVsExpenses: {
        income: 5000,
        expenses: 3800,
        savings: 1200
      },
      netWorth: {
        assets: 25000,
        liabilities: 5000,
        netWorth: 20000
      }
    };

    return NextResponse.json({ 
      success: true,
      reports: mockReports
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}