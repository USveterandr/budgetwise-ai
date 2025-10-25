"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowRightIcon,
  ChartBarIcon,
  LightBulbIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";
import { getCurrentUser } from '@/lib/auth-client';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section - Hypnotic & Luxury */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full border border-purple-500/30 mb-8">
            <SparklesIcon className="h-5 w-5 text-purple-300 mr-2" />
            <span className="text-sm font-medium text-purple-200">AI-Powered Financial Intelligence</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200">
            Transform Your <span className="text-purple-300">Financial Future</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience the future of personal finance with our AI-powered platform that analyzes, predicts, and optimizes your wealth journey in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <Link href="/auth/signup" className="w-full h-full flex items-center justify-center">
                Start Building Wealth
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
              <Link href="/auth/login" className="w-full h-full flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Secure Login
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-white"></div>
              </div>
              <span className="ml-3 text-sm">Join 10,000+ satisfied users</span>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-sm">Average savings increase: 32%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Luxury & Inviting */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-white/5 backdrop-blur-sm rounded-3xl mx-4 mb-24 border border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Elevate Your Financial Intelligence</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Sophisticated tools designed for the modern investor
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<ChartBarIcon className="h-10 w-10 text-purple-400" />}
            title="AI-Powered Insights" 
            description="Our advanced algorithms analyze your spending patterns and provide personalized recommendations to optimize your financial health."
            gradient="from-purple-500/20 to-indigo-500/20"
          />
          <FeatureCard 
            icon={<LightBulbIcon className="h-10 w-10 text-indigo-400" />}
            title="Predictive Analytics" 
            description="Forecast your financial future with machine learning models that predict market trends and spending behaviors."
            gradient="from-indigo-500/20 to-blue-500/20"
          />
          <FeatureCard 
            icon={<ShieldCheckIcon className="h-10 w-10 text-pink-400" />}
            title="Bank-Level Security" 
            description="Military-grade encryption and zero-knowledge architecture ensure your financial data remains private and secure."
            gradient="from-pink-500/20 to-rose-500/20"
          />
        </div>
      </div>

      {/* Testimonial Section - Social Proof */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Financial Experts</h2>
          <p className="text-xl text-gray-300">See what our users are saying about their experience</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto">
          <div className="text-5xl text-purple-400 mb-6">&ldquo;</div>
          <blockquote className="text-xl md:text-2xl text-gray-200 mb-8 italic">
            BudgetWise AI transformed how I manage my finances. The predictive insights helped me save 40% more than I ever thought possible.
          </blockquote>
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl mr-4">SJ</div>
            <div className="text-left">
              <div className="font-bold text-white">Sarah Johnson</div>
              <div className="text-gray-400">Financial Advisor, NYC</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Strong & Inviting */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center mb-24">
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Financial Future?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Join thousands of users who have already started building lasting wealth with our AI-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-5 text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <Link href="/auth/signup" className="w-full h-full flex items-center justify-center">
                Start Your Free Trial
                <ArrowRightIcon className="h-6 w-6 ml-3" />
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center text-gray-400">
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            <span className="text-sm">No credit card required • 14-day free trial • Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className={`p-8 rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl`}>
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}