import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Play, 
  PiggyBank, 
  TrendingUp, 
  Target,
  Trophy,
  CreditCard,
  BarChart3,
  X
} from "lucide-react";

const DemoModal = ({ open, onOpenChange }) => {
  const [currentDemo, setCurrentDemo] = useState("overview");

  const demoFeatures = {
    overview: {
      title: "BudgetWise Overview",
      description: "See how BudgetWise transforms your financial management",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBkYXNoYm9hcmR8ZW58MHx8fHwxNzU2NDg0MDUzfDA&ixlib=rb-4.1.0&q=85",
      features: [
        "Complete financial dashboard",
        "Real-time expense tracking", 
        "Smart budget management",
        "Investment portfolio tracking"
      ]
    },
    expenses: {
      title: "Smart Expense Tracking",
      description: "AI-powered categorization and insights",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxmaW5hbmNpYWx8ZW58MHx8fHwxNzU2NDg0MDUzfDA&ixlib=rb-4.1.0&q=85",
      features: [
        "Automatic expense categorization",
        "Receipt scanning with AI",
        "Real-time spending alerts", 
        "Monthly spending analysis"
      ]
    },
    budgets: {
      title: "Intelligent Budget Management",
      description: "Set goals and track progress effortlessly",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxidWRnZXR8ZW58MHx8fHwxNzU2NDg0MDUzfDA&ixlib=rb-4.1.0&q=85",
      features: [
        "Flexible budget categories",
        "Progress tracking with alerts",
        "Overspending notifications",
        "Budget optimization suggestions"
      ]
    },
    investments: {
      title: "Portfolio Management", 
      description: "Track investments and build wealth",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxpbnZlc3RtZW50fGVufDB8fHx8MTc1NjQ4NDA1M3ww&ixlib=rb-4.1.0&q=85",
      features: [
        "Real-time portfolio tracking",
        "Performance analytics",
        "Diversification insights",
        "Retirement planning tools"
      ]
    },
    gamification: {
      title: "Gamified Experience",
      description: "Make financial management fun and engaging", 
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw1fHxnYW1lc3xlbnwwfHx8fDE3NTY0ODQwNTN8MA&ixlib=rb-4.1.0&q=85",
      features: [
        "Achievement badges and rewards",
        "Spending streak challenges",
        "Financial goals progress",
        "Leaderboards and social features"
      ]
    }
  };

  const demoTabs = [
    { id: "overview", icon: <PiggyBank className="h-4 w-4" />, label: "Overview" },
    { id: "expenses", icon: <CreditCard className="h-4 w-4" />, label: "Expenses" },
    { id: "budgets", icon: <Target className="h-4 w-4" />, label: "Budgets" },
    { id: "investments", icon: <TrendingUp className="h-4 w-4" />, label: "Investments" },
    { id: "gamification", icon: <Trophy className="h-4 w-4" />, label: "Gamification" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Play className="h-6 w-6 text-violet-600" />
            BudgetWise Demo
          </DialogTitle>
          <DialogDescription>
            Explore BudgetWise features and see how it can transform your financial management
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Demo Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {demoTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={currentDemo === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentDemo(tab.id)}
                className="flex items-center gap-2"
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Demo Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature Description */}
            <div className="space-y-4">
              <div>
                <Badge className="mb-2 bg-violet-100 text-violet-700">
                  {demoFeatures[currentDemo].title}
                </Badge>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {demoFeatures[currentDemo].description}
                </h3>
              </div>

              <ul className="space-y-3">
                {demoFeatures[currentDemo].features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-violet-50 rounded-lg">
                <h4 className="font-semibold text-violet-900 mb-2">Ready to get started?</h4>
                <p className="text-sm text-violet-700 mb-3">
                  Join over 100,000 users who have transformed their financial lives with BudgetWise.
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
                  onClick={() => {
                    onOpenChange(false);
                    window.location.href = "/signup";
                  }}
                >
                  Start Your Free Trial
                </Button>
              </div>
            </div>

            {/* Feature Preview */}
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={demoFeatures[currentDemo].image}
                  alt={demoFeatures[currentDemo].title}
                  className="w-full h-full object-cover"
                />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-6 w-6 text-violet-600 ml-1" />
                  </div>
                </div>
              </div>

              {/* Interactive Demo Placeholder */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  ✨ Interactive demo coming soon! Click above to preview {demoFeatures[currentDemo].title.toLowerCase()}.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">100K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">$50M+</div>
              <div className="text-sm text-gray-600">Money Managed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">4.9⭐</div>
              <div className="text-sm text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal;