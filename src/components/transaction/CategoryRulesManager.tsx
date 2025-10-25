"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon
} from "@heroicons/react/24/outline";

interface CategoryRule {
  id: string;
  merchant_pattern: string;
  category: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface CategoryRulesManagerProps {
  userId: string;
  onRulesChange: () => void;
}

export default function CategoryRulesManager({ userId, onRulesChange }: CategoryRulesManagerProps) {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CategoryRule | null>(null);
  const [formData, setFormData] = useState({
    merchant_pattern: "",
    category: "",
    priority: 0
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/category-rules/user/${userId}`, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setRules(result.category_rules);
      } else {
        setError(result.error || "Failed to fetch category rules");
      }
    } catch (err) {
      setError("Failed to fetch category rules");
      console.error("Error fetching category rules:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRules();
    }
  }, [userId, fetchRules]);

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      merchant_pattern: "",
      category: "",
      priority: 0
    });
    setIsFormOpen(true);
  };

  const handleEditRule = (rule: CategoryRule) => {
    setEditingRule(rule);
    setFormData({
      merchant_pattern: rule.merchant_pattern,
      category: rule.category,
      priority: rule.priority
    });
    setIsFormOpen(true);
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category rule?")) {
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/category-rules/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchRules();
        onRulesChange();
      } else {
        setError(result.error || "Failed to delete category rule");
      }
    } catch (err) {
      setError("Failed to delete category rule");
      console.error("Error deleting category rule:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ruleData = {
        user_id: userId,
        merchant_pattern: formData.merchant_pattern,
        category: formData.category,
        priority: formData.priority
      };
      
      let response;
      
      if (editingRule) {
        // Update existing rule
        response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/category-rules/${editingRule.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(ruleData),
        });
      } else {
        // Add new rule
        response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/category-rules`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(ruleData),
        });
      }
      
      const result = await response.json();
      
      if (result.success) {
        setIsFormOpen(false);
        await fetchRules();
        onRulesChange();
        setFormData({
          merchant_pattern: "",
          category: "",
          priority: 0
        });
      } else {
        setError(result.error || "Failed to save category rule");
      }
    } catch (err) {
      setError("Failed to save category rule");
      console.error("Error saving category rule:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Category Rules</h3>
        <Button 
          onClick={handleAddRule}
          className="flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Rule
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {isFormOpen && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-md font-medium mb-4">
            {editingRule ? "Edit Category Rule" : "Add New Category Rule"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="merchant_pattern" className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant Pattern
                </label>
                <Input
                  id="merchant_pattern"
                  type="text"
                  placeholder="e.g., Walmart|Target"
                  value={formData.merchant_pattern}
                  onChange={(e) => setFormData({...formData, merchant_pattern: e.target.value})}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Regex pattern to match merchant names
                </p>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Input
                  id="category"
                  type="text"
                  placeholder="e.g., Shopping"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Higher numbers have higher priority
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => setIsFormOpen(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
              >
                {editingRule ? "Update Rule" : "Add Rule"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No category rules found. Add your first rule to automatically categorize transactions.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant Pattern
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-4 py-33 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.merchant_pattern}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {rule.category}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {rule.priority}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      aria-label="Edit rule"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Delete rule"
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
    </div>
  );
}