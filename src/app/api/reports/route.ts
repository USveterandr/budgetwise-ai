import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-client';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// GET /api/reports - Get available report types
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

    // Define available report types
    const reportTypes = [
      {
        id: 'spending-by-category',
        name: 'Spending by Category',
        description: 'View your spending broken down by category',
        icon: 'chart-bar'
      },
      {
        id: 'income-vs-expenses',
        name: 'Income vs Expenses',
        description: 'Compare your income and expenses over time',
        icon: 'scale'
      },
      {
        id: 'monthly-summary',
        name: 'Monthly Summary',
        description: 'View monthly income, expenses, and net worth',
        icon: 'calendar'
      },
      {
        id: 'budget-performance',
        name: 'Budget Performance',
        description: 'Compare your actual spending with budgeted amounts',
        icon: 'chart-bar'
      },
      {
        id: 'net-worth',
        name: 'Net Worth',
        description: 'Track your assets and liabilities over time',
        icon: 'scale'
      }
    ];

    return NextResponse.json({ 
      success: true, 
      reportTypes 
    });
  } catch (error) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reports/generate - Generate a new report
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
    const { reportType, startDate, endDate, year } = await request.json();

    // Validate required fields
    if (!reportType) {
      return NextResponse.json(
        { success: false, error: 'Report type is required' },
        { status: 400 }
      );
    }

    let response;
    let result;

    // Generate the appropriate report based on type
    switch (reportType) {
      case 'spending-by-category':
        response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/analytics/spending-by-category?start_date=${startDate || ''}&end_date=${endDate || ''}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        result = await response.json();
        break;

      case 'income-vs-expenses':
        response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/analytics/monthly-summary?year=${year || new Date().getFullYear()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        result = await response.json();
        break;

      case 'monthly-summary':
        response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/analytics/monthly-summary?year=${year || new Date().getFullYear()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        result = await response.json();
        break;

      case 'budget-performance':
        // For now, return mock data
        result = {
          success: true,
          data: [
            { category: 'Housing', budgeted: 1500, actual: 1450, difference: -50 },
            { category: 'Food', budgeted: 600, actual: 680, difference: 80 },
            { category: 'Transportation', budgeted: 400, actual: 350, difference: -50 },
            { category: 'Entertainment', budgeted: 200, actual: 250, difference: 50 },
            { category: 'Utilities', budgeted: 300, actual: 280, difference: -20 }
          ]
        };
        break;

      case 'net-worth':
        // For now, return mock data
        result = {
          success: true,
          data: [
            { date: '2023-01', assets: 50000, liabilities: 20000, netWorth: 30000 },
            { date: '2023-02', assets: 52000, liabilities: 19000, netWorth: 33000 },
            { date: '2023-03', assets: 55000, liabilities: 18000, netWorth: 37000 },
            { date: '2023-04', assets: 58000, liabilities: 17000, netWorth: 41000 },
            { date: '2023-05', assets: 60000, liabilities: 16000, netWorth: 44000 },
            { date: '2023-06', assets: 62000, liabilities: 15000, netWorth: 47000 }
          ]
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
    }

    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate report' },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      reportType,
      data: result.data,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/reports/generate:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}