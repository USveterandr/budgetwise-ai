"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon
} from "@heroicons/react/24/outline";

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([
    { id: 1, name: "Apple Inc.", symbol: "AAPL", shares: 10, purchasePrice: 150.00, currentPrice: 175.50, value: 1755.00, profitLoss: 255.00, profitLossPercentage: 17.0 },
    { id: 2, name: "Microsoft Corp.", symbol: "MSFT", shares: 5, purchasePrice: 300.00, currentPrice: 335.25, value: 1676.25, profitLoss: 176.25, profitLossPercentage: 11.75 },
    { id: 3, name: "Tesla Inc.", symbol: "TSLA", shares: 8, purchasePrice: 200.00, currentPrice: 185.75, value: 1486.00, profitLoss: -114.00, profitLossPercentage: -5.7 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    shares: "",
    purchasePrice: ""
  });

  const totalValue = investments.reduce((sum, investment) => sum + investment.value, 0);
  const totalProfitLoss = investments.reduce((sum, investment) => sum + investment.profitLoss, 0);
  const profitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  const handleAddInvestment = () => {
    setShowForm(true);
    setEditingInvestment(null);
    setFormData({
      name: "",
      symbol: "",
      shares: "",
      purchasePrice: ""
    });
  };

  const handleEditInvestment = (id: number) => {
    const investment = investments.find(i => i.id === id);
    if (investment) {
      setEditingInvestment(id);
      setShowForm(true);
      setFormData({
        name: investment.name,
        symbol: investment.symbol,
        shares: investment.shares.toString(),
        purchasePrice: investment.purchasePrice.toString()
      });
    }
  };

  const handleDeleteInvestment = (id: number) => {
    setInvestments(investments.filter(i => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingInvestment) {
      // Update existing investment
      setInvestments(investments.map(i => 
        i.id === editingInvestment 
          ? { 
              ...i, 
              name: formData.name,
              symbol: formData.symbol,
              shares: parseFloat(formData.shares),
              purchasePrice: parseFloat(formData.purchasePrice)
            } 
          : i
      ));
    } else {
      // Add new investment
      const newInvestment = {
        id: investments.length + 1,
        name: formData.name,
        symbol: formData.symbol,
        shares: parseFloat(formData.shares),
        purchasePrice: parseFloat(formData.purchasePrice),
        // In a real app, these would come from an API
        currentPrice: parseFloat(formData.purchasePrice) * 1.1, // Simulate 10% gain
        value: parseFloat(formData.shares) * parseFloat(formData.purchasePrice) * 1.1,
        profitLoss: parseFloat(formData.shares) * parseFloat(formData.purchasePrice) * 0.1,
        profitLossPercentage: 10.0
      };
      setInvestments([...investments, newInvestment]);
    }
    
    setShowForm(false);
    setFormData({
      name: "",
      symbol: "",
      shares: "",
      purchasePrice: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Investment Portfolio</h1>
          <p className="text-gray-600">Track and manage your investments</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Value</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
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

        <div className="mb-6">
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
                    <label htmlFor="name" className="text-sm font-medium">Investment Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g., Apple Inc."
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    <label htmlFor="purchasePrice" className="text-sm font-medium">Purchase Price ($)</label>
                    <input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 150.00"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Investment Holdings</CardTitle>
          </CardHeader>
          <CardContent>
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
                        <div className="text-sm font-medium text-gray-900">{investment.name}</div>
                        <div className="text-xs text-gray-500">{investment.symbol}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {investment.shares}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        ${investment.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        ${investment.currentPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${investment.value.toFixed(2)}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.profitLoss >= 0 ? '+' : ''}${Math.abs(investment.profitLoss).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditInvestment(investment.id)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}