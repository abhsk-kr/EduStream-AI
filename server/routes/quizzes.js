const express = require('express');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/quizzes/:videoId — Get quiz for a specific video
router.get('/:videoId', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      video: req.params.videoId,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/quizzes/:videoId/submit — Submit quiz answers
router.post('/:videoId/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected option indices

    const quiz = await Quiz.findOne({
      video: req.params.videoId,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    quiz.score = score;
    quiz.completed = true;
    await quiz.save();

    // Mark lecture as completed if score >= 60%
    if (score >= 60) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { completedLectures: req.params.videoId },
      });
    }

    res.json({
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      results: quiz.questions.map((q, i) => ({
        question: q.question,
        selectedAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect: answers[i] === q.correctAnswer,
        explanation: q.explanation,
      })),
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
