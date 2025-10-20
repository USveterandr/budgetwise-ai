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
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
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
        // Show confirmation message instead of redirecting to dashboard
        setShowConfirmationMessage(true);
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
      id: "trial",
      name: "Free Trial",
      price: "$0.00 for 14 days",
      description: "Full access to all features for 14 days",
      features: [
        "Full access to all features",
        "Unlimited transactions",
        "AI-powered insights",
        "Automatic categorization",
        "Investment tracking",
        "Budget management",
        "Priority support during trial"
      ],
      isTrial: true
    },
    {
      id: "basic",
      name: "Basic",
      price: "$9.97/month",
      discountedPrice: "$8.47/month",
      discount: "15% off",
      description: "Essential budgeting tools",
      features: [
        "Track up to 500 transactions/month",
        "Basic budget categories",
        "Manual data entry",
        "Email support"
      ],
      annualPaymentRequired: true,
      annualDisclosure: "Must pay 12 months in advance ($101.64 total)"
    },
    {
      id: "premium",
      name: "Premium",
      price: "$19.97/month",
      discountedPrice: "$15.97/month",
      discount: "20% off",
      description: "Advanced financial management",
      features: [
        "Unlimited transactions",
        "AI-powered insights",
        "Automatic categorization",
        "Investment tracking",
        "Priority email support"
      ],
      annualPaymentRequired: true,
      annualDisclosure: "Must pay 12 months in advance ($191.64 total)"
    },
    {
      id: "premium-annual",
      name: "Premium Annual",
      price: "$49.97 for 12 months",
      discountedPrice: "$34.97/month",
      discount: "30% off with annual payment",
      description: "Complete financial advisor (12 months in advance)",
      features: [
        "All Premium features",
        "Personalized consultations",
        "Advanced analytics",
        "24/7 priority support",
        "Exclusive financial reports"
      ],
      annualPayment: true,
      annualDisclosure: "Must pay 12 months in advance ($49.97 total)"
    }
  ];

  if (showConfirmationMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                We&apos;ve sent a confirmation email to <span className="font-medium">{email}</span>. 
                Please click the link in the email to verify your account and complete your registration.
              </p>
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-sm text-blue-700">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button 
                    onClick={() => setShowConfirmationMessage(false)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
              <Button 
                onClick={() => router.push("/auth/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-900"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-900"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-900"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-900"
                  required
                />
              </div>
              
              {/* Plan Selection - Required */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Select Plan <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      {plan.isTrial ? (
                        <div className="text-gray-900 font-medium">{plan.price}</div>
                      ) : (
                        <>
                          <div className="text-gray-600 line-through text-xs">{plan.price}</div>
                          <div className="text-gray-900 font-medium">{plan.discountedPrice}</div>
                          <div className="text-green-600 text-xs">{plan.discount}</div>
                        </>
                      )}
                      {(plan.annualPayment || plan.annualPaymentRequired) && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">{plan.annualDisclosure}</div>
                      )}
                      {plan.isTrial && (
                        <div className="text-xs text-green-600 mt-1">14-day free trial</div>
                      )}
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
                    {(plan.annualPayment || plan.annualPaymentRequired) && (
                      <div className="text-xs text-blue-600 mt-1 font-medium">{plan.annualDisclosure}</div>
                    )}
                    {plan.isTrial && (
                      <div className="text-xs text-green-600 mt-1">14-day free trial</div>
                    )}
                  </div>
                  <div className="text-right">
                    {plan.isTrial ? (
                      <div className="font-bold text-gray-900">{plan.price}</div>
                    ) : (
                      <>
                        <div className="line-through text-gray-500 text-sm">{plan.price}</div>
                        <div className="font-bold text-gray-900">{plan.discountedPrice}</div>
                        <div className="text-green-600 text-xs">{plan.discount}</div>
                      </>
                    )}
                  </div>
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