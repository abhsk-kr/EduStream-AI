const express = require('express');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats — Get user dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalLectures = await Video.countDocuments({ user: userId, status: 'completed' });
    const completedLectures = req.user.completedLectures?.length || 0;
    const inProgress = totalLectures - completedLectures;

    const quizzes = await Quiz.find({ user: userId, completed: true });
    const averageScore =
      quizzes.length > 0
        ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)
        : 0;

    // Recent activity — last 5 videos
    const recentVideos = await Video.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title thumbnail status createdAt youtubeId');

    res.json({
      totalLectures,
      completedLectures,
      inProgress,
      averageScore,
      quizzesTaken: quizzes.length,
      recentVideos,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
