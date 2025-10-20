"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ChartBarIcon, 
  WalletIcon, 
  ArrowTrendingUpIcon, 
  CreditCardIcon,
  BellIcon,
  UserIcon,
  CurrencyDollarIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";

export default function HomePage() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    // TODO: integrate Cloudflare D1 auth
    setUser({ name: "Alex" });
  }, []);

  const features = [
    {
      icon: <WalletIcon className="h-8 w-8 text-blue-500" />,
      title: "Expense Tracking",
      description: "Automatically categorize and track all your spending"
    },
    {
      icon: <ChartBarIcon className="h-8 w-8 text-green-500" />,
      title: "Budget Management",
      description: "Set budgets and get real-time progress tracking"
    },
    {
      icon: <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500" />,
      title: "Investment Tracking",
      description: "Monitor your portfolio performance and get insights"
    },
    {
      icon: <CreditCardIcon className="h-8 w-8 text-yellow-500" />,
      title: "Subscription Management",
      description: "Track recurring payments and identify savings opportunities"
    },
    {
      icon: <LightBulbIcon className="h-8 w-8 text-indigo-500" />,
      title: "AI Budget Advisor",
      description: "Get personalized financial recommendations from our AI assistant"
    },
    {
      icon: <UserIcon className="h-8 w-8 text-red-500" />,
      title: "Financial Consultation",
      description: "Schedule sessions with certified advisors (first 30 minutes free)"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Basic expense tracking",
        "Manual budget management",
        "Up to 100 transactions/month"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Standard",
      price: "$14.99",
      period: "per month",
      features: [
        "All Free features",
        "AI categorization",
        "Investment tracking",
        "Subscription management",
        "Up to 1,000 transactions/month"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Premium",
      price: "$24.99",
      period: "per month",
      features: [
        "All Standard features",
        "AI Budget Advisor",
        "Priority support",
        "Unlimited transactions",
        "Advanced analytics"
      ],
      cta: "Start Free Trial",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your AI Financial Advisor
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Track, analyze, and grow your wealth with AI-powered insights. 
            Take control of your finances with personalized recommendations.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              <Link href="/auth/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-3 text-lg">
              <Link href="/dashboard">View Demo</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Financial Tools</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to take control of your finances and build wealth
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with our free plan and upgrade as you grow
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 rounded-2xl' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <Card className="h-full shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">{plan.name}</CardTitle>
                  <div className="text-center my-4">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    asChild 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'} text-white`}
                  >
                    <Link href="/auth/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl my-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Take Control of Your Finances?</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            Join thousands of users who are already building wealth with BudgetWise AI
          </p>
          <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-bold">
            <Link href="/auth/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}