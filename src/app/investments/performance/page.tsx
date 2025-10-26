"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";

interface InvestmentPerformance {
  id: string;
  asset_name: string;
  symbol: string;
  current_price: number;
  purchase_price: number;
  value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  purchase_date: string;
}

export default function InvestmentPerformancePage() {
  const [investments, setInvestments] = useState<InvestmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"1d" | "1w" | "1m" | "3m" | "1y" | "all">("1m");

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
        const investmentsWithPerformance = result.investments.map((inv: InvestmentPerformance) => ({
          ...inv,
          profit_loss_percentage: inv.purchase_price > 0 ? 
            ((inv.current_price - inv.purchase_price) / inv.purchase_price) * 100 : 0
        }));
        
        setInvestments(investmentsWithPerformance);
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

  // Calculate portfolio performance metrics
  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  const totalProfitLoss = investments.reduce((sum, inv) => sum + inv.profit_loss, 0);
  const profitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  // Top performing investments
  const topPerformers = [...investments]
    .sort((a, b) => b.profit_loss_percentage - a.profit_loss_percentage)
    .slice(0, 5);

  // Worst performing investments
  const worstPerformers = [...investments]
    .sort((a, b) => a.profit_loss_percentage - b.profit_loss_percentage)
    .slice(0, 5);

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
          <h1 className="text-2xl font-bold text-gray-900">Investment Performance</h1>
          <p className="text-gray-600">Track your investment performance over time</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Portfolio Value</p>
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
                  <p className="text-xs font-medium text-gray-500">Total Profit/Loss</p>
                  <h3 className={`text-lg font-bold mt-1 ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className={`p-2 rounded-full ${totalProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {totalProfitLoss >= 0 ? (
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500">Portfolio Return</p>
                  <h3 className={`text-lg font-bold mt-1 ${profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                  </h3>
                </div>
                <div className={`p-2 rounded-full ${profitLossPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {profitLossPercentage >= 0 ? (
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {(["1d", "1w", "1m", "3m", "1y", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === "1d" && "1D"}
                {range === "1w" && "1W"}
                {range === "1m" && "1M"}
                {range === "3m" && "3M"}
                {range === "1y" && "1Y"}
                {range === "all" && "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{investment.asset_name}</p>
                      <p className="text-sm text-gray-500">{investment.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${investment.profit_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.profit_loss_percentage >= 0 ? '+' : ''}{investment.profit_loss_percentage.toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        ${investment.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Worst Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {worstPerformers.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{investment.asset_name}</p>
                      <p className="text-sm text-gray-500">{investment.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${investment.profit_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.profit_loss_percentage >= 0 ? '+' : ''}{investment.profit_loss_percentage.toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        ${investment.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Investments Performance */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>All Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No investments found.</p>
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
                        Purchase Price
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P/L
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return
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
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${investment.profit_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {investment.profit_loss_percentage >= 0 ? '+' : ''}{investment.profit_loss_percentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}