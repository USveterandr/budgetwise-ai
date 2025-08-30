import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import CameraCapture from "./CameraCapture";
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Target, 
  Trophy,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  BarChart3,
  Zap,
  Camera,
  Award,
  Star,
  Flame
} from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCameraCapture, setShowCameraCapture] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <PiggyBank className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  const currentUser = dashboardData?.user || user || {};
  const recentExpenses = dashboardData?.recent_expenses || [];
  const budgets = dashboardData?.budgets || [];
  const totalSpentThisMonth = dashboardData?.total_spent_this_month || 0;
  const achievementsCount = dashboardData?.achievements_count || 0;

  const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const budgetUtilization = totalBudgetAmount > 0 ? (totalSpentThisMonth / totalBudgetAmount) * 100 : 0;

  const quickActions = [
    {
      title: "Add Expense",
      description: "Track a new expense",
      icon: <Plus className="h-5 w-5" />,
      link: "/expenses",
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Create Budget",
      description: "Set spending limits",
      icon: <Target className="h-5 w-5" />,
      link: "/budget", 
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Track Investment",
      description: "Monitor portfolio",
      icon: <TrendingUp className="h-5 w-5" />,
      link: "/investments",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "View Achievements",
      description: "Check your progress",
      icon: <Trophy className="h-5 w-5" />,
      link: "/achievements",
      color: "from-yellow-500 to-amber-500"
    },
    {
      title: "Scan Receipt",
      description: "Capture with camera",
      icon: <Camera className="h-5 w-5" />,
      action: () => setShowCameraCapture(true),
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "Gamification Hub",
      description: "View rewards & challenges",
      icon: <Award className="h-5 w-5" />,
      link: "/gamification",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">BudgetWise</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 ml-8">
                <Link to="/dashboard" className="text-violet-600 font-medium">Dashboard</Link>
                <Link to="/expenses" className="text-gray-600 hover:text-gray-900">Expenses</Link>
                <Link to="/budget" className="text-gray-600 hover:text-gray-900">Budgets</Link>
                <Link to="/investments" className="text-gray-600 hover:text-gray-900">Investments</Link>
                <Link to="/achievements" className="text-gray-600 hover:text-gray-900">Achievements</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-violet-600 border-violet-200">
                {currentUser.subscription_plan?.replace("-", " ") || "Free Plan"}
              </Badge>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser.full_name?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {currentUser.full_name || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser.full_name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your finances today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalSpentThisMonth.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowDownRight className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {budgetUtilization.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Budgets</p>
                  <p className="text-2xl font-bold text-gray-900">{budgets.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">{achievementsCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks to manage your finances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.link}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-gradient-to-r from-gray-50 to-gray-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center text-white`}>
                              {action.icon}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{action.title}</p>
                              <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Your latest spending activities</CardDescription>
                </div>
                <Link to="/expenses">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {recentExpenses.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {expense.description || expense.category}
                            </p>
                            <p className="text-sm text-gray-600">{expense.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">-${expense.amount}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No expenses tracked yet</p>
                    <Link to="/expenses">
                      <Button className="mt-2 bg-gradient-to-r from-violet-500 to-purple-500">
                        Add Your First Expense
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {budgets.length > 0 ? (
                  <div className="space-y-4">
                    {budgets.slice(0, 3).map((budget, index) => {
                      const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                      const isOverBudget = progress > 100;
                      
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{budget.category}</span>
                            <span className={`${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                              ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(progress, 100)} 
                            className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
                          />
                          {isOverBudget && (
                            <p className="text-xs text-red-600 mt-1">
                              Over budget by ${(budget.spent - budget.amount).toFixed(2)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    <Link to="/budget">
                      <Button variant="outline" className="w-full mt-4">
                        Manage Budgets
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No budgets set yet</p>
                    <Link to="/budget">
                      <Button className="bg-gradient-to-r from-violet-500 to-purple-500">
                        Create Budget
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">85</span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">Good Financial Health</p>
                  <p className="text-sm text-gray-600 mb-4">
                    You're doing great! Keep tracking expenses and stick to your budgets.
                  </p>
                  <div className="space-y-2 text-xs text-left">
                    <div className="flex justify-between">
                      <span>Expense Tracking</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Budget Management</span>
                      <span className="text-green-600">✓ Good</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Savings Goals</span>
                      <span className="text-yellow-600">⚠ Needs Work</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;