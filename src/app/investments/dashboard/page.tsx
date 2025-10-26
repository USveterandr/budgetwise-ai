"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChartPieIcon
} from "@heroicons/react/24/outline";
import AssetAllocationChart from "@/components/investment/AssetAllocationChart";

interface Investment {
  id: string;
  asset_name: string;
  symbol: string;
  shares: number;
  purchase_price: number;
  current_price: number;
  value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export default function InvestmentDashboardPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    asset_name: "",
    symbol: "",
    shares: "",
    purchase_price: "",
    purchase_date: ""
  });
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [view, setView] = useState<"list" | "chart">("list");

  // Fetch investments when component mounts
  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/investments');
      const result = await response.json();
      
      if (result.success) {
        // Calculate profit/loss percentage for each investment
        const investmentsWithPercentage = result.investments.map((inv: Investment) => ({
          ...inv,
          profit_loss_percentage: inv.purchase_price > 0 ? 
            ((inv.current_price - inv.purchase_price) / inv.purchase_price) * 100 : 0
        }));
        
        setInvestments(investmentsWithPercentage);
        setTotalValue(result.total_value || 0);
        setTotalProfitLoss(result.total_profit_loss || 0);
      } else {
        setError(result.error || 'Failed to fetch investments');
      }
    } catch (err) {
      setError('Failed to fetch investments');
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = () => {
    setShowForm(true);
    setEditingInvestment(null);
    setFormData({
      asset_name: "",
      symbol: "",
      shares: "",
      purchase_price: "",
      purchase_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment.id);
    setShowForm(true);
    setFormData({
      asset_name: investment.asset_name,
      symbol: investment.symbol,
      shares: investment.shares.toString(),
      purchase_price: investment.purchase_price.toString(),
      purchase_date: investment.purchase_date
    });
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/investments/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove the investment from the state
        setInvestments(investments.filter(i => i.id !== id));
        // Refresh totals
        fetchInvestments();
      } else {
        setError(result.error || 'Failed to delete investment');
      }
    } catch (err) {
      setError('Failed to delete investment');
      console.error('Error deleting investment:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const investmentData = {
        asset_name: formData.asset_name,
        symbol: formData.symbol,
        shares: parseFloat(formData.shares),
        purchase_price: parseFloat(formData.purchase_price),
        purchase_date: formData.purchase_date
      };
      
      let response;
      if (editingInvestment) {
        // Update existing investment
        response = await fetch(`/api/investments/${editingInvestment}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(investmentData),
        });
      } else {
        // Add new investment
        response = await fetch('/api/investments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(investmentData),
        });
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the investments list
        fetchInvestments();
        setShowForm(false);
        setFormData({
          asset_name: "",
          symbol: "",
          shares: "",
          purchase_price: "",
          purchase_date: ""
        });
      } else {
        setError(result.error || 'Failed to save investment');
      }
    } catch (err) {
      setError('Failed to save investment');
      console.error('Error saving investment:', err);
    }
  };

  const profitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Investment Dashboard</h1>
          <p className="text-gray-600">Track and manage your investments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Value</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500">Profit/Loss</p>
                  <h3 className={`text-lg font-bold mt-1 ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500">Return</p>
                  <h3 className={`text-lg font-bold mt-1 ${profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button 
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
              className="text-sm"
            >
              List View
            </Button>
            <Button 
              variant={view === "chart" ? "default" : "outline"}
              onClick={() => setView("chart")}
              className="text-sm flex items-center"
            >
              <ChartPieIcon className="h-4 w-4 mr-1" />
              Asset Allocation
            </Button>
          </div>
          
          <Button 
            onClick={handleAddInvestment}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Investment
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle>
                {editingInvestment ? "Edit Investment" : "Add New Investment"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="asset_name" className="text-sm font-medium">Investment Name</label>
                    <input
                      id="asset_name"
                      type="text"
                      placeholder="e.g., Apple Inc."
                      value={formData.asset_name}
                      onChange={(e) => setFormData({...formData, asset_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="symbol" className="text-sm font-medium">Symbol</label>
                    <input
                      id="symbol"
                      type="text"
                      placeholder="e.g., AAPL"
                      value={formData.symbol}
                      onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="shares" className="text-sm font-medium">Shares</label>
                    <input
                      id="shares"
                      type="number"
                      step="0.001"
                      placeholder="e.g., 10"
                      value={formData.shares}
                      onChange={(e) => setFormData({...formData, shares: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="purchase_price" className="text-sm font-medium">Purchase Price ($)</label>
                    <input
                      id="purchase_price"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 150.00"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="purchase_date" className="text-sm font-medium">Purchase Date</label>
                    <input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    {editingInvestment ? "Update" : "Add"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {view === "chart" ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <AssetAllocationChart 
                investments={investments.map(inv => ({
                  asset_name: inv.asset_name,
                  value: inv.value
                }))} 
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Investment Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No investments found. Add your first investment to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Investment
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Shares
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchase
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          P/L
                        </th>
                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {investments.map((investment) => (
                        <tr key={investment.id}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{investment.asset_name}</div>
                            <div className="text-xs text-gray-500">{investment.symbol}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {investment.shares}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            ${investment.purchase_price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            ${investment.current_price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${investment.value.toFixed(2)}
                          </td>
                          <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${investment.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {investment.profit_loss >= 0 ? '+' : ''}${Math.abs(investment.profit_loss).toFixed(2)}
                            <div className={`text-xs ${investment.profit_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({investment.profit_loss_percentage >= 0 ? '+' : ''}{investment.profit_loss_percentage.toFixed(2)}%)
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditInvestment(investment)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                              aria-label="Edit investment"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInvestment(investment.id)}
                              className="text-red-600 hover:text-red-900"
                              aria-label="Delete investment"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}