import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { 
  PiggyBank, 
  Plus, 
  Target,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Wallet
} from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BudgetManager = ({ user }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period: "monthly"
  });

  const categories = [
    "Food & Dining",
    "Transportation", 
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Health & Fitness",
    "Travel",
    "Education",
    "Business",
    "Other"
  ];

  const periods = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" }
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/budgets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgets(response.data);
    } catch (error) {
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API}/budgets`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBudgets([response.data, ...budgets]);
      toast.success("Budget created successfully!");
      setShowAddBudget(false);
      setFormData({
        category: "",
        amount: "",
        period: "monthly"
      });
    } catch (error) {
      toast.error("Failed to create budget");
    }
  };

  const getBudgetStatus = (budget) => {
    const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    
    if (percentage >= 100) {
      return { status: "over", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" };
    } else if (percentage >= 80) {
      return { status: "warning", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
    } else {
      return { status: "good", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" };
    }
  };

  const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const overallProgress = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">BudgetWise</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 ml-8">
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/expenses" className="text-gray-600 hover:text-gray-900">Expenses</Link>
                <Link to="/budget" className="text-violet-600 font-medium">Budgets</Link>
                <Link to="/investments" className="text-gray-600 hover:text-gray-900">Investments</Link>
                <Link to="/achievements" className="text-gray-600 hover:text-gray-900">Achievements</Link>
              </div>
            </div>
            <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                  <DialogDescription>
                    Set spending limits for different categories
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Budget Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="period">Period</Label>
                      <Select value={formData.period} onValueChange={(value) => setFormData({...formData, period: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.map((period) => (
                            <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-purple-500">
                    Create Budget
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Manager</h1>
          <p className="text-gray-600">Set and track your spending limits</p>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">${totalBudgetAmount.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">${(totalBudgetAmount - totalSpent).toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
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
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Overall Budget Progress
            </CardTitle>
            <CardDescription>
              Your spending across all budget categories this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  ${totalSpent.toFixed(2)} of ${totalBudgetAmount.toFixed(2)} spent
                </span>
                <span className={`text-sm font-medium ${
                  overallProgress >= 100 ? 'text-red-600' :
                  overallProgress >= 80 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {overallProgress.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(overallProgress, 100)} 
                className="h-3"
              />
              {overallProgress >= 100 && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  You've exceeded your total budget limit
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget List */}
        {budgets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget, index) => {
              const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
              const budgetStatus = getBudgetStatus(budget);
              
              return (
                <Card key={index} className={`${budgetStatus.bgColor} ${budgetStatus.borderColor} border-2`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {budget.period}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Spent</span>
                        <span className={budgetStatus.color}>
                          ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                        </span>
                      </div>
                      
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className="h-2"
                      />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {progress >= 100 ? (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              Over budget
                            </span>
                          ) : (
                            `${(100 - progress).toFixed(1)}% remaining`
                          )}
                        </span>
                        <span className={`text-sm font-semibold ${budgetStatus.color}`}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      
                      {progress >= 100 && (
                        <div className="mt-3 p-2 bg-red-100 rounded-lg">
                          <p className="text-xs text-red-700">
                            Over budget by ${(budget.spent - budget.amount).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No budgets created yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start managing your finances better by creating budgets for different spending categories.
              </p>
              <Button 
                onClick={() => setShowAddBudget(true)}
                className="bg-gradient-to-r from-violet-500 to-purple-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;