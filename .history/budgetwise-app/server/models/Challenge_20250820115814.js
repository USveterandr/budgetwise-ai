const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['personal', 'community', 'seasonal', 'mission'],
    required: true
  },
  category: {
    type: String,
    enum: ['budgeting', 'saving', 'investing', 'spending', 'debt', 'general'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  pointsReward: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in days
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
challengeSchema.index({ type: 1 });
challengeSchema.index({ category: 1 });
challengeSchema.index({ isActive: 1 });
challengeSchema.index({ endDate: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);