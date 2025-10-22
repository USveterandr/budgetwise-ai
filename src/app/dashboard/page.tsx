"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  WalletIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardPage() {
  const user = getCurrentUser();
  
  const userData = {
    name: user?.name || "User",
    plan: user?.plan || "Basic",
    netWorth: 125000,
    monthlyIncome: 8500,
    monthlyExpenses: 5200,
    savingsRate: 39
  };

  const summaryData = [
    { 
      title: "Net Worth", 
      value: `$${userData.netWorth.toLocaleString()}`, 
      change: "+2.5%", 
      icon: <WalletIcon className="h-5 w-5 text-blue-500" />,
      color: "text-green-500"
    },
    { 
      title: "Monthly Income", 
      value: `$${userData.monthlyIncome.toLocaleString()}`, 
      change: "+1.2%", 
      icon: <ArrowDownTrayIcon className="h-5 w-5 text-green-500" />,
      color: "text-green-500"
    },
    { 
      title: "Monthly Expenses", 
      value: `$${userData.monthlyExpenses.toLocaleString()}`, 
      change: "-0.8%", 
      icon: <ArrowUpTrayIcon className="h-5 w-5 text-red-500" />,
      color: "text-red-500"
    },
    { 
      title: "Savings Rate", 
      value: `${userData.savingsRate}%`, 
      change: "+3.1%", 
      icon: <CurrencyDollarIcon className="h-5 w-5 text-purple-500" />,
      color: "text-green-500"
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {userData.name}</p>
            <p className="text-sm text-gray-500">Plan: {userData.plan}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryData.map((item, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">{item.title}</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">{item.value}</h3>
                      <p className={`text-xs mt-1 ${item.color}`}>
                        {item.change}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-full">
                      {item.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Chart */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Spending by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <CategoryBar 
                    category="Housing" 
                    spent={1850} 
                    limit={2000} 
                    percentage={92.5} 
                  />
                  <CategoryBar 
                    category="Food" 
                    spent={650} 
                    limit={600} 
                    percentage={108.3} 
                  />
                  <CategoryBar 
                    category="Transportation" 
                    spent={320} 
                    limit={400} 
                    percentage={80} 
                  />
                  <CategoryBar 
                    category="Entertainment" 
                    spent={180} 
                    limit={300} 
                    percentage={60} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-purple-500" />
                  AI Financial Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <InsightCard 
                    title="Spending Insight"
                    content="You're spending 15% more on food this month compared to last month. Consider meal planning to reduce costs."
                  />
                  <InsightCard 
                    title="Savings Opportunity"
                    content="You could save an additional $200/month by refinancing your mortgage. Check current rates."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function CategoryBar({ category, spent, limit, percentage }: { 
  category: string; 
  spent: number; 
  limit: number; 
  percentage: number;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{category}</span>
        <span className="text-sm font-medium text-gray-700">${spent} of ${limit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${percentage > 100 ? 'bg-red-500' : 'bg-blue-600'}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function InsightCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
      <p className="text-sm text-blue-700">
        <span className="font-medium">{title}:</span> {content}
      </p>
    </div>
  );
}