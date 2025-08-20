const Achievement = require('../models/Achievement');
const Points = require('../models/Points');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

class GamificationService {
  // Achievement methods
  static async unlockAchievement(userId, achievementData) {
    try {
      const existingAchievement = await Achievement.findOne({
        userId,
        achievementId: achievementData.achievementId
      });

      if (existingAchievement) {
        return existingAchievement;
      }

      const achievement = new Achievement({
        userId,
        ...achievementData
      });

      await achievement.save();

      // Update user's points
      await this.addPoints(userId, achievementData.points, `Unlocked achievement: ${achievementData.name}`);

      // Update achievements count
      await Points.updateOne(
        { userId },
        { $inc: { achievementsCount: 1 } },
        { upsert: true }
      );

      return achievement;
    } catch (error) {
      throw new Error(`Failed to unlock achievement: ${error.message}`);
    }
  }

  // Points methods
  static async addPoints(userId, points, source) {
    try {
      const pointsDoc = await Points.findOne({ userId });
      
      if (!pointsDoc) {
        // Create new points document
        const newPoints = new Points({
          userId,
          totalPoints: points,
          pointsHistory: [{
            points,
            source,
            description: `Earned ${points} points from ${source}`
          }]
        });
        
        await newPoints.save();
        await this.checkAndLevelUp(userId, newPoints.totalPoints);
        return newPoints;
      } else {
        // Update existing points document
        pointsDoc.totalPoints += points;
        pointsDoc.pointsHistory.push({
          points,
          source,
          description: `Earned ${points} points from ${source}`
        });
        
        await pointsDoc.save();
        await this.checkAndLevelUp(userId, pointsDoc.totalPoints);
        return pointsDoc;
      }
    } catch (error) {
      throw new Error(`Failed to add points: ${error.message}`);
    }
  }

  static async checkAndLevelUp(userId, totalPoints) {
    const levels = [
      { level: 1, minPoints: 0 },
      { level: 2, minPoints: 1000 },
      { level: 3, minPoints: 5000 },
      { level: 4, minPoints: 15000 },
      { level: 5, minPoints: 50000 }
    ];

    const currentLevel = levels.reverse().find(level => totalPoints >= level.minPoints);
    
    if (currentLevel) {
      await Points.updateOne(
        { userId },
        { level: currentLevel.level },
        { upsert: true }
      );
    }
  }

  static async updateStreak(userId) {
    try {
      const pointsDoc = await Points.findOne({ userId });
      
      if (!pointsDoc) {
        // Create new points document with streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const newPoints = new Points({
          userId,
          streak: {
            current: 1,
            longest: 1,
            lastActivityDate: today
          }
        });
        
        await newPoints.save();
        return newPoints.streak;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastActivity = pointsDoc.streak.lastActivityDate;
        let currentStreak = pointsDoc.streak.current;
        
        if (lastActivity) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastActivity.getTime() === yesterday.getTime()) {
            // Continue streak
            currentStreak += 1;
          } else if (lastActivity.getTime() !== today.getTime()) {
            // Reset streak if last activity wasn't today or yesterday
            currentStreak = 1;
          }
          // If last activity was today, do nothing (streak already counted)
        } else {
          // First streak
          currentStreak = 1;
        }
        
        // Update longest streak if needed
        const longestStreak = Math.max(currentStreak, pointsDoc.streak.longest);
        
        pointsDoc.streak = {
          current: currentStreak,
          longest: longestStreak,
          lastActivityDate: today
        };
        
        await pointsDoc.save();
        return pointsDoc.streak;
      }
