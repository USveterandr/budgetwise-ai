"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth";

// Define the transaction type
interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function TransactionsPage() {
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

  const user = getCurrentUser();

  // Fetch transactions when component mounts
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/user/${user.id}`, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setTransactions(result.transactions);
      } else {
        setError(result.error || "Failed to fetch transactions");
      }
    } catch (err) {
      setError("Failed to fetch transactions");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction.id);
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
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove transaction from state
        setTransactions(transactions.filter(t => t.id !== id));
      } else {
        setError(result.error || "Failed to delete transaction");
      }
    } catch (err) {
      setError("Failed to delete transaction");
      console.error("Error deleting transaction:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      const transactionData = {
        user_id: user.id,
        date: formData.date,
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        type: formData.type,
        receipt_url: null
      };
      
      let response;
      
      if (editingTransaction) {
        // Update existing transaction
        response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/${editingTransaction}`, {
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
        setFormData({
          date: "",
          description: "",
          category: "",
          amount: "",
          type: "expense"
        });
      } else {
        setError(result.error || "Failed to save transaction");
      }
    } catch (err) {
      setError("Failed to save transaction");
      console.error("Error saving transaction:", err);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Track and manage your financial transactions</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <Button 
            onClick={handleAddTransaction}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Transaction
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle>
                {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
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
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <input
                      id="category"
                      type="text"
                      placeholder="e.g., Food"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">Amount ($)</label>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 50.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    {editingTransaction ? "Update" : "Add"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
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