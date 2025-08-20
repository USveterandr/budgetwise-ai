const express = require('express');
const router = express.Router();
const gamificationService = require('../services/gamificationService');
const auth = require('../middleware/auth');

// Get user gamification data
router.get('/user-data', auth, async (req, res) => {
  try {
    const gamificationData = await gamificationService.getUserGamificationData(req.user.id);
    res.json(gamificationData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await gamificationService.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unlock achievement
router.post('/achievements/unlock', auth, async (req, res) => {
  try {
    const { achievementData } = req.body;
    const achievement = await gamificationService.unlockAchievement(req.user.id, achievementData);
    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add points
router.post('/points/add', auth, async (req, res) => {
  try {
    const { points, source } = req.body;
    const pointsDoc = await gamificationService.addPoints(req.user.id, points, source);
    res.json(pointsDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update streak
router.post('/streak/update', auth, async (req, res) => {
  try {
    const streak = await gamificationService.updateStreak(req.user.id);
    res.json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create challenge
router.post('/challenges/create', auth, async (req, res) => {
  try {
    const challenge = await gamificationService.createChallenge(req.body);
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join challenge
router.post('/challenges/:challengeId/join', auth, async (req, res) => {
  try {
    const challenge = await gamificationService.joinChallenge(req.user.id, req.params.challengeId);
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update challenge progress
router.put('/challenges/:challengeId/progress', auth, async (req, res) => {
  try {
    const { progress } = req.body;
    const challenge = await gamificationService.updateChallengeProgress(req.user.id, req.params.challengeId, progress);
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;