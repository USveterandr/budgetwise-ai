const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  pointsHistory: [{
    points: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date,
      default: null
    }
  },
  achievementsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
pointsSchema.index({ userId: 1 }, { unique: true });
pointsSchema.index({ totalPoints: -1 });
pointsSchema.index({ level: -1 });

module.exports = mongoose.model('Points', pointsSchema);