"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LightBulbIcon
} from "@heroicons/react/24/outline";

import { Transaction, TransactionFormData } from "@/types/transaction";

interface TransactionFormProps {
  userId: string;
  transaction?: Transaction;
  onSubmit: (transaction: TransactionFormData) => void;
  onCancel: () => void;
}

export default function TransactionForm({ 
  userId, 
  transaction, 
  onSubmit, 
  onCancel 
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    date: transaction?.date || new Date().toISOString().split('T')[0],
    description: transaction?.description || "",
    category: transaction?.category || "",
    amount: transaction?.amount ? transaction.amount.toString() : "",
    type: transaction?.type || "expense",
    merchant: transaction?.merchant || "",
    tags: transaction?.tags || "",
    notes: transaction?.notes || "",
    currency: transaction?.currency || "USD"
  });
  
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Auto-suggest category when description or merchant changes
  useEffect(() => {
    const shouldSuggest = formData.description.length > 3 || formData.merchant.length > 3;
    
    if (shouldSuggest && !formData.category) {
      const timer = setTimeout(() => {
        getSuggestedCategory();
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timer);
    }
  }, [formData.description, formData.merchant]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const getSuggestedCategory = async () => {
    if (!formData.description && !formData.merchant) {
      return;
    }
    
    setIsGettingSuggestion(true);
    setShowSuggestion(true);
    
    try {
      const response = await fetch('/api/transactions/categorize', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description: formData.description,
          merchant: formData.merchant
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuggestedCategory(result.category);
        // Auto-apply high confidence suggestions
        if (result.confidence > 0.8 && !formData.category) {
          setFormData({
            ...formData,
            category: result.category
          });
          setShowSuggestion(false);
        }
      }
    } catch (err) {
      console.error("Error getting category suggestion:", err);
    } finally {
      setIsGettingSuggestion(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestedCategory) {
      setFormData({
        ...formData,
        category: suggestedCategory
      });
      setSuggestedCategory("");
      setShowSuggestion(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData: TransactionFormData = {
      user_id: userId,
      date: formData.date,
      description: formData.description,
      category: formData.category,
      amount: parseFloat(formData.amount),
      type: formData.type as "income" | "expense",
      receipt_url: null,
      merchant: formData.merchant,
      tags: formData.tags,
      notes: formData.notes,
      currency: formData.currency
    };
    
    onSubmit(transactionData);
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle>
          {transaction?.id ? "Edit Transaction" : "Add New Transaction"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">Date</label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as "income" | "expense"})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                required
                aria-label="Transaction type"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <input
                id="description"
                type="text"
                placeholder="e.g., Grocery Store"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="merchant" className="text-sm font-medium">Merchant</label>
              <input
                id="merchant"
                type="text"
                placeholder="e.g., Walmart"
                value={formData.merchant}
                onChange={(e) => setFormData({...formData, merchant: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <div className="flex gap-2">
                <input
                  id="category"
                  type="text"
                  placeholder="e.g., Food"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
                <Button
                  type="button"
                  onClick={getSuggestedCategory}
                  disabled={isGettingSuggestion || (!formData.description && !formData.merchant)}
                  className="flex items-center text-sm"
                  variant="outline"
                  size="sm"
                >
                  <LightBulbIcon className="h-4 w-4 mr-1" />
                  {isGettingSuggestion ? "..." : "Suggest"}
                </Button>
              </div>
              {showSuggestion && suggestedCategory && (
                <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-800">
                      Suggested: <span className="font-medium">{suggestedCategory}</span>
                    </span>
                    <Button
                      type="button"
                      onClick={handleApplySuggestion}
                      className="text-xs"
                      size="sm"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">Amount</label>
              <div className="flex">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  aria-label="Currency"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="flex-1 px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">Tags</label>
              <input
                id="tags"
                type="text"
                placeholder="e.g., groceries, essentials"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500">Separate tags with commas</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <textarea
              id="notes"
              placeholder="Additional notes about this transaction"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {transaction?.id ? "Update" : "Add"}
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}