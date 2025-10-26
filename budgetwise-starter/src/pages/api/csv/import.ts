// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  message?: string;
  processedRecords?: number;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    // Dummy implementation - in a real app, this would process a CSV file
    console.log('Processing CSV import...');
    
    // Simulate CSV processing delay
    setTimeout(() => {
      // In a real implementation, you would parse the CSV and create expenses
      const processedRecords = Math.floor(Math.random() * 100) + 1;
      
      res.status(200).json({ 
        success: true, 
        processedRecords,
        message: `Successfully processed ${processedRecords} records` 
      });
    }, 1500);
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }
}