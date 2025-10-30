const express = require('express');
const {
  getTeams,
  createTeam,
  addTeamMember,
  removeTeamMember,
  getTeamProjects
} = require('../controllers/teamController');
const { authMiddleware, requireTL } = require('../config/authMiddleware');

const router = express.Router();

// Public route
router.get('/', getTeams);
router.get('/:teamId/projects', getTeamProjects);

// TL only routes
router.post('/', authMiddleware, requireTL, createTeam);
router.post('/add-member', authMiddleware, requireTL, addTeamMember);
router.post('/remove-member', authMiddleware, requireTL, removeTeamMember);

module.exports = router;