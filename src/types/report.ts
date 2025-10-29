export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
}

export interface IncomeVsExpensesItem {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface ReportData {
  summary: ReportSummary;
  incomeVsExpenses: IncomeVsExpensesItem[];
  categoryBreakdown: CategoryBreakdownItem[];
}