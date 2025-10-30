const { Project, User, Team } = require('../models/associations');

// Get all projects with filters
const getProjects = async (req, res) => {
  try {
    const { category, team, page = 1, limit = 10 } = req.query;
    const where = { isVisible: true };
    
    if (category) where.category = category;
    if (team) where.teamId = team;

    const projects = await Project.findAndCountAll({
      where,
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
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      projects: projects.rows,
      totalPages: Math.ceil(projects.count / limit),
      currentPage: parseInt(page),
      total: projects.count
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// Get latest projects for homepage
const getLatestProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { isVisible: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'profilePhoto']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 6
    });

    res.json(projects);
  } catch (error) {
    console.error('Get latest projects error:', error);
    res.status(500).json({ message: 'Server error fetching latest projects' });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'profilePhoto', 'position']
        },
        {
          model: Team,
          as: 'team',
          include: [{
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'profilePhoto', 'position']
          }]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { name, category, description, liveUrl, githubUrl, developers, projectType, teamId } = req.body;
    
    const projectData = {
      name,
      category,
      description,
      liveUrl,
      githubUrl,
      developers: Array.isArray(developers) ? JSON.stringify(developers) : developers,
      projectType,
      teamId: projectType === 'team' ? teamId : null,
      createdBy: req.user.id,
      thumbnail: req.file ? req.file.filename : 'default-project.png'
    };

    // Validate team project creation
    if (projectType === 'team' && req.user.role !== 'TL') {
      return res.status(403).json({ message: 'Only Team Leaders can create team projects' });
    }

    const project = await Project.create(projectData);
    const newProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'profilePhoto']
        }
      ]
    });

    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership or TL access
    if (project.createdBy !== req.user.id && req.user.role !== 'TL') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.thumbnail = req.file.filename;
    }
    if (updateData.developers && Array.isArray(updateData.developers)) {
      updateData.developers = JSON.stringify(updateData.developers);
    }

    await project.update(updateData);
    
    const updatedProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'profilePhoto']
        }
      ]
    });

    res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership or TL access
    if (project.createdBy !== req.user.id && req.user.role !== 'TL') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

module.exports = {
  getProjects,
  getLatestProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};