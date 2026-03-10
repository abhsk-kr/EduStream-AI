const express = require('express');
const Summary = require('../models/Summary');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/summaries/:videoId — Get summary for a specific video
router.get('/:videoId', auth, async (req, res) => {
  try {
    const summary = await Summary.findOne({
      video: req.params.videoId,
      user: req.user._id,
    });

    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
