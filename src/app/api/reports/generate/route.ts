import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// Define types for our report data
interface SpendingByCategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface IncomeVsExpensesData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface BudgetPerformanceData {
  category: string;
  budgeted: number;
  actual: number;
  difference: number;
}

interface NetWorthData {
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

type ReportData = 
  | { reportType: 'spending-by-category'; data: SpendingByCategoryData[]; generatedAt: string }
  | { reportType: 'income-vs-expenses'; data: IncomeVsExpensesData[]; generatedAt: string }
  | { reportType: 'monthly-summary'; data: IncomeVsExpensesData[]; generatedAt: string }
  | { reportType: 'budget-performance'; data: BudgetPerformanceData[]; generatedAt: string }
  | { reportType: 'net-worth'; data: NetWorthData[]; generatedAt: string };

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { reportType, startDate, endDate, year } = body;

    // Validate required parameters
    if (!reportType) {
      return NextResponse.json(
        { success: false, error: 'Report type is required' },
        { status: 400 }
      );
    }

    // Generate mock report data based on report type
    let reportData: ReportData | null = null;
    const generatedAt = new Date().toISOString();

    switch (reportType) {
      case 'spending-by-category':
        reportData = {
          reportType: 'spending-by-category',
          data: [
            { category: 'Food & Dining', amount: 420.50, count: 15, percentage: 35.2 },
            { category: 'Transportation', amount: 280.75, count: 22, percentage: 23.5 },
            { category: 'Entertainment', amount: 150.25, count: 8, percentage: 12.6 },
            { category: 'Shopping', amount: 120.00, count: 12, percentage: 10.1 },
            { category: 'Utilities', amount: 95.50, count: 5, percentage: 8.0 },
            { category: 'Healthcare', amount: 75.00, count: 3, percentage: 6.3 },
            { category: 'Travel', amount: 50.00, count: 2, percentage: 4.2 }
          ],
          generatedAt
        };
        break;

      case 'income-vs-expenses':
        reportData = {
          reportType: 'income-vs-expenses',
          data: [
            { month: 'Jan 2025', income: 5200, expense: 3800, net: 1400 },
            { month: 'Feb 2025', income: 4800, expense: 4200, net: 600 },
            { month: 'Mar 2025', income: 5500, expense: 3900, net: 1600 },
            { month: 'Apr 2025', income: 5100, expense: 4100, net: 1000 },
            { month: 'May 2025', income: 4900, expense: 3700, net: 1200 },
            { month: 'Jun 2025', income: 5300, expense: 4000, net: 1300 }
          ],
          generatedAt
        };
        break;

      case 'monthly-summary':
        reportData = {
          reportType: 'monthly-summary',
          data: [
            { month: 'Jan 2025', income: 5200, expense: 3800, net: 1400 },
            { month: 'Feb 2025', income: 4800, expense: 4200, net: 600 },
            { month: 'Mar 2025', income: 5500, expense: 3900, net: 1600 },
            { month: 'Apr 2025', income: 5100, expense: 4100, net: 1000 },
            { month: 'May 2025', income: 4900, expense: 3700, net: 1200 },
            { month: 'Jun 2025', income: 5300, expense: 4000, net: 1300 }
          ],
          generatedAt
        };
        break;

      case 'budget-performance':
        reportData = {
          reportType: 'budget-performance',
          data: [
            { category: 'Food & Dining', budgeted: 400, actual: 420.50, difference: -20.50 },
            { category: 'Transportation', budgeted: 300, actual: 280.75, difference: 19.25 },
            { category: 'Entertainment', budgeted: 150, actual: 150.25, difference: -0.25 },
            { category: 'Shopping', budgeted: 200, actual: 120.00, difference: 80.00 },
            { category: 'Utilities', budgeted: 100, actual: 95.50, difference: 4.50 }
          ],
          generatedAt
        };
        break;

      case 'net-worth':
        reportData = {
          reportType: 'net-worth',
          data: [
            { date: '2025-01-31', assets: 25000, liabilities: 5000, netWorth: 20000 },
            { date: '2025-02-28', assets: 25500, liabilities: 4800, netWorth: 20700 },
            { date: '2025-03-31', assets: 26200, liabilities: 4900, netWorth: 21300 },
            { date: '2025-04-30', assets: 26800, liabilities: 5100, netWorth: 21700 },
            { date: '2025-05-31', assets: 27500, liabilities: 5200, netWorth: 22300 },
            { date: '2025-06-30', assets: 28000, liabilities: 5000, netWorth: 23000 }
          ],
          generatedAt
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true,
      ...reportData
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}