// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Budget = {
  id: string;
  name: string;
  amount: number;
  period: string;
};

type Data = {
  success: boolean;
  budgets?: Budget[];
  budget?: Budget;
  message?: string;
};

// Dummy data for demonstration
const dummyBudgets: Budget[] = [
  {
    id: 'budget_1',
    name: 'Monthly Groceries',
    amount: 500,
    period: 'monthly'
  },
  {
    id: 'budget_2',
    name: 'Entertainment',
    amount: 200,
    period: 'monthly'
  }
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    // Return all budgets
    res.status(200).json({ 
      success: true, 
      budgets: dummyBudgets 
    });
  } else if (req.method === 'POST') {
    // Create a new budget
    const { name, amount, period } = req.body;
    
    // Validate required fields
    if (!name || !amount || !period) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, amount, and period are required' 
      });
    }
    
    // Create a new budget (dummy implementation)
    const newBudget: Budget = {
      id: `budget_${Date.now()}`,
      name,
      amount,
      period
    };
    
    // Add to dummy data
    dummyBudgets.push(newBudget);
    
    res.status(201).json({ 
      success: true, 
      budget: newBudget,
      message: 'Budget created successfully' 
    });
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }
}