// Transaction categorization service
import { Transaction } from "@/types/transaction";

export interface CategorizationResult {
  transactionId: string;
  category: string;
  confidence: number;
}

export class TransactionCategorizationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_DATABASE_WORKER_URL || 'http://localhost:8787';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Categorize a single transaction
   */
  async categorizeTransaction(transaction: Transaction): Promise<CategorizationResult | null> {
    try {
      const response = await fetch('/api/transactions/categorize', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          description: transaction.description,
          merchant: transaction.merchant,
          amount: transaction.amount,
          transactionId: transaction.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          transactionId: transaction.id,
          category: result.category,
          confidence: result.confidence
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return null;
    }
  }

  /**
   * Categorize multiple transactions in batch
   */
  async categorizeTransactions(transactions: Transaction[]): Promise<CategorizationResult[]> {
    try {
      const response = await fetch('/api/transactions/categorize', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          batch: transactions.map(t => ({
            id: t.id,
            description: t.description,
            merchant: t.merchant,
            amount: t.amount
          }))
        }),
      });

      const result = await response.json();
      
      if (result.success && result.batch) {
        return result.batch;
      }
      
      return [];
    } catch (error) {
      console.error('Error categorizing transactions:', error);
      return [];
    }
  }

  /**
   * Automatically categorize uncategorized transactions
   */
  async autoCategorizeAll(userId: string): Promise<CategorizationResult[]> {
    try {
      // In a real implementation, this would fetch uncategorized transactions from the database
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      console.error('Error auto-categorizing transactions:', error);
      return [];
    }
  }

  /**
   * Learn from user corrections to improve categorization
   */
  async learnFromCorrection(transactionId: string, correctCategory: string): Promise<boolean> {
    try {
      // In a real implementation, this would store the correction for future learning
      // For now, we'll just return true
      return true;
    } catch (error) {
      console.error('Error learning from correction:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const transactionCategorizationService = new TransactionCategorizationService();