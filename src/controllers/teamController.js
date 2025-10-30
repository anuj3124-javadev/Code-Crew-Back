const { Team, TeamMember, User, Project } = require('../models/associations');

// Get all teams
const getTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [
        {
          model: User,
          as: 'teamLeader',
          attributes: ['id', 'name', 'profilePhoto']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'profilePhoto', 'position', 'skills']
        }
      ]
    });

    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error fetching teams' });
  }
};

// Create team (TL only)
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      createdBy: req.user.id
    });

    const newTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: User,
          as: 'teamLeader',
          attributes: ['id', 'name', 'profilePhoto']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'profilePhoto', 'position', 'skills']
        }
      ]
    });

    res.status(201).json({ message: 'Team created successfully', team: newTeam });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error creating team' });
  }
};

// Add member to team (TL only)
const addTeamMember = async (req, res) => {
  try {
    const { teamId, userId, role = 'Member' } = req.body;

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team leader
    if (team.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Only team leader can add members' });
    }

    // Check if member already exists
    const existingMember = await TeamMember.findOne({ where: { teamId, userId } });
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    const teamMember = await TeamMember.create({
      teamId,
      userId,
      role
    });

    const memberWithDetails = await TeamMember.findByPk(teamMember.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePhoto', 'position', 'skills']
        }
      ]
    });

    res.status(201).json({ message: 'Member added successfully', member: memberWithDetails });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ message: 'Server error adding team member' });
  }
};

// Remove member from team (TL only)
const removeTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team leader
    if (team.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Only team leader can remove members' });
    }

    const deleted = await TeamMember.destroy({
      where: { teamId, userId }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ message: 'Server error removing team member' });
  }
};

// Get team projects
const getTeamProjects = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const projects = await Project.findAll({
      where: { teamId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'profilePhoto']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(projects);
  } catch (error) {
    console.error('Get team projects error:', error);
    res.status(500).json({ message: 'Server error fetching team projects' });
  }
};

module.exports = {
  getTeams,
  createTeam,
  addTeamMember,
  removeTeamMember,
  getTeamProjects
};