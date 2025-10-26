"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartBarIcon, 
  ScaleIcon, 
  CalendarIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import ReportChart from "@/components/reports/ReportChart";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  isAdmin: boolean;
  emailVerified: boolean;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

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

interface ReportData {
  reportType: string;
  data: SpendingByCategoryData[] | IncomeVsExpensesData[] | BudgetPerformanceData[] | NetWorthData[];
  generatedAt: string;
}

export default function ReportsPage() {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const [user, setUser] = useState<User | null>(null);

  // Get current user on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/auth-client').then((module) => {
        setUser(module.getCurrentUser());
      });
    }
  }, []);

  // Fetch available report types when component mounts
  const fetchReportTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/reports');
      const result = await response.json();
      
      if (result.success) {
        setReportTypes(result.reportTypes);
      } else {
        setError(result.error || 'Failed to fetch report types');
      }
    } catch (err) {
      setError('Failed to fetch report types');
      console.error('Error fetching report types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && user) {
      fetchReportTypes();
    } else {
      setLoading(false);
    }
  }, [user, fetchReportTypes]);

  const generateReport = async (reportType: string) => {
    try {
      setGenerating(true);
      setError(null);
      setSelectedReport(reportType);
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          year: new Date().getFullYear()
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setReportData(result);
      } else {
        setError(result.error || 'Failed to generate report');
      }
    } catch (err) {
      setError('Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = (format: string) => {
    // In a real implementation, this would export the report data
    alert(`Exporting report as ${format}`);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'chart-bar':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'scale':
        return <ScaleIcon className="h-5 w-5" />;
      case 'calendar':
        return <CalendarIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Generate and view detailed financial reports</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Types Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Report Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportTypes.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => generateReport(report.id)}
                      disabled={generating}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedReport === report.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                          {getIconComponent(report.icon)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{report.name}</h3>
                          <p className="text-sm text-gray-500">{report.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date Range Selector */}
            {selectedReport && (
              <Card className="shadow-sm mt-6">
                <CardHeader>
                  <CardTitle>Date Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <Button
                      onClick={() => generateReport(selectedReport)}
                      disabled={generating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {generating ? 'Generating...' : 'Update Report'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Report Display Area */}
          <div className="lg:col-span-2">
            {generating ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : reportData ? (
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {reportTypes.find(r => r.id === reportData.reportType)?.name}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport('PDF')}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport('CSV')}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {reportData.reportType === 'spending-by-category' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Spending by Category</h3>
                      <ReportChart 
                        type="pie" 
                        data={reportData.data as SpendingByCategoryData[]} 
                        dataKey="amount" 
                        nameKey="category" 
                        title="Spending by Category" 
                      />
                      <div className="space-y-3">
                        {reportData.data.map((item, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">
                                {(item as SpendingByCategoryData).category}
                              </span>
                              <span>
                                ${(item as SpendingByCategoryData).amount.toFixed(2)} (
                                {(item as SpendingByCategoryData).percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-blue-500" 
                                style={{ width: `${(item as SpendingByCategoryData).percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(reportData.reportType === 'income-vs-expenses' || reportData.reportType === 'monthly-summary') && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        {reportData.reportType === 'income-vs-expenses' 
                          ? 'Income vs Expenses' 
                          : 'Monthly Summary'}
                      </h3>
                      <ReportChart 
                        type="line" 
                        data={reportData.data as IncomeVsExpensesData[]} 
                        dataKey="net" 
                        nameKey="month" 
                        title="Net Income Over Time" 
                      />
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Month
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Income
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Expenses
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.data.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {(item as IncomeVsExpensesData).month}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                  ${(item as IncomeVsExpensesData).income.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                  ${(item as IncomeVsExpensesData).expense.toFixed(2)}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                  (item as IncomeVsExpensesData).net >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  ${(item as IncomeVsExpensesData).net.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {reportData.reportType === 'budget-performance' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Budget Performance</h3>
                      <ReportChart 
                        type="bar" 
                        data={reportData.data as BudgetPerformanceData[]} 
                        dataKey="difference" 
                        nameKey="category" 
                        title="Budget vs Actual Spending" 
                      />
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Budgeted
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actual
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Difference
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.data.map((item, index) => {
                              const budgetItem = item as BudgetPerformanceData;
                              return (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {budgetItem.category}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${budgetItem.budgeted.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${budgetItem.actual.toFixed(2)}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                    budgetItem.difference >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ${budgetItem.difference.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {reportData.reportType === 'net-worth' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Net Worth</h3>
                      <ReportChart 
                        type="line" 
                        data={reportData.data as NetWorthData[]} 
                        dataKey="netWorth" 
                        nameKey="date" 
                        title="Net Worth Over Time" 
                      />
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assets
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Liabilities
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Worth
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.data.map((item, index) => {
                              const netWorthItem = item as NetWorthData;
                              return (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {netWorthItem.date}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                    ${netWorthItem.assets.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                    ${netWorthItem.liabilities.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                    ${netWorthItem.netWorth.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Generated on {new Date(reportData.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Report Selected</h3>
                  <p className="text-gray-500">
                    Select a report type from the sidebar to generate a financial report.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
