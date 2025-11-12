const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { sequelize } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teamRoutes = require('./routes/teamRoutes');

// Import models for synchronization
require('./models/associations');

const app = express();

// ------------------
//  Database Connect
// ------------------
connectDB();

// ------------------
//  CORS Middleware
// ------------------
const allowedOrigins = [
  'http://localhost:3000',
  'https://code-crew-frontend-seven.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ------------------
//  Express Middleware
// ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------
//  Uploads Directory Setup
// ------------------
const uploadsDir = path.join(__dirname, '../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const projectsDir = path.join(uploadsDir, 'projects');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(profilesDir)) fs.mkdirSync(profilesDir);
if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ------------------
//  Routes
// ------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// ------------------
//  Error Handling
// ------------------
app.use((error, req, res, next) => {
  console.error('Error:', error);

  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large' });
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: error.message });
  }

  res.status(500).json({ message: 'Something went wrong!' });
});

// ------------------
//  404 Handler
// ------------------
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ------------------
//  Server Start
// ------------------
const PORT = process.env.PORT || 5000;

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database synced successfully');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database sync error:', err);
  });

module.exports = app;
