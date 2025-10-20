"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  WalletIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [userData, setUserData] = useState({
    name: "",
    plan: "",
    netWorth: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0
  });

  // TODO: Fetch real user data from Cloudflare D1
  useEffect(() => {
    // This is a placeholder - in a real implementation, you would fetch data from your database
    setUserData({
      name: "User",
      plan: "Free",
      netWorth: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savingsRate: 0
    });
  }, []);

  const summaryData = [
    { 
      title: "Net Worth", 
      value: `$${userData.netWorth.toLocaleString()}`, 
      change: "+0%", 
      icon: <WalletIcon className="h-5 w-5 text-blue-500" />,
      color: "text-blue-500"
    },
    { 
      title: "Monthly Income", 
      value: `$${userData.monthlyIncome.toLocaleString()}`, 
      change: "+0%", 
      icon: <ArrowDownTrayIcon className="h-5 w-5 text-green-500" />,
      color: "text-green-500"
    },
    { 
      title: "Monthly Expenses", 
      value: `$${userData.monthlyExpenses.toLocaleString()}`, 
      change: "+0%", 
      icon: <ArrowUpTrayIcon className="h-5 w-5 text-red-500" />,
      color: "text-red-500"
    },
    { 
      title: "Savings Rate", 
      value: `${userData.savingsRate}%`, 
      change: "+0%", 
      icon: <CurrencyDollarIcon className="h-5 w-5 text-purple-500" />,
      color: "text-purple-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData.name}</p>
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
                  spent={0} 
                  limit={0} 
                  percentage={0} 
                />
                <CategoryBar 
                  category="Food" 
                  spent={0} 
                  limit={0} 
                  percentage={0} 
                />
                <CategoryBar 
                  category="Transportation" 
                  spent={0} 
                  limit={0} 
                  percentage={0} 
                />
                <CategoryBar 
                  category="Entertainment" 
                  spent={0} 
                  limit={0} 
                  percentage={0} 
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
                  content="No insights available yet. Add some transactions to get personalized recommendations."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
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