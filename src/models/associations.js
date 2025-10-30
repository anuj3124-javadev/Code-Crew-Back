const { User } = require('./User');
const { Team } = require('./Team');
const { TeamMember } = require('./TeamMember');
const { Project } = require('./Project');

// User Associations
User.hasMany(Project, { foreignKey: 'createdBy', as: 'projects' });
User.belongsToMany(Team, { through: TeamMember, foreignKey: 'userId', as: 'teams' });

// Team Associations
Team.belongsTo(User, { foreignKey: 'createdBy', as: 'teamLeader' });
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'memberships' });
Team.hasMany(Project, { foreignKey: 'teamId', as: 'teamProjects' });
Team.belongsToMany(User, { through: TeamMember, foreignKey: 'teamId', as: 'members' });

// Project Associations
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Project.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// TeamMember Associations
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

module.exports = {
  User,
  Team,
  TeamMember,
  Project
};