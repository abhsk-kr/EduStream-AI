const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Configure upload
const upload = multer({
  storage,
  limits: {
    // 2 GB limit to match up to 90 min of highly compressed video/audio
    fileSize: 2000 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // Accept audio and video
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video are allowed.'), false);
    }
  },
});

module.exports = upload;
