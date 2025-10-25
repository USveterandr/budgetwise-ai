"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon 
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  isAdmin: boolean;
  emailVerified: boolean;
}

interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  percentage?: number;
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    limit_amount: ""
  });

  const [user, setUser] = useState<User | null>(null);

  // Get current user on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/auth-client').then((module) => {
        setUser(module.getCurrentUser());
      });
    }
  }, []);

  // Fetch budgets when component mounts
  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/budgets');
      const result = await response.json();
      
      if (result.success) {
        // Calculate percentage for each budget
        const budgetsData = result.budgets.map((budget: Budget) => ({
          ...budget,
          percentage: budget.limit_amount > 0 ? (budget.spent_amount / budget.limit_amount) * 100 : 0
        }));
        setBudgets(budgetsData);
      } else {
        setError(result.error || 'Failed to fetch budgets');
      }
    } catch (err) {
      setError('Failed to fetch budgets');
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && user) {
      fetchBudgets();
    } else {
      setLoading(false);
    }
  }, [user, fetchBudgets]);

  const handleAddBudget = () => {
    setShowForm(true);
    setEditingBudget(null);
    setFormData({ category: "", limit_amount: "" });
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget.id);
    setShowForm(true);
    setFormData({
      category: budget.category,
      limit_amount: budget.limit_amount.toString()
    });
  };

  const handleDeleteBudget = async (id: string) => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to delete this budget?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh budgets
        await fetchBudgets();
      } else {
        setError(result.error || 'Failed to delete budget');
      }
    } catch (err) {
      setError('Failed to delete budget');
      console.error('Error deleting budget:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      let response;
      
      if (editingBudget) {
        // Update existing budget
        response = await fetch(`/api/budgets/${editingBudget}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            limit_amount: parseFloat(formData.limit_amount)
          }),
        });
      } else {
        // Add new budget
        response = await fetch('/api/budgets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: formData.category,
            limit_amount: parseFloat(formData.limit_amount)
          }),
        });
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh budgets
        await fetchBudgets();
        setShowForm(false);
        setFormData({ category: "", limit_amount: "" });
      } else {
        setError(result.error || 'Failed to save budget');
      }
    } catch (err) {
      setError('Failed to save budget');
      console.error('Error saving budget:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">Set and track your spending limits</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <Button 
            onClick={handleAddBudget}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Budget
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle>
                {editingBudget ? "Edit Budget" : "Create New Budget"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingBudget && (
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <input
                      id="category"
                      type="text"
                      placeholder="e.g., Housing"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="limit_amount" className="text-sm font-medium">Monthly Limit ($)</label>
                  <input
                    id="limit_amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 500"
                    value={formData.limit_amount}
                    onChange={(e) => setFormData({...formData, limit_amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    {editingBudget ? "Update" : "Create"}
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

        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No budgets found. Create your first budget to get started.</p>
            <Button 
              onClick={handleAddBudget}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Budget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((budget) => (
              <Card key={budget.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">{budget.category}</h3>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEditBudget(budget)}
                        className="text-gray-500 hover:text-blue-600"
                        aria-label="Edit budget"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-gray-500 hover:text-red-600"
                        aria-label="Delete budget"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        ${budget.spent_amount.toFixed(2)} spent
                      </span>
                      <span className="text-gray-600">
                        ${budget.limit_amount.toFixed(2)} limit
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (budget.percentage || 0) > 90 ? 'bg-red-500' : 
                          (budget.percentage || 0) > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} 
                        style={{ width: `${Math.min(budget.percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {(budget.percentage || 0).toFixed(0)}% of budget used
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
