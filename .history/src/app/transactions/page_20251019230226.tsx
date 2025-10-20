"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon
} from "@heroicons/react/24/outline";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2023-06-15", description: "Salary Deposit", category: "Income", amount: 3500.00, type: "income" },
    { id: 2, date: "2023-06-14", description: "Grocery Store", category: "Food", amount: 85.30, type: "expense" },
    { id: 3, date: "2023-06-12", description: "Electric Bill", category: "Utilities", amount: 120.75, type: "expense" },
    { id: 4, date: "2023-06-10", description: "Freelance Work", category: "Income", amount: 800.00, type: "income" },
    { id: 5, date: "2023-06-08", description: "Netflix Subscription", category: "Entertainment", amount: 15.99, type: "expense" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "expense"
  });

  const handleAddTransaction = () => {
    setShowForm(true);
    setEditingTransaction(null);
    setFormData({
      date: "",
      description: "",
      category: "",
      amount: "",
      type: "expense"
    });
  };

  const handleEditTransaction = (id: number) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setEditingTransaction(id);
      setShowForm(true);
      setFormData({
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        amount: transaction.amount.toString(),
        type: transaction.type
      });
    }
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTransaction) {
      // Update existing transaction
      setTransactions(transactions.map(t => 
        t.id === editingTransaction 
          ? { 
              ...t, 
              date: formData.date,
              description: formData.description,
              category: formData.category,
              amount: parseFloat(formData.amount),
              type: formData.type
            } 
          : t
      ));
    } else {
      // Add new transaction
      const newTransaction = {
        id: transactions.length + 1,
        date: formData.date,
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        type: formData.type
      };
      setTransactions([...transactions, newTransaction]);
    }
    
    setShowForm(false);
    setFormData({
      date: "",
      description: "",
      category: "",
      amount: "",
      type: "expense"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Track and manage your financial transactions</p>
        </div>

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
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
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
                          onClick={() => handleEditTransaction(transaction.id)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}