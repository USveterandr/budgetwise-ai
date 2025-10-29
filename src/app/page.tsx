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
  AcademicCapIcon,
  ClockIcon,
  FireIcon,
  UserGroupIcon,
  BoltIcon,
  GiftIcon
} from "@heroicons/react/24/outline";
// import { getCurrentUser } from '@/lib/auth-client'; // Not used in this file

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    setIsVisible(true);
    
    // Set timer for limited time offer (12 hours from now - increased urgency)
    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(now.getTime() + (12 * 60 * 60 * 1000)); // 12 hours from now (increased urgency)
      
      const difference = endTime.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Enhanced Animated background elements for hypnotic effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Pulsing gradient circles for hypnotic effect */}
        <div className="absolute -top-1/3 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse-glow hidden sm:block"></div>
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-25 animate-hypnotic-pulse animation-delay-2000 hidden sm:block"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-hypnotic-pulse animation-delay-4000 hidden sm:block"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-15 animate-pulse hidden sm:block"></div>
        
        {/* Additional hypnotic elements */}
        <div className="absolute top-1/5 left-1/6 w-48 h-48 bg-cyan-500 rounded-full mix-blend-soft-light filter blur-2xl opacity-20 animate-pulse-glow animation-delay-1000 hidden sm:block"></div>
        <div className="absolute bottom-1/3 right-1/5 w-56 h-56 bg-violet-500 rounded-full mix-blend-soft-light filter blur-2xl opacity-15 animate-hypnotic-pulse animation-delay-3000 hidden sm:block"></div>
        
        {/* Floating particles for extra hypnotic effect */}
        <div className="absolute top-1/4 left-1/5 w-4 h-4 bg-white rounded-full opacity-10 animate-float animation-delay-1000 hidden sm:block"></div>
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-purple-300 rounded-full opacity-15 animate-float animation-delay-2000 hidden sm:block"></div>
        <div className="absolute bottom-1/4 left-2/3 w-2 h-2 bg-pink-300 rounded-full opacity-20 animate-float animation-delay-3500 hidden sm:block"></div>
        
        {/* New hypnotic wave effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-wave hidden sm:block"></div>
      </div>

      {/* Hero Section - Hypnotic & Luxury */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Limited Time Offer Badge */}
          <div className="inline-flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full border border-red-400/30 mb-4 animate-pulse sm:mb-6">
            <FireIcon className="h-4 w-4 text-white mr-1.5 sm:mr-2" />
            <span className="text-xs font-bold text-white sm:text-sm">LIMITED TIME: 50% OFF ANNUAL PLANS</span>
            <FireIcon className="h-4 w-4 text-white ml-1.5 sm:ml-2" />
          </div>
          
          {/* Urgency Timer */}
          <div className="inline-flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full border border-purple-500/30 mb-4 sm:mb-6">
            <ClockIcon className="h-4 w-4 text-purple-300 mr-1.5 sm:mr-2" />
            <span className="text-xs font-medium text-purple-200 sm:text-sm">
              Offer ends in: 
              <span className="ml-1.5 font-bold sm:ml-2">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </span>
          </div>
          
          <div className="inline-flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full border border-purple-500/30 mb-6 sm:mb-8">
            <SparklesIcon className="h-4 w-4 text-purple-300 mr-1.5 sm:mr-2" />
            <span className="text-xs font-medium text-purple-200 sm:text-sm">#1 AI-Powered Finance App</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200 leading-tight">
            <span className="block">Transform Your</span>
            <span className="block text-purple-300">Financial Future</span>
            <span className="block">With AI Precision</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed">
            Join 50,000+ financially savvy users who&apos;ve unlocked their wealth potential with our cutting-edge AI platform. 
            Save hours weekly, invest smarter, and achieve financial freedom faster than ever before.
          </p>
          
          {/* Stronger CTAs with urgency */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-base sm:text-xl animate-pulse-glow mobile-button">
              <Link href="/auth/signup" className="w-full h-full flex items-center justify-center">
                <GiftIcon className="h-4 w-4 mr-1.5 sm:mr-2 sm:h-5 sm:w-5" />
                Start Free 7-Day Trial
                <ArrowRightIcon className="h-4 w-4 ml-1.5 sm:ml-2 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 mobile-button">
              <Link href="/auth/login" className="w-full h-full flex items-center justify-center">
                <ShieldCheckIcon className="h-4 w-4 mr-1.5 sm:mr-2 sm:h-5 sm:w-5" />
                Existing User? Login
              </Link>
            </Button>
          </div>
          
          {/* Social proof with stronger numbers */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-300 mb-6 sm:mb-8">
            <div className="flex items-center">
              <div className="flex -space-x-1 sm:-space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-white"></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 border-2 border-white"></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-white"></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-white"></div>
              </div>
              <span className="ml-2 text-sm sm:text-base font-bold">50,000+ Active Users</span>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-1.5 sm:mr-2" />
              <span className="text-sm sm:text-base font-bold">Average Savings: 42%</span>
            </div>
          </div>
          
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400">
            <span className="flex items-center">
              <ShieldCheckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 mr-1" />
              Bank-Level Security
            </span>
            <span className="flex items-center">
              <AcademicCapIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 mr-1" />
              Trusted by Financial Experts
            </span>
            <span className="flex items-center">
              <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 mr-1" />
              AI-Powered Insights
            </span>
            <span className="flex items-center">
              <BoltIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 mr-1" />
              Lightning Fast Results
            </span>
          </div>
        </div>
      </div>

      {/* Features Section - Luxury & Inviting */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl mx-4 sm:mx-6 mb-16 sm:mb-24 border border-white/10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Why BudgetWise is a Must-Have App</h2>
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Sophisticated tools designed for the modern investor
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard 
            icon={<ChartBarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />}
            title="AI-Powered Insights" 
            description="Advanced algorithms analyze your spending patterns and provide personalized recommendations to optimize your financial health in real-time."
            gradient="from-purple-500/20 to-indigo-500/20"
          />
          <FeatureCard 
            icon={<LightBulbIcon className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400" />}
            title="Predictive Analytics" 
            description="Forecast your financial future with machine learning models that predict market trends and spending behaviors with 92% accuracy."
            gradient="from-indigo-500/20 to-blue-500/20"
          />
          <FeatureCard 
            icon={<ShieldCheckIcon className="h-8 w-8 sm:h-10 sm:w-10 text-pink-400" />}
            title="Bank-Level Security" 
            description="Military-grade 256-bit encryption and zero-knowledge architecture ensure your financial data remains private and secure."
            gradient="from-pink-500/20 to-rose-500/20"
          />
        </div>
      </div>

      {/* Testimonial Section - Social Proof */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Trusted by Financial Experts</h2>
          <p className="text-base sm:text-xl text-gray-300">See what our users are saying about their experience</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10 max-w-4xl mx-auto">
          <div className="text-3xl sm:text-5xl text-purple-400 mb-4 sm:mb-6">&ldquo;</div>
          <blockquote className="text-base sm:text-xl md:text-2xl text-gray-200 mb-6 sm:mb-8 italic">
            BudgetWise AI completely transformed how I manage my finances. The predictive insights helped me identify hidden spending patterns and save 47% more in just 6 months. This app is a game-changer!
          </blockquote>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl mr-3 sm:mr-4">SJ</div>
            <div className="text-left">
              <div className="font-bold text-white text-sm sm:text-base">Michael Rodriguez</div>
              <div className="text-gray-400 text-xs sm:text-sm">Investment Manager, San Francisco</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section - Strong & Urgent */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center mb-16 sm:mb-24">
        <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-purple-500/40 shadow-xl sm:shadow-2xl">
          <div className="inline-flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full border border-red-400/30 mb-4 sm:mb-6 animate-pulse">
            <FireIcon className="h-4 w-4 text-white mr-1.5 sm:mr-2" />
            <span className="text-xs font-bold text-white sm:text-sm">FINAL HOURS: 50% OFF ENDS SOON!</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Don&apos;t Miss Out on Financial Freedom</h2>
          <p className="text-base sm:text-xl text-gray-200 max-w-3xl mx-auto mb-6 sm:mb-8">
            Join 50,000+ users who&apos;ve already transformed their financial lives. 
            Start your journey to wealth today with our risk-free 7-day trial.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 sm:px-12 sm:py-6 text-lg sm:text-2xl font-bold rounded-xl sm:rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse mobile-button">
              <Link href="/auth/signup" className="w-full h-full flex items-center justify-center">
                <GiftIcon className="h-5 w-5 mr-2 sm:mr-3 sm:h-6 sm:w-6" />
                Start Your Free Trial Now
                <ArrowRightIcon className="h-5 w-5 ml-2 sm:ml-3 sm:h-6 sm:w-6" />
              </Link>
            </Button>
            
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1 sm:mb-2">$0.00</div>
              <div className="text-sm sm:text-base text-gray-300">Risk-free for 7 days</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-300 mb-6 sm:mb-8">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm">✓ No credit card required</span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm">✓ Join 50,000+ users</span>
            </div>
            <div className="flex items-center">
              <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm">✓ Cancel anytime</span>
            </div>
          </div>
          
          {/* Countdown timer for urgency */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-black/20 rounded-xl sm:rounded-xl inline-block">
            <div className="text-gray-300 text-sm sm:text-base mb-2">Limited time offer ends in:</div>
            <div className="flex justify-center space-x-2 sm:space-x-4">
              <TimeBlock value={timeLeft.days} label="Days" />
              <TimeBlock value={timeLeft.hours} label="Hours" />
              <TimeBlock value={timeLeft.minutes} label="Minutes" />
              <TimeBlock value={timeLeft.seconds} label="Seconds" />
            </div>
          </div>
          
          {/* Last chance banner */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl sm:rounded-xl border border-yellow-500/30">
            <div className="flex items-center justify-center">
              <GiftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm font-bold text-yellow-300">
                Last Chance: Free Bonus Included -{" "}
                <Link href="/assessment" className="underline hover:text-yellow-200">
                  Personal Finance Assessment
                </Link>{" "}
                ($99 Value)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className={`p-8 rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2`}>
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-gradient-to-b from-purple-600 to-indigo-700 rounded-lg px-3 py-2 font-bold text-white">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}