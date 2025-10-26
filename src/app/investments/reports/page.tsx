"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DocumentChartBarIcon,
  ArrowDownTrayIcon
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

export default function InvestmentReportsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<"summary" | "allocation" | "performance">("summary");

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

  // Calculate asset allocation data
  const assetAllocationData = investments.map(inv => ({
    asset_name: inv.asset_name,
    value: inv.value
  }));

  // Export report as CSV
  const exportReport = () => {
    const headers = [
      'Asset Name',
      'Symbol',
      'Shares',
      'Purchase Price',
      'Current Price',
      'Value',
      'Profit/Loss',
      'Return %',
      'Purchase Date'
    ];
    
    const rows = investments.map(inv => [
      inv.asset_name,
      inv.symbol,
      inv.shares,
      inv.purchase_price,
      inv.current_price,
      inv.value,
      inv.profit_loss,
      inv.profit_loss_percentage,
      inv.purchase_date
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `investment-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Investment Reports</h1>
              <p className="text-gray-600">Generate and export investment reports</p>
            </div>
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Report Type Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setReportType("summary")}
              className={`px-4 py-2 text-sm rounded-md flex items-center ${
                reportType === "summary"
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DocumentChartBarIcon className="h-4 w-4 mr-1" />
              Summary
            </button>
            <button
              onClick={() => setReportType("allocation")}
              className={`px-4 py-2 text-sm rounded-md ${
                reportType === "allocation"
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Asset Allocation
            </button>
            <button
              onClick={() => setReportType("performance")}
              className={`px-4 py-2 text-sm rounded-md ${
                reportType === "performance"
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Performance
            </button>
          </div>
        </div>

        {reportType === "summary" && (
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investments List */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Investment Holdings</CardTitle>
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
                            Shares
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
        )}

        {reportType === "allocation" && (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetAllocationChart investments={assetAllocationData} />
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Allocation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asset
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Allocation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {investments.map((investment) => {
                        const allocationPercentage = totalValue > 0 ? (investment.value / totalValue) * 100 : 0;
                        return (
                          <tr key={investment.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {investment.asset_name} ({investment.symbol})
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              ${investment.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {allocationPercentage.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          Total
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          100.00%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "performance" && (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Return</span>
                        <span className={`font-medium ${profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Absolute Gain/Loss</span>
                        <span className={`font-medium ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Portfolio Value</span>
                        <span className="font-medium text-gray-900">
                          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance by Asset</h3>
                    <div className="space-y-3">
                      {investments.map((investment) => (
                        <div key={investment.id} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{investment.asset_name}</p>
                            <p className="text-xs text-gray-500">{investment.symbol}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${investment.profit_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {investment.profit_loss_percentage >= 0 ? '+' : ''}{investment.profit_loss_percentage.toFixed(2)}%
                            </p>
                            <p className={`text-xs ${investment.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {investment.profit_loss >= 0 ? '+' : ''}${Math.abs(investment.profit_loss).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}