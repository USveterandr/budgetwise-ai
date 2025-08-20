import api from './api';

class GamificationService {
  // Get user gamification data
  static async getUserGamificationData() {
    try {
      const response = await api.get('/api/gamification/user-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      throw error;
    }
  }

  // Unlock achievement
  static async unlockAchievement(achievementData) {
    try {
      const response = await api.post('/api/gamification/achievements/unlock', {
        achievementData
      });
      return response.data;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // Add points
  static async addPoints(points, source) {
    try {
      const response = await api.post('/api/gamification/points/add', {
        points,
        source
      });
      return response.data;
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  // Update streak
  static async updateStreak() {
    try {
      const response = await api.post('/api/gamification/streak/update');
      return response.data;
    } catch (error) {
