"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SpendingByCategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MonthlySummaryData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface TransactionAnalyticsProps {
  userId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

export default function TransactionAnalytics({ userId }: TransactionAnalyticsProps) {
  const [spendingData, setSpendingData] = useState<SpendingByCategoryData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("month");

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchSpendingByCategory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/analytics/spending-by-category?user_id=${userId}`, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setSpendingData(result.data);
      } else {
        setError(result.error || "Failed to fetch spending data");
      }
    } catch (err) {
      setError("Failed to fetch spending data");
      console.error("Error fetching spending data:", err);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const year = new Date().getFullYear();
      const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/analytics/monthly-summary?user_id=${userId}&year=${year}`, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setMonthlyData(result.data);
      } else {
        setError(result.error || "Failed to fetch monthly summary");
      }
    } catch (err) {
      setError("Failed to fetch monthly summary");
      console.error("Error fetching monthly summary:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      Promise.all([fetchSpendingByCategory(), fetchMonthlySummary()])
        .then(() => setIsLoading(false))
        .catch(() => {
          setIsLoading(false);
          setError("Failed to load analytics data");
        });
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Analytics</h3>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "month" | "quarter" | "year")}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            aria-label="Time range"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium mb-4">Spending by Category</h4>
          {spendingData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="category"
                    label={(props: any) => {
                      const name = props.name || '';
                      const percent = props.percent || 0;
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No spending data available
            </div>
          )}
        </div>

        {/* Monthly Summary */}
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium mb-4">Monthly Summary</h4>
          {monthlyData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Legend />
                  <Bar dataKey="income" fill="#00C49F" name="Income" />
                  <Bar dataKey="expense" fill="#FF8042" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No monthly data available
            </div>
          )}
        </div>
      </div>

      {/* Spending Data Table */}
      {spendingData.length > 0 && (
        <div className="mt-6 bg-white p-4 border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium mb-4">Spending Details</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spendingData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {item.count}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}