import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// Define common merchant to category mappings
const MERCHANT_CATEGORIES: Record<string, string> = {
  // Food & Dining
  'mcdonalds': 'Food & Dining',
  'starbucks': 'Food & Dining',
  'subway': 'Food & Dining',
  'burger king': 'Food & Dining',
  'pizza hut': 'Food & Dining',
  'dominos': 'Food & Dining',
  'chipotle': 'Food & Dining',
  'panera': 'Food & Dining',
  'whole foods': 'Groceries',
  'kroger': 'Groceries',
  'walmart': 'Groceries',
  'costco': 'Groceries',
  'target': 'Shopping',
  
  // Transportation
  'uber': 'Transportation',
  'lyft': 'Transportation',
  'shell': 'Transportation',
  'chevron': 'Transportation',
  'bp': 'Transportation',
  'exxon': 'Transportation',
  
  // Entertainment
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'hulu': 'Entertainment',
  'amazon prime': 'Entertainment',
  
  // Utilities
  'electric company': 'Utilities',
  'water company': 'Utilities',
  'internet provider': 'Utilities',
  
  // Healthcare
  'cvs': 'Healthcare',
  'walgreens': 'Healthcare',
  'doctor': 'Healthcare',
  
  // Shopping
  'amazon': 'Shopping',
  'ebay': 'Shopping',
  'best buy': 'Shopping',
  
  // Travel
  'airline': 'Travel',
  'hotel': 'Travel',
  'marriott': 'Travel',
  'hilton': 'Travel',
  
  // Financial
  'bank': 'Financial',
  'credit card': 'Financial',
  'loan': 'Financial',
  'mortgage': 'Financial'
};

// Define keyword-based category rules
const KEYWORD_CATEGORIES: Array<{keywords: string[], category: string}> = [
  { keywords: ['grocery', 'supermarket', 'market'], category: 'Groceries' },
  { keywords: ['restaurant', 'cafe', 'diner', 'eatery'], category: 'Food & Dining' },
  { keywords: ['gas', 'fuel', 'petrol'], category: 'Transportation' },
  { keywords: ['movie', 'cinema', 'theater'], category: 'Entertainment' },
  { keywords: ['gym', 'fitness', 'workout'], category: 'Healthcare' },
  { keywords: ['insurance'], category: 'Insurance' },
  { keywords: ['loan', 'mortgage', 'credit'], category: 'Financial' },
  { keywords: ['donation', 'charity'], category: 'Charity' },
  { keywords: ['salary', 'payroll', 'wage'], category: 'Income' },
  { keywords: ['rent', 'mortgage'], category: 'Housing' },
  { keywords: ['electric', 'water', 'gas', 'utility'], category: 'Utilities' }
];

// User-specific category preferences (in a real implementation, this would be stored in the database)
const USER_CATEGORY_PREFERENCES: Record<string, Record<string, string>> = {};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { description, merchant, amount, transactionId, batch } = body;

    // Handle batch categorization
    if (batch && Array.isArray(batch)) {
      const results = await Promise.all(batch.map(async (transaction) => {
        const category = categorizeTransaction(transaction.description, transaction.merchant);
        const confidence = calculateConfidence(transaction.description, transaction.merchant, category);
        
        return {
          transactionId: transaction.id,
          category,
          confidence
        };
      }));
      
      return NextResponse.json({ 
        success: true,
        batch: results
      });
    }

    // Handle single transaction categorization
    // Validate required parameters
    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Transaction description is required' },
        { status: 400 }
      );
    }

    // Categorize the transaction
    const category = categorizeTransaction(description, merchant);
    const confidence = calculateConfidence(description, merchant, category);

    // Store user preference for future categorization
    if (confidence > 0.7) {
      storeUserPreference(user.id, description, merchant, category);
    }

    return NextResponse.json({ 
      success: true,
      category,
      confidence,
      transactionId
    });
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to categorize transaction' },
      { status: 500 }
    );
  }
}

function categorizeTransaction(description: string, merchant?: string): string {
  const lowerDescription = description.toLowerCase();
  const lowerMerchant = merchant?.toLowerCase() || '';

  // First check merchant-specific categories
  if (lowerMerchant) {
    for (const [merchantName, category] of Object.entries(MERCHANT_CATEGORIES)) {
      if (lowerMerchant.includes(merchantName)) {
        return category;
      }
    }
  }

  // Then check keyword-based categories
  for (const rule of KEYWORD_CATEGORIES) {
    for (const keyword of rule.keywords) {
      if (lowerDescription.includes(keyword)) {
        return rule.category;
      }
    }
  }

  // Check user preferences
  // In a real implementation, this would query the database
  // For now, we'll use a simple in-memory approach

  // Default category
  return 'Uncategorized';
}

function calculateConfidence(description: string, merchant: string | undefined, category: string): number {
  // Simple confidence calculation based on match type
  if (merchant) {
    const lowerMerchant = merchant.toLowerCase();
    for (const [merchantName] of Object.entries(MERCHANT_CATEGORIES)) {
      if (lowerMerchant.includes(merchantName)) {
        return 0.9; // High confidence for exact merchant matches
      }
    }
  }

  const lowerDescription = description.toLowerCase();
  for (const rule of KEYWORD_CATEGORIES) {
    for (const keyword of rule.keywords) {
      if (lowerDescription.includes(keyword)) {
        return 0.7; // Medium confidence for keyword matches
      }
    }
  }

  // Low confidence for default category
  return category === 'Uncategorized' ? 0.1 : 0.5;
}

function storeUserPreference(userId: string, description: string, merchant: string | undefined, category: string) {
  // In a real implementation, this would store the preference in the database
  // For now, we'll use a simple in-memory approach
  if (!USER_CATEGORY_PREFERENCES[userId]) {
    USER_CATEGORY_PREFERENCES[userId] = {};
  }
  
  const key = merchant ? `${merchant.toLowerCase()}:${description.toLowerCase()}` : description.toLowerCase();
  USER_CATEGORY_PREFERENCES[userId][key] = category;
}