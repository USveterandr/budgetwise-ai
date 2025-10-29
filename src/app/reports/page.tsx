"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DocumentArrowDownIcon,
  CogIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import CustomReportBuilder from "@/components/reports/CustomReportBuilder";
import { ReportData, ReportSummary, IncomeVsExpensesItem, CategoryBreakdownItem } from "../../types/report";

// Define types for autotable options
interface AutoTableOptions {
  head: string[][];
  body: string[][];
  startY: number;
  styles?: { fontSize: number };
  headStyles?: { fillColor: number[] };
}

// Extend jsPDF type definition to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  isAdmin: boolean;
  emailVerified: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Get current user on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/auth-client').then((module) => {
        setUser(module.getCurrentUser());
      });
    }
  }, []);

  // Fetch report data when component mounts
  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user]);

  const fetchReportData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/reports/summary/${user.id}`, {
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.error || "Failed to fetch report data");
      }
    } catch (err) {
      setError("Failed to fetch report data");
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!reportData) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("BudgetWise Financial Report", 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Add summary data
    if (reportData.summary) {
      doc.setFontSize(16);
      doc.text("Summary", 14, 45);
      
      doc.setFontSize(12);
      doc.text(`Total Income: $${reportData.summary.totalIncome.toFixed(2)}`, 14, 55);
      doc.text(`Total Expenses: $${reportData.summary.totalExpenses.toFixed(2)}`, 14, 62);
      doc.text(`Net Income: $${reportData.summary.netIncome.toFixed(2)}`, 14, 69);
      doc.text(`Savings Rate: ${reportData.summary.savingsRate.toFixed(2)}%`, 14, 76);
    }
    
    // Add income vs expenses chart data
    if (reportData.incomeVsExpenses) {
      doc.setFontSize(16);
      doc.text("Income vs Expenses", 14, 90);
      
      // Create table for income vs expenses data
      doc.autoTable({
        startY: 95,
        head: [['Month', 'Income', 'Expenses']],
        body: reportData.incomeVsExpenses.map((item: IncomeVsExpensesItem) => [
          item.month,
          `$${item.income.toFixed(2)}`,
          `$${item.expenses.toFixed(2)}`
        ]),
      });
    }
    
    // Add category breakdown
    if (reportData.categoryBreakdown) {
      // Type-safe way to access lastAutoTable
      const jsPDFWithAutoTable = doc as unknown as { lastAutoTable: { finalY: number } };
      const finalY = jsPDFWithAutoTable.lastAutoTable?.finalY || 130;
      
      doc.setFontSize(16);
      doc.text("Category Breakdown", 14, finalY + 15);
      
      // Create table for category breakdown
      doc.autoTable({
        startY: finalY + 20,
        head: [['Category', 'Amount', 'Percentage']],
        body: reportData.categoryBreakdown.map((item: CategoryBreakdownItem) => [
          item.category,
          `$${item.amount.toFixed(2)}`,
          `${item.percentage.toFixed(2)}%`
        ]),
      });
    }
    
    // Save the PDF
    doc.save("budgetwise-report.pdf");
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600">Analyze your financial performance</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={exportToPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center text-sm"
                disabled={!reportData}
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('predefined')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'predefined'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Predefined Reports
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'custom'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Custom Report Builder
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'predefined' ? (
          <div className="space-y-6">
            {reportData?.summary && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-800">Total Income</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${reportData.summary.totalIncome.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-800">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-900">
                        ${reportData.summary.totalExpenses.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">Net Income</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ${reportData.summary.netIncome.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-800">Savings Rate</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {reportData.summary.savingsRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {reportData?.incomeVsExpenses && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Income
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expenses
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Difference
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.incomeVsExpenses.map((item: IncomeVsExpensesItem, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.month}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              ${item.income.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              ${item.expenses.toFixed(2)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              item.income - item.expenses >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${(item.income - item.expenses).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {reportData?.categoryBreakdown && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.categoryBreakdown.map((item: CategoryBreakdownItem, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${item.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.percentage.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <CustomReportBuilder />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;