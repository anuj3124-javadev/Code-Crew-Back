const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Fixed path

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING,
    defaultValue: 'default-project.png'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  liveUrl: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  githubUrl: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  developers: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]'
  },
  projectType: {
    type: DataTypes.ENUM('individual', 'team'),
    defaultValue: 'individual'
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = { Project };