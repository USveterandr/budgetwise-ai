"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon 
} from "@heroicons/react/24/outline";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([
    { id: 1, category: "Housing", limit: 1500, spent: 1200, percentage: 80 },
    { id: 2, category: "Food", limit: 600, spent: 450, percentage: 75 },
    { id: 3, category: "Transportation", limit: 300, spent: 200, percentage: 67 },
    { id: 4, category: "Entertainment", limit: 200, spent: 150, percentage: 75 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    limit: ""
  });

  const handleAddBudget = () => {
    setShowForm(true);
    setEditingBudget(null);
    setFormData({ category: "", limit: "" });
  };

  const handleEditBudget = (id: number) => {
    const budget = budgets.find(b => b.id === id);
    if (budget) {
      setEditingBudget(id);
      setShowForm(true);
      setFormData({
        category: budget.category,
        limit: budget.limit.toString()
      });
    }
  };

  const handleDeleteBudget = (id: number) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBudget) {
      // Update existing budget
      setBudgets(budgets.map(b => 
        b.id === editingBudget 
          ? { ...b, category: formData.category, limit: parseFloat(formData.limit) } 
          : b
      ));
    } else {
      // Add new budget
      const newBudget = {
        id: budgets.length + 1,
        category: formData.category,
        limit: parseFloat(formData.limit),
        spent: 0,
        percentage: 0
      };
      setBudgets([...budgets, newBudget]);
    }
    
    setShowForm(false);
    setFormData({ category: "", limit: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">Set and track your spending limits</p>
        </div>

        <div className="mb-6">
          <Button 
            onClick={handleAddBudget}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Budget
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 shadow">
            <CardHeader>
              <CardTitle>
                {editingBudget ? "Edit Budget" : "Create New Budget"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <input
                      id="category"
                      type="text"
                      placeholder="e.g., Housing, Food, Entertainment"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="limit" className="text-sm font-medium">Monthly Limit ($)</label>
                    <input
                      id="limit"
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.limit}
                      onChange={(e) => setFormData({...formData, limit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingBudget ? "Update Budget" : "Create Budget"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <Card key={budget.id} className="shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{budget.category}</CardTitle>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditBudget(budget.id)}
                      className="text-gray-500 hover:text-blue-600"
                      aria-label="Edit budget"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-gray-500 hover:text-red-600"
                      aria-label="Delete budget"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        ${budget.spent.toFixed(2)} spent
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        ${budget.limit.toFixed(2)} limit
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          budget.percentage > 90 ? 'bg-red-600' : 
                          budget.percentage > 75 ? 'bg-yellow-500' : 'bg-blue-600'
                        }`} 
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {budget.percentage.toFixed(0)}% of budget used
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}