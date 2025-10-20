"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    // TODO: integrate Cloudflare D1 auth
    setUser({ name: "Alex" });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <header className="text-center py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to BudgetWise AI
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track, analyze, and grow your wealth with AI-powered insights.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardTitle className="text-2xl">Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Net Worth</span>
                  <span className="text-2xl font-bold text-gray-900">$42,567.89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Income</span>
                  <span className="text-2xl font-bold text-green-600">$5,230.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Expenses</span>
                  <span className="text-2xl font-bold text-red-600">$3,845.50</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardTitle className="text-2xl">Get Started</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-lg">
                  👋 Hello {user?.name ?? "Guest"}!
                </p>
                <p>Start managing your finances smarter today.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg">
                  Connect Bank Account
                </Button>
                <Link href="/dashboard" className="block text-center text-blue-600 hover:underline">
                  Go to Dashboard
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <FeatureCard 
              title="AI Budget Advisor" 
              description="Get personalized budgeting advice from our AI assistant" 
              icon="🤖"
            />
            <FeatureCard 
              title="Investment Tracking" 
              description="Monitor your portfolio performance and get insights" 
              icon="📈"
            />
            <FeatureCard 
              title="Financial Consultation" 
              description="Schedule a free 30-minute session with a certified advisor" 
              icon="🧓"
            />
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card className="shadow-md rounded-xl hover:shadow-lg transition-shadow">
      <CardContent className="p-6 text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}