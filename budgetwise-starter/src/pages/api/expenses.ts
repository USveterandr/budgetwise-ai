// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Expense = {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  budgetId: string | null;
};

type Data = {
  success: boolean;
  expense?: Expense;
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    // Dummy implementation - in a real app, this would interact with a database
    const { amount, date, category, description, budgetId } = req.body;
    
    // Validate required fields
    if (!amount || !date || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount, date, and category are required' 
      });
    }
    
    // Create a new expense (dummy implementation)
    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      amount,
      date,
      category,
      description: description || '',
      budgetId: budgetId || null
    };
    
    // In a real implementation, you would save this to the database
    console.log('Creating new expense:', newExpense);
    
    res.status(201).json({ 
      success: true, 
      expense: newExpense,
      message: 'Expense created successfully' 
    });
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }
}