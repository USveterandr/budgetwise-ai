"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  LightBulbIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { transactionCategorizationService, CategorizationResult } from "@/services/transaction-categorization";
import { Transaction } from "@/types/transaction";

interface AutoCategorizeButtonProps {
  transactions: Transaction[];
  onCategorizationComplete: (results: CategorizationResult[]) => void;
}

export default function AutoCategorizeButton({ 
  transactions, 
  onCategorizationComplete 
}: AutoCategorizeButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const handleAutoCategorize = async () => {
    // Filter for uncategorized transactions
    const uncategorized = transactions.filter(t => !t.category || t.category === 'Uncategorized');
    
    if (uncategorized.length === 0) {
      alert('No uncategorized transactions found.');
      return;
    }

    setIsProcessing(true);
    setTotalCount(uncategorized.length);
    setProcessedCount(0);

    try {
      // Process in batches of 10 to avoid overwhelming the API
      const batchSize = 10;
      const results: CategorizationResult[] = [];
      
      for (let i = 0; i < uncategorized.length; i += batchSize) {
        const batch = uncategorized.slice(i, i + batchSize);
        const batchResults = await transactionCategorizationService.categorizeTransactions(batch);
        results.push(...batchResults);
        setProcessedCount(Math.min(i + batchSize, uncategorized.length));
        
        // Add a small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Filter out low confidence results
      const highConfidenceResults = results.filter(r => r.confidence > 0.5);
      
      if (highConfidenceResults.length > 0) {
        onCategorizationComplete(highConfidenceResults);
        alert(`Successfully categorized ${highConfidenceResults.length} transactions automatically.`);
      } else {
        alert('No transactions could be categorized with high confidence.');
      }
    } catch (error) {
      console.error('Error during auto-categorization:', error);
      alert('An error occurred during auto-categorization. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessedCount(0);
      setTotalCount(0);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleAutoCategorize}
        disabled={isProcessing}
        className="flex items-center text-sm"
        variant="outline"
      >
        {isProcessing ? (
          <>
            <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
            Categorizing... {processedCount}/{totalCount}
          </>
        ) : (
          <>
            <LightBulbIcon className="h-4 w-4 mr-1" />
            Auto-Categorize
          </>
        )}
      </Button>
      
      {isProcessing && (
        <div className="text-sm text-gray-500">
          Processing {processedCount} of {totalCount} transactions...
        </div>
      )}
    </div>
  );
}