import { NextResponse } from 'next/server';

// Make this route static for export
export const dynamic = 'force-static';
export const revalidate = 0;

export async function POST() {
  // Mock implementation for static export
  // In a real implementation, this would call the OpenAI API
  return NextResponse.json({ 
    advice: "Based on your financial data, I recommend reviewing your budget categories and identifying areas where you can optimize spending. Consider setting aside 20% of your income for savings and investments.",
    timestamp: new Date().toISOString()
  });
}