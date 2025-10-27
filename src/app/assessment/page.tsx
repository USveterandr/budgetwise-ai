"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowRightIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { getCurrentUser } from '@/lib/auth-client';

// Define interfaces for our assessment data
interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface AssessmentData {
  score: number;
  recommendations: string[];
  projectedSavings: number;
}

interface NumberQuestion {
  id: string;
  text: string;
  type: "number";
  placeholder: string;
}

interface SelectQuestion {
  id: string;
  text: string;
  type: "select";
  options: string[];
}

type Question = NumberQuestion | SelectQuestion;

interface AssessmentStep {
  title: string;
  description: string;
  questions: Question[];
}

export default function FinanceAssessmentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const assessmentSteps: AssessmentStep[] = [
    {
      title: "Financial Overview",
      description: "Let&apos;s understand your current financial situation",
      questions: [
        {
          id: "income",
          text: "What is your total monthly income?",
          type: "number",
          placeholder: "$0.00"
        },
        {
          id: "expenses",
          text: "What are your average monthly expenses?",
          type: "number",
          placeholder: "$0.00"
        },
        {
          id: "savings",
          text: "How much do you currently have in savings?",
          type: "number",
          placeholder: "$0.00"
        }
      ]
    },
    {
      title: "Spending Habits",
      description: "Understanding where your money goes",
      questions: [
        {
          id: "housing",
          text: "What percentage of your income goes to housing?",
          type: "select",
          options: ["< 20%", "20-30%", "30-40%", "> 40%"]
        },
        {
          id: "debt",
          text: "Do you have any debt?",
          type: "select",
          options: ["No debt", "Credit card debt", "Student loans", "Mortgage", "Other"]
        },
        {
          id: "spending",
          text: "How would you describe your spending habits?",
          type: "select",
          options: ["Very disciplined", "Mostly disciplined", "Sometimes impulsive", "Often impulsive"]
        }
      ]
    },
    {
      title: "Financial Goals",
      description: "What are you working toward?",
      questions: [
        {
          id: "goal1",
          text: "What is your primary financial goal?",
          type: "select",
          options: ["Emergency fund", "Pay off debt", "Save for retirement", "Buy a home", "Invest", "Other"]
        },
        {
          id: "timeline",
          text: "When do you want to achieve this goal?",
          type: "select",
          options: ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "More than 10 years"]
        },
        {
          id: "investment",
          text: "How comfortable are you with investing?",
          type: "select",
          options: ["Not comfortable", "Somewhat comfortable", "Comfortable", "Very comfortable"]
        }
      ]
    }
  ];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleNext = () => {
    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit assessment
      submitAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitAssessment = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would send the data to your API
      // For now, we&apos;ll simulate a successful submission
      setTimeout(() => {
        setAssessmentData({
          score: 78,
          recommendations: [
            "Increase emergency fund to 6 months of expenses",
            "Consider consolidating high-interest debt",
            "Maximize employer 401(k) match",
            "Review insurance coverage for adequate protection"
          ],
          projectedSavings: 12500
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm text-center">
          <ShieldCheckIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access your personal finance assessment.
          </p>
          <div className="space-y-4">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/auth/login" className="w-full flex items-center justify-center">
                Log In
              </Link>
            </Button>
            <Button variant="outline" className="w-full">
              <Link href="/auth/signup" className="w-full flex items-center justify-center">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (assessmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border border-green-400/30 mb-6">
              <CheckCircleIcon className="h-5 w-5 text-white mr-2" />
              <span className="text-sm font-bold text-white">Assessment Complete</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Personal Finance Assessment</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Congratulations! Based on your responses, here&apos;s your personalized financial health analysis.
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-6">
                <span className="text-4xl font-bold text-white">{assessmentData.score}</span>
                <span className="text-xl text-white">/100</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Health Score</h2>
              <p className="text-gray-600 mb-6">
                {assessmentData.score >= 80 
                  ? "Excellent! You&apos;re in great financial shape." 
                  : assessmentData.score >= 60 
                    ? "Good! There&apos;s room for improvement." 
                    : "Needs attention. Let&apos;s work on your financial health."}
              </p>
              
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-2" />
                  Projected Annual Savings
                </h3>
                <div className="text-3xl font-bold text-green-600">
                  ${assessmentData.projectedSavings.toLocaleString()}
                </div>
                <p className="text-gray-600 mt-2">
                  With our recommended strategies, you could save this much annually
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <LightBulbIcon className="h-6 w-6 text-purple-600 mr-2" />
              Personalized Recommendations
            </h2>
            <div className="space-y-4">
              {assessmentData.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start p-4 bg-purple-50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-800">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 mb-6">
              <Link href="/dashboard" className="w-full h-full flex items-center justify-center">
                View Full Dashboard
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <p className="text-gray-600">
              Want a more detailed analysis? <Link href="/consultation" className="text-purple-600 font-medium hover:underline">Schedule a free consultation</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full border border-purple-400/30 mb-6">
            <DocumentTextIcon className="h-5 w-5 text-white mr-2" />
            <span className="text-sm font-bold text-white">Free $99 Value Assessment</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {assessmentSteps[currentStep].title}
          </h1>
          <p className="text-lg text-gray-600">
            {assessmentSteps[currentStep].description}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentStep + 1} of {assessmentSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / assessmentSteps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentStep + 1) / assessmentSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-8">
            {assessmentSteps[currentStep].questions.map((question) => (
              <div key={question.id} className="space-y-4">
                <label htmlFor={question.id} className="block text-lg font-medium text-gray-900">
                  {question.text}
                </label>
                {question.type === "number" ? (
                  <input
                    id={question.id}
                    type="number"
                    placeholder={(question as NumberQuestion).placeholder}
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                ) : (
                  <select
                    id={question.id}
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    aria-label={question.text}
                  >
                    <option value="">Select an option</option>
                    {(question as SelectQuestion).options.map((option: string, index: number) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="px-6 py-3"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[assessmentSteps[currentStep].questions[0].id]}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3"
          >
            {currentStep === assessmentSteps.length - 1 ? "Complete Assessment" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}