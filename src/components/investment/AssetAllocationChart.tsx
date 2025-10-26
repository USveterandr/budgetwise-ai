"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AssetAllocationChartProps {
  investments: {
    asset_name: string;
    value: number;
  }[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
    };
  }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function AssetAllocationChart({ investments }: AssetAllocationChartProps) {
  // Calculate total value for percentage calculations
  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  
  // Transform data for the chart
  const chartData = investments.map((inv) => ({
    name: inv.asset_name,
    value: inv.value,
  }));

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-lg rounded">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Value: ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm">Allocation: {percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name }) => name}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No investment data available
        </div>
      )}
    </div>
  );
}