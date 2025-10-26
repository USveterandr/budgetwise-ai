// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  targetDate: string | null;
  type: string;
};

type Data = {
  success: boolean;
  goals?: Goal[];
  goal?: Goal;
  message?: string;
};

// Dummy data for demonstration
const dummyGoals: Goal[] = [
  {
    id: 'goal_1',
    name: 'Emergency Fund',
    target: 10000,
    current: 2500,
    targetDate: '2026-12-31',
    type: 'emergency'
  },
  {
    id: 'goal_2',
    name: 'Vacation Fund',
    target: 5000,
    current: 1200,
    targetDate: '2025-08-15',
    type: 'vacation'
  }
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    // Return all goals
    res.status(200).json({ 
      success: true, 
      goals: dummyGoals 
    });
  } else if (req.method === 'POST') {
    // Create a new goal
    const { name, target, current, targetDate, type } = req.body;
    
    // Validate required fields
    if (!name || !target || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, target, and type are required' 
      });
    }
    
    // Create a new goal (dummy implementation)
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      name,
      target,
      current: current || 0,
      targetDate: targetDate || null,
      type
    };
    
    // Add to dummy data
    dummyGoals.push(newGoal);
    
    res.status(201).json({ 
      success: true, 
      goal: newGoal,
      message: 'Goal created successfully' 
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