const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getProjects,
  getLatestProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authMiddleware } = require('../config/authMiddleware');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/projects/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', getProjects);
router.get('/latest', getLatestProjects);
router.get('/:id', getProject);

// Protected routes
router.post('/', authMiddleware, upload.single('thumbnail'), createProject);
router.put('/:id', authMiddleware, upload.single('thumbnail'), updateProject);
router.delete('/:id', authMiddleware, deleteProject);

module.exports = router;