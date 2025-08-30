import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import PaymentForm from "./PaymentForm";
import { PiggyBank, ArrowLeft, Check, Star, Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SignupPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    subscription_plan: "free"
  });
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [selectedPlanData, setSelectedPlanData] = useState(null);

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
    const plan = plans.find(p => p.id === planId);
    setSelectedPlanData(plan);
    setFormData({
      ...formData,
      subscription_plan: planId
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1 && formData.email && formData.password && formData.full_name) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedPlan) {
      if (selectedPlan === "free") {
        handleSubmit();
      } else {
        setCurrentStep(3);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Create account after successful payment
      await handleSubmit();
    } catch (error) {
      toast.error("Failed to create account after payment");
    }
  };

  const handlePaymentError = (error) => {
    toast.error("Payment failed. Please try again.");
    console.error("Payment error:", error);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Create account for any plan (free or paid)
      const response = await axios.post(`${API}/auth/signup`, formData);
      
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        setUser(response.data.user);
        
        if (selectedPlan === "free") {
          toast.success("Free account created successfully! Please check your email to confirm your account.");
        } else {
          toast.success("Account created successfully! Please check your email to confirm your account and unlock full features.");
        }
        
        // Show additional notification about email confirmation
        setTimeout(() => {
          toast.info("📧 Email confirmation sent! Check your inbox to verify your account.", {
            duration: 5000
          });
        }, 2000);
        
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
            {currentStep > 1 ? (
              <button onClick={handlePreviousStep} className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">Back</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <PiggyBank className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">BudgetWise</span>
                </div>
              </div>
            )}
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
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    currentStep >= step 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500' 
                      : 'bg-gray-300'
                  }`}>
                    {currentStep > step ? <Check className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-20 h-1 mx-2 ${
                      currentStep > step ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {currentStep === 1 && "Create Your Account"}
                {currentStep === 2 && "Choose Your Plan"}
                {currentStep === 3 && "Complete Payment"}
              </h1>
              <p className="text-gray-600">
                {currentStep === 1 && "Enter your details to get started"}
                {currentStep === 2 && "Select the plan that fits your needs"}
                {currentStep === 3 && "Secure payment to activate your subscription"}
              </p>
            </div>
          </div>

          {/* Step 1: Account Information */}
          {currentStep === 1 && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Tell us a bit about yourself to create your BudgetWise account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
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
                        placeholder="Enter your email address"
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
                    <p className="text-xs text-gray-500">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <Button 
                    onClick={handleNextStep}
                    disabled={!formData.email || !formData.password || !formData.full_name}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                  >
                    Continue to Plan Selection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Plan Selection */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
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
                        <span className="text-2xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                              <Check className="h-2 w-2 text-green-600" />
                            </div>
                            <span className="text-xs text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button 
                  onClick={handleNextStep}
                  disabled={!selectedPlan}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                >
                  {selectedPlan === "free" ? "Create Free Account" : "Continue to Payment"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto">
              <PaymentForm
                selectedPlan={selectedPlanData}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}

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