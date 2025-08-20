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
      
