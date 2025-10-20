"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon, 
  CreditCardIcon,
  ChartBarIcon,
  WalletIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    plan: "Premium",
    netWorth: 42567.89,
    monthlyIncome: 5230.00,
    monthlyExpenses: 3845.50,
    savingsRate: 26.4
  });

  const [recentTransactions] = useState([
    { id: 1, description: "Salary Deposit", amount: 3500.00, type: "income", date: "2023-06-01" },
    { id: 2, description: "Grocery Store", amount: 85.30, type: "expense", date: "2023-06-02" },
    { id: 3, description: "Electric Bill", amount: 120.75, type: "expense", date: "2023-06-03" },
    { id: 4, description: "Freelance Work", amount: 800.00, type: "income", date: "2023-06-05" },
    { id: 5, description: "Netflix Subscription", amount: 15.99, type: "expense", date: "2023-06-07" },
  ]);

  const [budgetData] = useState([
    { category: "Housing", spent: 1200, limit: 1500, percentage: 80 },
    { category: "Food", spent: 450, limit: 600, percentage: 75 },
    { category: "Transportation", spent: 200, limit: 300, percentage: 67 },
    { category: "Entertainment", spent: 150, limit: 200, percentage: 75 },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData.name}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Net Worth" 
            value={`$${userData.netWorth.toLocaleString()}`} 
            change="+2.5% from last month" 
            icon={<WalletIcon className="h-6 w-6 text-blue-500" />}
            trend="up"
          />
          <SummaryCard 
            title="Monthly Income" 
            value={`$${userData.monthlyIncome.toLocaleString()}`} 
            change="+5.2% from last month" 
            icon={<ArrowDownTrayIcon className="h-6 w-6 text-green-500" />}
            trend="up"
          />
          <SummaryCard 
            title="Monthly Expenses" 
            value={`$${userData.monthlyExpenses.toLocaleString()}`} 
            change="-1.3% from last month" 
            icon={<ArrowUpTrayIcon className="h-6 w-6 text-red-500" />}
            trend="down"
          />
          <SummaryCard 
            title="Savings Rate" 
            value={`${userData.savingsRate}%`} 
            change="+3.1% from last month" 
            icon={<CurrencyDollarIcon className="h-6 w-6 text-purple-500" />}
            trend="up"
          />
        </div>

        {/* Charts and Budget Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending Chart */}
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetData.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm font-medium text-gray-700">${item.spent} of ${item.limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-green-500" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <div className="mb-8">
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-purple-500" />
                AI Financial Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Insight:</span> You&apos;re spending 15% more on dining out this month compared to last month. Consider reducing restaurant visits to meet your food budget.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Opportunity:</span> Based on your spending patterns, setting aside $200/month could help you reach your emergency fund goal 3 months earlier.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, change, icon, trend }: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode;
  trend: "up" | "down";
}) {
  return (
    <Card className="shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            <p className={`text-sm mt-2 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {change}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}