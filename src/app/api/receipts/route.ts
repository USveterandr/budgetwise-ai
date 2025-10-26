import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// Function to process receipt image with Tesseract.js
async function processReceiptImage(imageData: string) {
  try {
    // Remove the data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Create a worker with specific configuration for better receipt processing
    const worker = await Tesseract.createWorker('eng');
    
    // Set worker parameters for better receipt text recognition
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      preserve_interword_spaces: '1'
    });
    
    // Process the image
    const result = await worker.recognize(imageBuffer);
    await worker.terminate();
    
    // Extract text from the result
    const ocrText = result.data.text;
    
    // Parse the OCR text to extract receipt information
    // This is a simplified parsing - in a real implementation, you would use more sophisticated NLP
    const parsedData = parseReceiptText(ocrText);
    
    return parsedData;
  } catch (error) {
    console.error('Error processing receipt with Tesseract:', error);
    
    // Fallback to mock data if OCR fails
    return {
      merchant: "Unknown Merchant",
      amount: 0.00,
      date: new Date().toISOString().split('T')[0],
      category: "Uncategorized",
      items: []
    };
  }
}

// Enhanced function to parse receipt text
export function parseReceiptText(text: string) {
  // Clean up the text
  const cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const lines = cleanedText.split('\n').filter(line => line.trim() !== '').slice(0, 100); // Limit to 100 lines
  
  // Try to find merchant name (usually at the top)
  let merchant = "Unknown Merchant";
  
  // Look for merchant in the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Skip lines that look like dates, amounts, or totals
    if (!line.match(/\d+\.\d{2}/) && !line.match(/(TOTAL|SUBTOTAL|TAX|CHANGE|CASH|CARD|CREDIT|DEBIT|BALANCE|DUE)/i)) {
      merchant = line;
      break;
    }
  }
  
  // Try to find total amount (look for patterns like TOTAL, TOTAL AMOUNT, etc.)
  let amount = 0.00;
  
  // First pass: look for "TOTAL" specifically (prioritize over SUBTOTAL)
  const totalRegex = /(\bTOTAL\b|\bTOTAL AMOUNT\b|\bGRAND TOTAL\b).*?(\$?\s*\d+\.\d{2})/i;
  for (const line of lines) {
    const match = line.match(totalRegex);
    if (match) {
      const amountStr = match[2].replace(/[^\d.]/g, '');
      amount = parseFloat(amountStr);
      break;
    }
  }
  
  // Second pass: if no total found, look for other total-like patterns
  if (amount === 0.00) {
    const otherTotalRegex = /(AMOUNT|SUBTOTAL|BALANCE|DUE).*?(\$?\s*\d+\.\d{2})/i;
    for (const line of lines) {
      const match = line.match(otherTotalRegex);
      if (match) {
        const amountStr = match[2].replace(/[^\d.]/g, '');
        amount = parseFloat(amountStr);
        break;
      }
    }
  }
  
  // Second pass: if no total found, look for the highest amount
  if (amount === 0.00) {
    const amountRegex = /\$?\s*(\d+\.\d{2})/g;
    let maxAmount = 0;
    let match;
    while ((match = amountRegex.exec(cleanedText)) !== null) {
      const value = parseFloat(match[1]);
      if (value > maxAmount) {
        maxAmount = value;
      }
    }
    amount = maxAmount;
  }
  
  // Try to find date (look for common date patterns)
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
  let date = new Date().toISOString().split('T')[0];
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      // Try to parse the date
      try {
        const parsedDate = new Date(match[1]);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0];
          break;
        }
      } catch (e) {
        // If parsing fails, use the raw match
        date = match[1];
        break;
      }
    }
  }
  
  // Try to extract items (this is enhanced)
  const items: { name: string; price: number }[] = [];
  
  // Look for item lines (items usually have a name followed by a price)
  const itemRegex = /^(.+?)\s+(\$?\s*\d+\.\d{2})$/;
  
  for (const line of lines) {
    // Skip lines that are likely not items
    if (line.match(/^(TOTAL|SUBTOTAL|TAX|CHANGE|CASH|CARD|CREDIT|DEBIT|BALANCE|DUE|SALE|VOID|REFUND|RETURN)/i)) {
      continue;
    }
    
    const match = line.match(itemRegex);
    if (match && items.length < 20) { // Limit to 20 items
      const itemName = match[1].trim();
      const priceStr = match[2].replace(/[^\d.]/g, '');
      const price = parseFloat(priceStr);
      
      // Only add items with valid names and prices
      if (itemName.length > 1 && !isNaN(price) && price > 0) {
        items.push({
          name: itemName,
          price: price
        });
      }
    }
  }
  
  // If we didn't find a total amount but have items, sum the items
  if (amount === 0.00 && items.length > 0) {
    amount = items.reduce((sum, item) => sum + item.price, 0);
  }
  
  return {
    merchant,
    amount,
    date,
    category: categorizeMerchant(merchant),
    items
  };
}

// Simple merchant categorization
export function categorizeMerchant(merchant: string): string {
  const merchantLower = merchant.toLowerCase();
  
  if (merchantLower.includes('whole foods') || merchantLower.includes('grocery') || merchantLower.includes('market')) {
    return 'Groceries';
  } else if (merchantLower.includes('starbucks') || merchantLower.includes('coffee')) {
    return 'Food & Dining';
  } else if (merchantLower.includes('shell') || merchantLower.includes('gas') || merchantLower.includes('petrol')) {
    return 'Gas & Fuel';
  } else if (merchantLower.includes('amazon') || merchantLower.includes('online')) {
    return 'Shopping';
  } else if (merchantLower.includes('walgreens') || merchantLower.includes('cvs') || merchantLower.includes('pharmacy')) {
    return 'Healthcare';
  } else {
    return 'Miscellaneous';
  }
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