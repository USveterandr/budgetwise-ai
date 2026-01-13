/**
 * Utility functions for OCR and receipt parsing
 */

export interface ReceiptData {
  description: string;
  amount: number;
  category: string;
  date: string;
}

/**
 * Parse OCR text to extract receipt information
 * This is a simplified implementation - a real OCR system would be more sophisticated
 */
export function parseReceiptText(text: string): ReceiptData {
  // Extract amount (looking for currency patterns)
  const amountRegex = /\$?(\d+(?:\.\d{2})?)/;
  const amountMatch = text.match(amountRegex);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  
  // Extract date (looking for common date formats)
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const dateMatch = text.match(dateRegex);
  const date = dateMatch ? formatDate(dateMatch[1]) : new Date().toISOString().split('T')[0];
  
  // Extract merchant/store name (looking for capitalized words at start)
  const merchantRegex = /^([A-Z][A-Z\s]{2,})/;
  const merchantMatch = text.match(merchantRegex);
  const description = merchantMatch ? merchantMatch[1].trim() : 'Receipt Purchase';
  
  // Simple category assignment based on keywords
  const category = categorizeReceipt(text);
  
  return {
    description,
    amount,
    category,
    date,
  };
}

/**
 * Format date string to YYYY-MM-DD format
 */
export function formatDate(dateString: string): string {
  // Handle different date formats
  const parts = dateString.split(/[-/]/);
  if (parts.length === 3) {
    const year = parts[2].length === 4 ? parts[2] : `20${parts[2]}`;
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Categorize receipt based on keywords
 */
export function categorizeReceipt(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('cafe')) {
    return 'Food';
  }
  
  if (lowerText.includes('gas') || lowerText.includes('fuel')) {
    return 'Transportation';
  }
  
  if (lowerText.includes('grocery') || lowerText.includes('market')) {
    return 'Shopping';
  }
  
  if (lowerText.includes('hotel') || lowerText.includes('lodging')) {
    return 'Travel';
  }
  
  if (lowerText.includes('movie') || lowerText.includes('entertainment')) {
    return 'Entertainment';
  }
  
  return 'Other';
}

/**
 * Mock OCR function - in a real app, this would call an OCR service
 */
export async function performOCR(imageUri: string): Promise<string> {
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock OCR text for demonstration
  return `WALMART
123 Main Street
Anytown, ST 12345
(555) 123-4567

Cashier: John D.     Register: 5
Date: 12/04/2025     Time: 14:30

Items:
Bananas             1.99
Apple Juice         3.49
Bread               2.29
Milk                3.99

Subtotal:           11.76
Tax:                0.94
Total:              12.70

Payment Method: Credit Card
Approval Code: 123456`;
}