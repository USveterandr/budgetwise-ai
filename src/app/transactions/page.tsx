"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import TransactionSearch from "@/components/transaction/TransactionSearch";
import TransactionBulkActions from "@/components/transaction/TransactionBulkActions";
import CategoryRulesManager from "@/components/transaction/CategoryRulesManager";
import TransactionAnalytics from "@/components/transaction/TransactionAnalytics";
import TransactionForm from "@/components/transaction/TransactionForm";

import { Transaction, TransactionFormData } from "@/types/transaction";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  isAdmin: boolean;
  emailVerified: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "expense" as "income" | "expense"
  });
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCategoryRules, setShowCategoryRules] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});

  const [user, setUser] = useState<User | null>(null);

  // Get current user on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/auth-client').then((module) => {
        setUser(module.getCurrentUser());
      });
    }
  }, []);

  // Fetch transactions when component mounts
  const fetchTransactions = useCallback(async (filters = searchFilters) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // If filters are provided, use search endpoint
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams({
          user_id: user.id,
          ...filters
        });
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/search?${queryParams}`, {
          headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success) {
          setTransactions(result.transactions);
        } else {
          setError(result.error || "Failed to fetch transactions");
        }
      } else {
        // Otherwise, use the original endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/user/${user.id}`, {
          headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success) {
          setTransactions(result.transactions);
        } else {
          setError(result.error || "Failed to fetch transactions");
        }
      }
    } catch (err) {
      setError("Failed to fetch transactions");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [user, searchFilters]);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && user) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [user, fetchTransactions]);

  const handleAddTransaction = () => {
    setShowForm(true);
    setEditingTransaction(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      category: "",
      amount: "",
      type: "expense"
    });
  };
  
  interface SearchFilters {
    query?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: string;
    minAmount?: string;
    maxAmount?: string;
    sortBy?: string;
    sortOrder?: string;
  }
  
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    fetchTransactions(filters);
  };
  
  const handleBulkDelete = async (transactionIds: string[]) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/bulk-delete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ transaction_ids: transactionIds }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh transactions
        await fetchTransactions();
        setSelectedTransactions([]);
      } else {
        setError(result.error || "Failed to delete transactions");
      }
    } catch (err) {
      setError("Failed to delete transactions");
      console.error("Error deleting transactions:", err);
    }
  };
  
  interface BulkUpdateData {
    category?: string;
    type?: "income" | "expense";
  }
  
  const handleBulkUpdate = async (transactionIds: string[], updates: BulkUpdateData) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/bulk-update`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ transaction_ids: transactionIds, updates }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh transactions
        await fetchTransactions();
        setSelectedTransactions([]);
      } else {
        setError(result.error || "Failed to update transactions");
      }
    } catch (err) {
      setError("Failed to update transactions");
      console.error("Error updating transactions:", err);
    }
  };
  
  const handleExport = (transactionIds: string[]) => {
    // In a real implementation, this would export the selected transactions
    alert(`Exporting ${transactionIds.length} transactions`);
  };
  
  const handleSelectTransaction = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(transactionId => transactionId !== id));
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.filter(t => t.id !== undefined).map(t => t.id as string));
    }
  };
  
  const handleSubmitTransaction = (transactionData: TransactionFormData) => {
    // Handle the transaction submission asynchronously but don't make the function itself async
    (async () => {
      if (!user) return;
      
      try {
        let response;
        
        if (transactionData.id) {
          // Update existing transaction
          response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/${transactionData.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(transactionData),
          });
        } else {
          // Add new transaction
          response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(transactionData),
          });
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Refresh transactions
          await fetchTransactions();
          setShowForm(false);
        } else {
          setError(result.error || "Failed to save transaction");
        }
      } catch (err) {
        setError("Failed to save transaction");
        console.error("Error saving transaction:", err);
      }
    })();
  };
  
  const handleRulesChange = () => {
    // Refresh transactions to apply new category rules
    fetchTransactions();
  };
  
  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };
  
  const toggleCategoryRules = () => {
    setShowCategoryRules(!showCategoryRules);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction.id || null);
    setShowForm(true);
    setFormData({
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount.toString(),
      type: transaction.type
    });
  };
  
  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh transactions
        await fetchTransactions();
      } else {
        setError(result.error || "Failed to delete transaction");
      }
    } catch (err) {
      setError("Failed to delete transaction");
      console.error("Error deleting transaction:", err);
    }
  };
  
  const handleCancelTransaction = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };
  




  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600">Track and manage your financial transactions</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={toggleAnalytics}
                variant="outline"
                className="flex items-center text-sm"
              >
                <ChartBarIcon className="h-4 w-4 mr-1" />
                Analytics
              </Button>
              <Button 
                onClick={toggleCategoryRules}
                variant="outline"
                className="flex items-center text-sm"
              >
                <CogIcon className="h-4 w-4 mr-1" />
                Rules
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <TransactionSearch onSearch={handleSearch} />
        
        {showAnalytics && user && (
          <TransactionAnalytics userId={user.id} />
        )}
        
        {showCategoryRules && user && (
          <CategoryRulesManager userId={user.id} onRulesChange={handleRulesChange} />
        )}
        
        <TransactionBulkActions 
          selectedTransactions={selectedTransactions}
          onBulkDelete={handleBulkDelete}
          onBulkUpdate={handleBulkUpdate}
          onExport={handleExport}
        />
        
        <div className="mb-6">
          <Button 
            onClick={handleAddTransaction}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Transaction
          </Button>
        </div>

        {showForm && user && (
          <TransactionForm 
            userId={user.id}
            transaction={editingTransaction ? transactions.find(t => t.id === editingTransaction) : undefined}
            onSubmit={handleSubmitTransaction}
            onCancel={handleCancelTransaction}
          />
        )}

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found. Add your first transaction to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                            aria-label="Edit transaction"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-900"
                            aria-label="Delete transaction"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TransactionsPage;
