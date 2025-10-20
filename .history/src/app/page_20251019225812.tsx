"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    // TODO: integrate Cloudflare D1 auth
    setUser({ name: "Alex" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your AI Financial Advisor
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Track, analyze, and grow your wealth with AI-powered insights. 
            Simple, elegant, effective.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" className="px-6 py-2.5">
              <Link href="/dashboard">View Demo</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Financial Tools That Work</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to take control of your finances
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            title="Expense Tracking" 
            description="Automatically categorize and track all your spending"
          />
          <FeatureCard 
            title="Budget Management" 
            description="Set budgets and get real-time progress tracking"
          />
          <FeatureCard 
            title="Investment Tracking" 
            description="Monitor your portfolio performance and get insights"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Ready to Take Control?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Join thousands of users who are already building wealth with BudgetWise AI
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5">
          <Link href="/auth/signup">Start Free Trial</Link>
        </Button>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
