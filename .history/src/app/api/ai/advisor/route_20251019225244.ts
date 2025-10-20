import { NextRequest } from 'next/server';

// Mock data for demonstration
const mockUserData = {
  name: "Alex Johnson",
  income: 5000,
  expenses: [
    { category: "Housing", amount: 1500 },
    { category: "Food", amount: 600 },
    { category: "Transportation", amount: 300 },
    { category: "Entertainment", amount: 200 },
    { category: "Utilities", amount: 250 },
    { category: "Insurance", amount: 150 },
    { category: "Healthcare", amount: 100 },
  ],
  savings: 800,
  goals: [
    { name: "Emergency Fund", target: 10000, current: 5000 },
    { name: "Vacation", target: 3000, current: 1200 },
    { name: "Retirement", target: 500000, current: 45000 }
  ]
};

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, we would get user data from the database
    // const { userId } = await request.json();
    
    // For this demo, we'll use mock data
    const userData = mockUserData;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate AI advice based on user data
    const advice = generateAIAdvice(userData);
    
    return new Response(
      JSON.stringify({
        success: true,
        advice
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate AI advice'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

function generateAIAdvice(userData: typeof mockUserData) {
  const totalExpenses = userData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const savingsRate = (userData.savings / userData.income) * 100;
  
  const advice = [
    `Hello ${userData.name}! Based on your financial data, here's my analysis:`,
    `You're earning $${userData.income.toFixed(2)} monthly with $${totalExpenses.toFixed(2)} in expenses, giving you a savings rate of ${savingsRate.toFixed(1)}%.`,
  ];
  
  // Spending insights
  const housingExpense = userData.expenses.find(e => e.category === "Housing");
  if (housingExpense && (housingExpense.amount / userData.income) > 0.3) {
    advice.push(`Your housing costs (${((housingExpense.amount / userData.income) * 100).toFixed(1)}% of income) are higher than the recommended 30%. Consider ways to reduce this expense.`);
  }
  
  // Savings insights
  if (savingsRate < 20) {
    advice.push(`Try to increase your savings rate to at least 20% of your income for better financial security.`);
  } else {
    advice.push(`Great job! Your savings rate of ${savingsRate.toFixed(1)}% is above the recommended 20%.`);
  }
  
  // Goal progress
  const emergencyFund = userData.goals.find(g => g.name === "Emergency Fund");
  if (emergencyFund) {
    const progress = (emergencyFund.current / emergencyFund.target) * 100;
    if (progress < 50) {
      advice.push(`Your emergency fund is ${progress.toFixed(1)}% complete. Aim to save 3-6 months of expenses for financial security.`);
    } else {
      advice.push(`You're making good progress on your emergency fund at ${progress.toFixed(1)}% complete.`);
    }
  }
  
  // Recommendation
  advice.push(`Consider automating transfers to your savings accounts to ensure consistent progress toward your goals.`);
  
  return advice;
}