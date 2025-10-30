const express = require('express');
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, getUsers } = require('../controllers/userController');
const { authMiddleware, requireTL } = require('../config/authMiddleware');

const router = express.Router();

// Multer configuration for profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public route
router.get('/:id', getProfile);

// Protected routes
router.put('/profile', authMiddleware, upload.single('profilePhoto'), updateProfile);
router.get('/', authMiddleware, requireTL, getUsers); // Only TL can get all users

module.exports = router;