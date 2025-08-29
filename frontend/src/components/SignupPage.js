import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { PiggyBank, ArrowLeft, Check, Star, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SignupPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    subscription_plan: "free"
  });
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("free");

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "",
      features: [
        "Basic expense tracking",
        "Simple budget creation", 
        "Monthly reports",
        "Mobile app access"
      ],
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      id: "personal-plus",
      name: "Personal Plus",
      price: 9.99,
      period: "/month",
      features: [
        "Advanced budgeting tools",
        "AI-powered insights",
        "Unlimited categories", 
        "Goal tracking",
        "Achievement system",
        "Priority support"
      ],
      popular: true,
      color: "from-violet-500 to-purple-500"
    },
    {
      id: "investor",
      name: "Investor",
      price: 19.99,
      period: "/month",
      features: [
        "Everything in Personal Plus",
        "Investment portfolio tracking",
        "Retirement planning tools",
        "Advanced analytics",
        "Tax optimization tips",
        "Financial advisor consultation"
      ],
      popular: false,
      color: "from-emerald-500 to-teal-500"
    },
    {
      id: "business-pro-elite",
      name: "Business Pro Elite",
      price: 49.99,
      period: "/month",
      features: [
        "Everything in Investor",
        "Team collaboration",
        "Business expense management",
        "Advanced reporting",
        "API access",
        "Dedicated account manager"
      ],
      popular: false,
      color: "from-amber-500 to-orange-500"
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setFormData({
      ...formData,
      subscription_plan: planId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedPlan !== "free") {
        // For paid plans, we'll integrate PayPal here
        toast.success("Redirecting to PayPal for payment...");
        // PayPal integration will be added next
        return;
      }

      // For free plan, create account directly
      const response = await axios.post(`${API}/auth/signup`, formData);
      
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        setUser(response.data.user);
        toast.success("Account created successfully! Welcome to BudgetWise!");
        navigate("/dashboard");
      }
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to create account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BudgetWise</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Already have an account?</span>
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Start Your Financial Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your plan and join thousands who've transformed their financial future with BudgetWise.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Plan Selection */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose Your Plan</h2>
                <p className="text-gray-600">Select the plan that best fits your financial goals</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`relative cursor-pointer transition-all duration-300 ${
                      selectedPlan === plan.id 
                        ? 'ring-2 ring-violet-500 shadow-xl' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-violet-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          selectedPlan === plan.id 
                            ? 'bg-violet-500 border-violet-500' 
                            : 'border-gray-300'
                        } flex items-center justify-center`}>
                          {selectedPlan === plan.id && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Signup Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Create Your Account</CardTitle>
                  <CardDescription>
                    Fill in your details to get started with BudgetWise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="full_name"
                          name="full_name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                          minLength="6"
                        />
                      </div>
                    </div>

                    {/* Selected Plan Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Selected Plan</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          {plans.find(p => p.id === selectedPlan)?.name}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${plans.find(p => p.id === selectedPlan)?.price}
                          {plans.find(p => p.id === selectedPlan)?.period}
                        </span>
                      </div>
                      {selectedPlan !== "free" && (
                        <p className="text-sm text-violet-600 mt-2">
                          7-day free trial included
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                      disabled={loading}
                    >
                      {loading ? (
                        "Creating Account..."
                      ) : selectedPlan === "free" ? (
                        "Create Free Account"
                      ) : (
                        "Start Free Trial"
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By signing up, you agree to our{" "}
                      <a href="#" className="text-violet-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-violet-600 hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security & Trust Badges */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 mb-4">Trusted by 100,000+ users worldwide</p>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                Bank-level Security
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                256-bit Encryption
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                GDPR Compliant
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;