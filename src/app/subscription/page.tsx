"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CreditCardIcon, 
  CheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  isAdmin: boolean;
  emailVerified: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  limitations: string[];
}

interface Subscription {
  plan: string;
  status: string;
  startDate: string;
  nextBillingDate: string | null;
  autoRenew: boolean;
  features: string[];
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);

  // Get current user on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/auth-client').then((module) => {
        setUser(module.getCurrentUser());
      });
    }
  }, []);

  // Fetch subscription data when component mounts
  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscription');
      const result = await response.json();
      
      if (result.success) {
        setCurrentSubscription(result.subscription);
      } else {
        setError(result.error || 'Failed to fetch subscription data');
      }
    } catch (err) {
      setError('Failed to fetch subscription data');
      console.error('Error fetching subscription data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const result = await response.json();
      
      if (result.success) {
        setPlans(result.plans);
      } else {
        setError(result.error || 'Failed to fetch plans');
      }
    } catch (err) {
      setError('Failed to fetch plans');
      console.error('Error fetching plans:', err);
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && user) {
      fetchSubscriptionData();
      fetchPlans();
    } else {
      setLoading(false);
    }
  }, [user, fetchSubscriptionData, fetchPlans]);

  const upgradePlan = async (planId: string) => {
    try {
      setUpgrading(true);
      setError(null);
      
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPlanId: planId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh subscription data
        await fetchSubscriptionData();
        alert('Subscription upgraded successfully!');
      } else {
        setError(result.error || 'Failed to upgrade subscription');
      }
    } catch (err) {
      setError('Failed to upgrade subscription');
      console.error('Error upgrading subscription:', err);
    } finally {
      setUpgrading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }
    
    // In a real implementation, this would call an API to cancel the subscription
    alert('Subscription cancellation would be processed here.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription plan and billing information</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {plans.find(p => p.id === currentSubscription.plan)?.name || 'Unknown Plan'}
                  </h3>
                  <p className="text-gray-500">
                    Status: <span className="capitalize">{currentSubscription.status}</span>
                  </p>
                  <p className="text-gray-500">
                    Started: {formatDate(currentSubscription.startDate)}
                  </p>
                  {currentSubscription.nextBillingDate && (
                    <p className="text-gray-500">
                      Next billing: {formatDate(currentSubscription.nextBillingDate)}
                    </p>
                  )}
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={cancelSubscription}
                    disabled={currentSubscription.plan === 'trial'}
                  >
                    Cancel Subscription
                  </Button>
                  <Button
                    onClick={() => fetchSubscriptionData()}
                    variant="outline"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Comparison */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`flex flex-col ${
                    currentSubscription?.plan === plan.id 
                      ? 'border-blue-500 ring-2 ring-blue-500' 
                      : ''
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      {plan.period !== 'forever' && (
                        <span className="text-gray-500">/{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start text-gray-400">
                          <span className="text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Button
                      onClick={() => upgradePlan(plan.id)}
                      disabled={
                        upgrading || 
                        currentSubscription?.plan === plan.id ||
                        (currentSubscription?.plan === 'premium' && plan.id === 'basic') ||
                        (currentSubscription?.plan === 'premium-annual' && (plan.id === 'basic' || plan.id === 'premium'))
                      }
                      className="w-full"
                    >
                      {currentSubscription?.plan === plan.id ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="mt-6 shadow-sm">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Billing History
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Billing History</h3>
              <p className="text-gray-500">
                Your billing history will appear here once you have active subscriptions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}