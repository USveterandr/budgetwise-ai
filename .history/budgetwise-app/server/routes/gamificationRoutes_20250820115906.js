const express = require('express');
const router = express.Router();
const gamificationService = require('../services/gamificationService');
const auth = require('../middleware/auth');

// Get user gamification data
router.get('/user-data', auth, async (req, res) => {
  try {
    const gamificationData = await gamificationService.getUserGamificationData(req.user.id);
