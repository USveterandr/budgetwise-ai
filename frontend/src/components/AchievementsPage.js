import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  PiggyBank, 
  Trophy, 
  Star,
  Target,
  TrendingUp,
  Zap,
  Crown,
  Gift,
  Medal,
  Award,
  Calendar,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AchievementsPage = ({ user }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock achievements data - in a real app this would come from your backend
  const allAchievements = [
    {
      id: "first-expense",
      title: "First Steps",
      description: "Record your first expense",
      icon: <Target className="h-6 w-6" />,
      points: 50,
      category: "Getting Started",
      unlocked: true,
      unlocked_at: new Date().toISOString(),
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "budget-creator",
      title: "Budget Master",
      description: "Create your first budget",
      icon: <Crown className="h-6 w-6" />,
      points: 100,
      category: "Budgeting",
      unlocked: true,
      unlocked_at: new Date().toISOString(),
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: "savings-warrior",
      title: "Savings Warrior",
      description: "Stay under budget for 7 days straight",
      icon: <Medal className="h-6 w-6" />,
      points: 250,
      category: "Discipline",
      unlocked: false,
      progress: 5,
      total: 7,
      color: "from-purple-500 to-violet-500"
    },
    {
      id: "expense-tracker",
      title: "Tracking Enthusiast",
      description: "Log 30 expenses",
      icon: <Zap className="h-6 w-6" />,
      points: 150,
      category: "Consistency",
      unlocked: false,
      progress: 12,
      total: 30,
      color: "from-orange-500 to-red-500"
    },
    {
      id: "investment-starter",
      title: "Investment Pioneer",
      description: "Add your first investment",
      icon: <TrendingUp className="h-6 w-6" />,
      points: 200,
      category: "Growth",
      unlocked: false,
      color: "from-teal-500 to-green-500"
    },
    {
      id: "monthly-champion",
      title: "Monthly Champion",
      description: "Complete all budgets for a month",
      icon: <Trophy className="h-6 w-6" />,
      points: 500,
      category: "Achievement",
      unlocked: false,
      color: "from-yellow-500 to-amber-500"
    },
    {
      id: "streak-master",
      title: "Streak Master",
      description: "Maintain a 30-day logging streak",
      icon: <Award className="h-6 w-6" />,
      points: 300,
      category: "Consistency",
      unlocked: false,
      progress: 8,
      total: 30,
      color: "from-pink-500 to-purple-500"
    },
    {
      id: "budget-boss",
      title: "Budget Boss",
      description: "Create 5 different category budgets",
      icon: <Crown className="h-6 w-6" />,
      points: 200,
      category: "Organization",
      unlocked: false,
      progress: 2,
      total: 5,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/achievements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // For now, use mock data but in real implementation, use response.data
      setAchievements(allAchievements);
    } catch (error) {
      // Use mock data on error for demo purposes
      setAchievements(allAchievements);
    } finally {
      setLoading(false);
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  const categories = [...new Set(achievements.map(a => a.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">BudgetWise</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 ml-8">
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/expenses" className="text-gray-600 hover:text-gray-900">Expenses</Link>
                <Link to="/budget" className="text-gray-600 hover:text-gray-900">Budgets</Link>
                <Link to="/investments" className="text-gray-600 hover:text-gray-900">Investments</Link>
                <Link to="/achievements" className="text-violet-600 font-medium">Achievements</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements & Rewards</h1>
          <p className="text-gray-600">Track your progress and unlock rewards for reaching financial goals</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unlocked</p>
                  <p className="text-2xl font-bold text-gray-900">{unlockedAchievements.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lockedAchievements.filter(a => a.progress).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Medal className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        {unlockedAchievements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Your latest unlocked rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {unlockedAchievements.slice(0, 3).map((achievement, index) => (
                  <Card key={index} className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${achievement.color} rounded-lg flex items-center justify-center text-white`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <Badge className="mt-1 bg-green-100 text-green-700 text-xs">
                            +{achievement.points} points
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievement Categories */}
        {categories.map((category, categoryIndex) => {
          const categoryAchievements = achievements.filter(a => a.category === category);
          
          return (
            <div key={categoryIndex} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
                <Badge variant="outline">
                  {categoryAchievements.filter(a => a.unlocked).length}/{categoryAchievements.length}
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryAchievements.map((achievement, index) => (
                  <Card 
                    key={index} 
                    className={`relative overflow-hidden ${
                      achievement.unlocked 
                        ? 'border-2 border-green-200 bg-gradient-to-br from-green-50 to-white' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {achievement.unlocked && (
                      <div className="absolute top-2 right-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${achievement.color} rounded-xl flex items-center justify-center text-white ${
                          !achievement.unlocked ? 'opacity-50 grayscale' : ''
                        }`}>
                          {achievement.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-2 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                            {achievement.title}
                          </h3>
                          <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                            {achievement.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={`text-xs ${
                              achievement.unlocked 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {achievement.points} points
                            </Badge>
                            
                            {achievement.unlocked && (
                              <span className="text-xs text-green-600">
                                Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          {!achievement.unlocked && achievement.progress && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.total}</span>
                              </div>
                              <Progress 
                                value={(achievement.progress / achievement.total) * 100} 
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Gamification Tips */}
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-900">
              <Zap className="h-5 w-5" />
              Pro Tips for Earning More Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-medium text-violet-900 mb-1">Daily Consistency</h4>
                  <p className="text-sm text-violet-700">
                    Log expenses daily to build streaks and unlock consistency achievements
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <DollarSign className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-medium text-violet-900 mb-1">Budget Discipline</h4>
                  <p className="text-sm text-violet-700">
                    Stay under budget to unlock discipline-based achievements and earn bonus points
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Target className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-medium text-violet-900 mb-1">Set Goals</h4>
                  <p className="text-sm text-violet-700">
                    Create specific financial goals and track progress to unlock achievement tiers
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-medium text-violet-900 mb-1">Diversify Tracking</h4>
                  <p className="text-sm text-violet-700">
                    Use all features - expenses, budgets, investments to unlock cross-feature rewards
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AchievementsPage;