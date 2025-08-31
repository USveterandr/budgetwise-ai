import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { 
  PiggyBank, 
  Plus, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar as CalendarIcon,
  Target,
  Percent
} from "lucide-react";
import { toast } from "sonner";

const API = `${(process.env.REACT_APP_BACKEND_URL ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '') : '')}/api`;

const InvestmentTracker = ({ user }) => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    shares: "",
    purchase_price: "",
    purchase_date: new Date()
  });

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/investments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Simulate current price updates for demo
      const investmentsWithPrices = response.data.map(inv => ({
        ...inv,
        current_price: inv.purchase_price * (0.8 + Math.random() * 0.4) // Random price between 80% and 120% of purchase price
      }));
      
      setInvestments(investmentsWithPrices);
    } catch (error) {
      toast.error("Failed to load investments");
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
      const response = await axios.post(`${API}/investments`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add simulated current price
      const newInvestment = {
        ...response.data,
        current_price: response.data.purchase_price * (0.8 + Math.random() * 0.4)
      };
      
      setInvestments([newInvestment, ...investments]);
      toast.success("Investment added successfully!");
      setShowAddInvestment(false);
      setFormData({
        name: "",
        symbol: "",
        shares: "",
        purchase_price: "",
        purchase_date: new Date()
      });
    } catch (error) {
      toast.error("Failed to add investment");
    }
  };

  const calculatePortfolioStats = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.shares * inv.purchase_price), 0);
    const currentValue = investments.reduce((sum, inv) => sum + (inv.shares * inv.current_price), 0);
    const totalGainLoss = currentValue - totalInvested;
    const percentageChange = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
    
    return {
      totalInvested,
      currentValue,
      totalGainLoss,
      percentageChange
    };
  };

  const stats = calculatePortfolioStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your investments...</p>
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
                <Link to="/budget" className="text-gray-600 hover:text-gray-900">Budgets</Link>
                <Link to="/investments" className="text-violet-600 font-medium">Investments</Link>
                <Link to="/achievements" className="text-gray-600 hover:text-gray-900">Achievements</Link>
              </div>
            </div>
            <Dialog open={showAddInvestment} onOpenChange={setShowAddInvestment}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Investment</DialogTitle>
                  <DialogDescription>
                    Track your investment portfolio performance
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Investment Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Apple Inc."
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input
                        id="symbol"
                        name="symbol"
                        placeholder="AAPL"
                        value={formData.symbol}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shares">Shares</Label>
                      <Input
                        id="shares"
                        name="shares"
                        type="number"
                        step="0.001"
                        placeholder="10"
                        value={formData.shares}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase_price">Purchase Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="purchase_price"
                          name="purchase_price"
                          type="number"
                          step="0.01"
                          placeholder="150.00"
                          value={formData.purchase_price}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Purchase Date</Label>
                    <Calendar
                      mode="single"
                      selected={formData.purchase_date}
                      onSelect={(date) => setFormData({...formData, purchase_date: date})}
                      className="rounded-md border"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-purple-500">
                    Add Investment
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Portfolio</h1>
          <p className="text-gray-600">Track your investments and monitor portfolio performance</p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalInvested.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.currentValue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                  <p className={`text-2xl font-bold ${stats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.totalGainLoss >= 0 ? '+' : ''}${stats.totalGainLoss.toFixed(2)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stats.totalGainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {stats.totalGainLoss >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Return %</p>
                  <p className={`text-2xl font-bold ${stats.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.percentageChange >= 0 ? '+' : ''}{stats.percentageChange.toFixed(2)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Holdings */}
        {investments.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Your Holdings
              </CardTitle>
              <CardDescription>
                {investments.length} investments • Last updated: {new Date().toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investments.map((investment, index) => {
                  const totalValue = investment.shares * investment.current_price;
                  const totalCost = investment.shares * investment.purchase_price;
                  const gainLoss = totalValue - totalCost;
                  const percentChange = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
                  const isPositive = gainLoss >= 0;
                  
                  return (
                    <div key={index} className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {investment.symbol.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{investment.name}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="outline">{investment.symbol}</Badge>
                              <span className="text-sm text-gray-600">
                                {investment.shares} shares
                              </span>
                              <span className="text-sm text-gray-600">
                                Bought: {new Date(investment.purchase_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-sm text-gray-600">Current Price</p>
                              <p className="font-semibold text-gray-900">${investment.current_price.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Value</p>
                              <p className="font-semibold text-gray-900">${totalValue.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Gain/Loss</p>
                              <div className="flex items-center gap-2">
                                <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                  {isPositive ? '+' : ''}${gainLoss.toFixed(2)}
                                </p>
                                <Badge className={`${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No investments tracked yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start building your investment portfolio by adding your first stock, ETF, or other investment.
              </p>
              <Button 
                onClick={() => setShowAddInvestment(true)}
                className="bg-gradient-to-r from-violet-500 to-purple-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Investment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Investment Tips */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="h-5 w-5" />
              Investment Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <PieChart className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Diversify Your Portfolio</h4>
                  <p className="text-sm text-blue-700">
                    Spread investments across different sectors and asset classes to reduce risk.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Think Long-term</h4>
                  <p className="text-sm text-blue-700">
                    Focus on long-term growth rather than short-term market fluctuations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Regular Monitoring</h4>
                  <p className="text-sm text-blue-700">
                    Review your portfolio regularly but avoid making emotional decisions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvestmentTracker;