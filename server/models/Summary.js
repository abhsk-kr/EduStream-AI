const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  timestamp: { type: String, default: '00:00' },
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const summarySchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    highLevelSummary: {
      type: String,
      required: true,
    },
    keyTakeaways: {
      type: [String],
      default: [],
    },
    structuredNotes: {
      type: [noteSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Summary', summarySchema);
