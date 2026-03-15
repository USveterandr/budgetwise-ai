import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { TrendingUp, AlertCircle } from 'lucide-react-native';
import { PieChart } from 'react-native-chart-kit';

export interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  actual: number;
  color: string;
}

interface BudgetVisualizationProps {
  categories: BudgetCategory[];
}

export function BudgetVisualization({ categories }: BudgetVisualizationProps) {
  const screenWidth = Dimensions.get('window').width;
  
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalActual = categories.reduce((sum, cat) => sum + cat.actual, 0);
  const remaining = Math.max(0, totalBudget - totalActual);
  const overspent = Math.max(0, totalActual - totalBudget);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const chartData = categories.map(cat => ({
    name: cat.name,
    population: cat.actual,
    color: cat.color,
    legendFontColor: '#64748b',
    legendFontSize: 12,
  }));

  return (
    <View className="w-full space-y-6 mb-8">
      {/* Summary Cards */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 w-[48%] mb-4">
          <Text className="text-xs font-medium text-slate-500 mb-1">Total Budget</Text>
          <Text className="text-xl font-bold text-slate-900">{formatCurrency(totalBudget)}</Text>
        </View>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 w-[48%] mb-4">
          <Text className="text-xs font-medium text-slate-500 mb-1">Total Spent</Text>
          <Text className="text-xl font-bold text-slate-900">{formatCurrency(totalActual)}</Text>
          {overspent > 0 && (
            <View className="flex-row items-center mt-1">
              <TrendingUp size={12} color="#dc2626" />
              <Text className="text-xs font-medium text-red-600 ml-1">Over {formatCurrency(overspent)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pie Chart */}
      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 items-center">
        <Text className="text-lg font-semibold text-slate-900 self-start mb-4">Spending Distribution</Text>
        {totalActual > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        ) : (
          <Text className="text-slate-500 py-8">No spending data yet.</Text>
        )}
      </View>

      {/* Category Progress Bars */}
      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <Text className="text-lg font-semibold text-slate-900 mb-6">Category Breakdown</Text>
        <View className="space-y-6">
          {categories.map((category) => {
            const percentage = Math.min(100, Math.round((category.actual / category.budget) * 100)) || 0;
            const isOverBudget = category.actual > category.budget;
            
            return (
              <View key={category.id} className="mb-5">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                    <Text className="font-medium text-slate-700">{category.name}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-slate-500 mr-2">
                      {formatCurrency(category.actual)} / {formatCurrency(category.budget)}
                    </Text>
                    <Text className={`text-xs font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                      {percentage}%
                    </Text>
                  </View>
                </View>
                
                {/* Progress Bar Background */}
                <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  {/* Progress Bar Fill */}
                  <View 
                    className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : ''}`}
                    style={{ 
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: isOverBudget ? undefined : category.color
                    }}
                  />
                </View>
                
                {isOverBudget && (
                  <View className="flex-row items-center mt-1">
                    <AlertCircle size={12} color="#dc2626" />
                    <Text className="text-xs text-red-600 ml-1">
                      Over budget by {formatCurrency(category.actual - category.budget)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
