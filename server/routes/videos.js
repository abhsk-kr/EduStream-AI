const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const Video = require('../models/Video');
const Summary = require('../models/Summary');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');
const upload = require('../utils/upload');
const fs = require('fs');

const router = express.Router();

// Extract YouTube video ID from various URL formats
const extractYoutubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// POST /api/videos — Submit a YouTube URL and trigger the AI pipeline
router.post(
  '/',
  auth,
  [body('youtubeUrl').notEmpty().withMessage('YouTube URL is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { youtubeUrl } = req.body;
      const youtubeId = extractYoutubeId(youtubeUrl);

      if (!youtubeId) {
        return res.status(400).json({ message: 'Invalid YouTube URL' });
      }

      // Check if video already processed for this user
      const existingVideo = await Video.findOne({ user: req.user._id, youtubeId });
      if (existingVideo) {
        return res.status(400).json({
          message: 'Video already processed',
          videoId: existingVideo._id,
        });
      }

      // Create video record
      const video = await Video.create({
        user: req.user._id,
        youtubeUrl,
        youtubeId,
        status: 'processing',
      });

      // Trigger AI pipeline asynchronously
      processVideo(video, req.user._id).catch((err) => {
        console.error('AI pipeline error:', err);
      });

      res.status(201).json({
        message: 'Video submitted for processing',
        video,
      });
    } catch (error) {
      console.error('Submit video error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Background AI processing pipeline
async function processVideo(video, userId) {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  try {
    // Step 1: Extract transcript
    const transcriptRes = await axios.post(`${AI_SERVICE_URL}/extract-transcript`, {
      youtube_url: video.youtubeUrl,
    });

    const { transcript, video_info } = transcriptRes.data;

    // Update video with metadata
    video.transcript = transcript;
    video.title = video_info?.title || 'Untitled Video';
    video.thumbnail = video_info?.thumbnail || '';
    video.channelName = video_info?.channel || '';
    video.duration = video_info?.duration || '';

    // Step 2 & 3: Generate summary and quiz in PARALLEL for speed
    const [summaryRes, quizRes] = await Promise.all([
      axios.post(`${AI_SERVICE_URL}/summarize`, {
        transcript,
        title: video.title,
      }),
      axios.post(`${AI_SERVICE_URL}/generate-quiz`, {
        transcript,
        title: video.title,
      })
    ]);

    // Check if video was deleted or cancelled during processing
    const currentVideo = await Video.findById(video._id);
    if (!currentVideo) return; // Abort if cancelled

    // Save Summary and Quiz in parallel
    await Promise.all([
      Summary.create({
        video: video._id,
        user: userId,
        highLevelSummary: summaryRes.data.high_level_summary,
        keyTakeaways: summaryRes.data.key_takeaways,
        structuredNotes: summaryRes.data.structured_notes,
      }),
      Quiz.create({
        video: video._id,
        user: userId,
        questions: quizRes.data.questions,
      })
    ]);

    // Mark as completed
    currentVideo.status = 'completed';
    await currentVideo.save();
  } catch (error) {
    console.error('Process video error:', error.message);
    video.status = 'failed';
    await video.save();
  }
}

// Background AI processing pipeline for local uploads
async function processLocalVideo(video, userId, filePath, filename) {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  try {
    // Step 1: Extract transcript via Whisper
    const transcriptRes = await axios.post(`${AI_SERVICE_URL}/extract-local-transcript`, {
      file_path: filePath,
      filename: filename
    });

    const { transcript, video_info } = transcriptRes.data;

    // Update video with metadata
    video.transcript = transcript;
    video.title = video_info?.title || filename;
    video.thumbnail = video_info?.thumbnail || '';
    video.channelName = video_info?.channel || 'Local Upload';
    video.duration = video_info?.duration || '';

    // Step 2 & 3: Generate summary and Quiz in PARALLEL for speed
    const [summaryRes, quizRes] = await Promise.all([
      axios.post(`${AI_SERVICE_URL}/summarize`, {
        transcript,
        title: video.title,
      }),
      axios.post(`${AI_SERVICE_URL}/generate-quiz`, {
        transcript,
        title: video.title,
      })
    ]);

    // Check if video was deleted or cancelled during processing
    const currentVideo = await Video.findById(video._id);
    if (!currentVideo) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return; // Abort if cancelled
    }

    // Save summary and quiz in parallel
    await Promise.all([
      Summary.create({
        video: video._id,
        user: userId,
        highLevelSummary: summaryRes.data.high_level_summary,
        keyTakeaways: summaryRes.data.key_takeaways,
        structuredNotes: summaryRes.data.structured_notes,
      }),
      Quiz.create({
        video: video._id,
        user: userId,
        questions: quizRes.data.questions,
      })
    ]);

    // Mark as completed
    currentVideo.status = 'completed';
    await currentVideo.save();

    // Clean up local video file to save disk space
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

  } catch (error) {
    console.error('Process local video error:', error.message);
    video.status = 'failed';
    await video.save();

    // Clean up local file on failure
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// POST /api/videos/upload — Upload a local video file
router.post('/upload', auth, upload.single('mediaFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create a video record
    const video = await Video.create({
      user: req.user._id,
      youtubeUrl: 'local:' + req.file.filename,
      youtubeId: 'local:' + Date.now(),
      status: 'processing',
    });

    // Trigger AI pipeline with the local file path
    processLocalVideo(video, req.user._id, req.file.path, req.file.originalname).catch((err) => {
      console.error('AI pipeline error (local text):', err);
    });

    res.status(201).json({
      message: 'Video upload completed and submitted for processing',
      video,
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// GET /api/videos — Get all videos for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/videos/:id — Get a single video by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, user: req.user._id });
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/videos/:id — Delete a video and its generated content (or cancel processing)
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, user: req.user._id });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete associated summaries and quizzes
    await Promise.all([
      Summary.deleteMany({ video: video._id }),
      Quiz.deleteMany({ video: video._id }),
      Video.deleteOne({ _id: video._id })
    ]);

    res.json({ message: 'Module removed' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error retrieving video' });
  }
});

module.exports = router;
