import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Trophy, 
  Target, 
  Flame, 
  Star,
  Award,
  Zap,
  Medal,
  Crown,
  TrendingUp,
  Calendar,
  Gift,
  Users,
  Loader2,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const API = `${(process.env.REACT_APP_BACKEND_URL ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '') : '')}/api`;

const GamificationDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAchievements, setCheckingAchievements] = useState(false);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, achievementsRes, challengesRes, leaderboardRes] = await Promise.all([
        axios.get(`${API}/gamification/stats`, { headers }),
        axios.get(`${API}/gamification/achievements`, { headers }),
        axios.get(`${API}/gamification/challenges`, { headers }),
        axios.get(`${API}/gamification/leaderboard`, { headers })
      ]);

      setStats(statsRes.data);
      setAchievements(achievementsRes.data);
      setChallenges(challengesRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      toast.error("Failed to load gamification data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAchievements = async () => {
    setCheckingAchievements(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API}/gamification/check-achievements`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.new_achievements.length > 0) {
        toast.success(`🎉 Unlocked ${response.data.new_achievements.length} new achievement(s)!`);
        await fetchGamificationData(); // Refresh data
      } else {
        toast.info("No new achievements at this time");
      }
    } catch (error) {
      toast.error("Failed to check achievements");
    } finally {
      setCheckingAchievements(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  const getAchievementIcon = (category) => {
    const icons = {
      expenses: "💳",
      budgeting: "🎯", 
      investments: "📈",
      savings: "🏦",
      general: "⭐"
    };
    return icons[category] || "🏆";
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    return ((stats.points % 100) / 100) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎮 Gamification Hub
          </h1>
          <p className="text-gray-600">
            Track your progress, earn rewards, and compete with others!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.points || 0}</h3>
              <p className="text-sm text-gray-600">Total Points</p>
              <Badge variant="outline" className="mt-2">
                Level {stats?.level || 1}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.streak_days || 0}</h3>
              <p className="text-sm text-gray-600">Day Streak</p>
              <Badge variant="outline" className="mt-2 bg-orange-50 text-orange-600">
                {stats?.streak_days >= 7 ? "🔥 Hot" : "Keep Going!"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.total_achievements || 0}</h3>
              <p className="text-sm text-gray-600">Achievements</p>
              <Badge variant="outline" className="mt-2">
                #{stats?.user_rank || 0} Rank
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.completed_challenges || 0}</h3>
              <p className="text-sm text-gray-600">Challenges Done</p>
              <div className="mt-2">
                <Progress value={getLevelProgress()} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.points_to_next_level || 0} points to level {(stats?.level || 1) + 1}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Your Achievements
                  </CardTitle>
                  <CardDescription>
                    Badges you've earned on your financial journey
                  </CardDescription>
                </div>
                <Button
                  onClick={checkForNewAchievements}
                  disabled={checkingAchievements}
                  size="sm"
                  variant="outline"
                >
                  {checkingAchievements ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  Check Progress
                </Button>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.slice(0, 6).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
                        <div className="text-2xl">
                          {getAchievementIcon(achievement.category)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.points} pts
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {achievement.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No achievements yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Start tracking expenses to unlock your first achievement!
                    </p>
                    <Button onClick={checkForNewAchievements} disabled={checkingAchievements}>
                      Check for Achievements
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Weekly Challenges
                </CardTitle>
                <CardDescription>
                  Complete challenges to earn bonus points and badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {challenges.length > 0 ? (
                  <div className="space-y-4">
                    {challenges.slice(0, 3).map((challenge) => (
                      <div key={challenge.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{challenge.badge_icon}</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                              <p className="text-sm text-gray-600">{challenge.description}</p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-violet-500 to-purple-500">
                            {challenge.points_reward} pts
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">
                              {challenge.user_progress} / {challenge.target_value}
                              {challenge.category === 'expenses' ? ' expenses' : 
                               challenge.category === 'savings' ? ' saved' : ' items'}
                            </span>
                          </div>
                          <Progress 
                            value={(challenge.user_progress / challenge.target_value) * 100} 
                            className="h-2"
                          />
                          {challenge.is_completed && (
                            <Badge className="bg-green-500 text-white">
                              <Check className="h-3 w-3 mr-1" />
                              Completed!
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No active challenges</p>
                    <p className="text-sm text-gray-400">New challenges coming soon!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Top users this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((user, index) => (
                      <div key={user._id || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.streak_days} day streak
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-violet-600">{user.points}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No leaderboard data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Quick Boosts
                </CardTitle>
                <CardDescription>
                  Fast ways to earn points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Add Expense</p>
                        <p className="text-xs text-gray-500">+5 points</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Create Budget</p>
                        <p className="text-xs text-gray-500">+25 points</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Star className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Daily Login</p>
                        <p className="text-xs text-gray-500">+10 points</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;