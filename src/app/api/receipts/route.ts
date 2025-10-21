import { NextRequest, NextResponse } from 'next/server';

// API routes in static export should not have dynamic configuration
// They will be handled by the server at runtime

// Mock function to simulate OCR processing
async function processReceiptImage(_imageData: string) {
  // In a real implementation, you would:
  // 1. Send the image to an OCR service (Google Vision, AWS Textract, etc.)
  // 2. Parse the response to extract merchant, amount, date, items, etc.
  // 3. Return the structured data
  
  // For demo purposes, we'll return mock data
  return {
    merchant: "Whole Foods Market",
    amount: 86.42,
    date: new Date().toISOString().split('T')[0],
    category: "Groceries",
    items: [
      { name: "Organic Bananas", price: 2.99 },
      { name: "Almond Milk", price: 4.99 },
      { name: "Quinoa", price: 7.99 },
      { name: "Salmon Fillet", price: 12.99 },
      { name: "Greek Yogurt", price: 5.49 },
      { name: "Avocado", price: 3.99 }
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }
    
    // Process the receipt image
    const expenseData = await processReceiptImage(image);
    
    return NextResponse.json({ 
      success: true,
      data: expenseData
    });
  } catch (error) {
    console.error('Error processing receipt:', error);
    return NextResponse.json(
      { error: 'Failed to process receipt' },
      { status: 500 }
    );
  }
}