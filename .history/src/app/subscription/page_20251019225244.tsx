"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CreditCardIcon,
  CalendarIcon,
  BellIcon
} from "@heroicons/react/24/outline";

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([
    { id: 1, name: "Netflix", amount: 15.99, nextPaymentDate: "2023-07-15", autoRenew: true, category: "Entertainment" },
    { id: 2, name: "Spotify", amount: 9.99, nextPaymentDate: "2023-07-10", autoRenew: true, category: "Entertainment" },
    { id: 3, name: "Amazon Prime", amount: 12.99, nextPaymentDate: "2023-07-20", autoRenew: true, category: "Shopping" },
    { id: 4, name: "Adobe Creative Cloud", amount: 52.99, nextPaymentDate: "2023-07-05", autoRenew: true, category: "Software" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    nextPaymentDate: "",
    autoRenew: true,
    category: ""
  });

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  const handleAddSubscription = () => {
    setShowForm(true);
    setEditingSubscription(null);
    setFormData({
      name: "",
      amount: "",
      nextPaymentDate: "",
      autoRenew: true,
      category: ""
    });
  };

  const handleEditSubscription = (id: number) => {
    const subscription = subscriptions.find(s => s.id === id);
    if (subscription) {
      setEditingSubscription(id);
      setShowForm(true);
      setFormData({
        name: subscription.name,
        amount: subscription.amount.toString(),
        nextPaymentDate: subscription.nextPaymentDate,
        autoRenew: subscription.autoRenew,
        category: subscription.category
      });
    }
  };

  const handleDeleteSubscription = (id: number) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubscription) {
      // Update existing subscription
      setSubscriptions(subscriptions.map(s => 
        s.id === editingSubscription 
          ? { 
              ...s, 
              name: formData.name,
              amount: parseFloat(formData.amount),
              nextPaymentDate: formData.nextPaymentDate,
              autoRenew: formData.autoRenew,
              category: formData.category
            } 
          : s
      ));
    } else {
      // Add new subscription
      const newSubscription = {
        id: subscriptions.length + 1,
        name: formData.name,
        amount: parseFloat(formData.amount),
        nextPaymentDate: formData.nextPaymentDate,
        autoRenew: formData.autoRenew,
        category: formData.category
      };
      setSubscriptions([...subscriptions, newSubscription]);
    }
    
    setShowForm(false);
    setFormData({
      name: "",
      amount: "",
      nextPaymentDate: "",
      autoRenew: true,
      category: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Track and manage your recurring subscriptions</p>
        </div>

        {/* Subscription Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Subscriptions</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{subscriptions.length}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <CreditCardIcon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Cost</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">${totalMonthlyCost.toFixed(2)}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <BellIcon className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Annual Cost</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">${(totalMonthlyCost * 12).toFixed(2)}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <CalendarIcon className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Button 
            onClick={handleAddSubscription}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Subscription
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 shadow">
            <CardHeader>
              <CardTitle>
                {editingSubscription ? "Edit Subscription" : "Add New Subscription"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Subscription Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g., Netflix, Spotify"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <input
                      id="category"
                      type="text"
                      placeholder="e.g., Entertainment, Software"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">Monthly Amount ($)</label>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 15.99"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="nextPaymentDate" className="text-sm font-medium">Next Payment Date</label>
                    <input
                      id="nextPaymentDate"
                      type="date"
                      value={formData.nextPaymentDate}
                      onChange={(e) => setFormData({...formData, nextPaymentDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="autoRenew"
                        type="checkbox"
                        checked={formData.autoRenew}
                        onChange={(e) => setFormData({...formData, autoRenew: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="autoRenew" className="ml-2 block text-sm text-gray-900">
                        Auto-renew subscription
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingSubscription ? "Update Subscription" : "Add Subscription"}
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

        <Card className="shadow">
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Cost
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Payment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auto-Renew
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{subscription.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscription.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${subscription.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscription.nextPaymentDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscription.autoRenew ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditSubscription(subscription.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          aria-label="Edit subscription"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(subscription.id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Delete subscription"
                        >
                          <TrashIcon className="h-5 w-5" />
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