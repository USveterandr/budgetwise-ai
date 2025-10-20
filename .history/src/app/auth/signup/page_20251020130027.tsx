"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setError("Please select a subscription plan");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signup(name, email, password, selectedPlan);
      
      if (result.success) {
        // Redirect to dashboard after successful signup
        router.push("/dashboard");
      } else {
        setError(result.error || "Signup failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description: "Basic budgeting tools",
      features: [
        "Track up to 100 transactions/month",
        "Basic budget categories",
        "Manual data entry"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: "$9.99/month",
      description: "Advanced financial management",
      features: [
        "Unlimited transactions",
        "AI-powered insights",
        "Automatic categorization",
        "Investment tracking"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19.99/month",
      description: "Complete financial advisor",
      features: [
        "All Premium features",
        "Personalized consultations",
        "Advanced analytics",
        "Priority support"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-600">Get started with BudgetWise AI</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Signup Form */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              
              {/* Plan Selection - Required */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Select Plan <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-3 border rounded-md text-sm text-center ${
                        selectedPlan === plan.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-gray-600">{plan.price}</div>
                    </button>
                  ))}
                </div>
                {selectedPlan && (
                  <input type="hidden" name="plan" value={selectedPlan} />
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
          {/* Plan Details */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Plan Details</h2>
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`p-4 rounded-lg mb-4 ${
                  selectedPlan === plan.id ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <span className="font-bold text-gray-900">{plan.price}</span>
                </div>
                <ul className="mt-3 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            {!selectedPlan && (
              <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
                Please select a plan to continue
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}