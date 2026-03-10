const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
    },
    youtubeId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Video',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    channelName: {
      type: String,
      default: '',
    },
    transcript: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);
