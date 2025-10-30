const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Fixed path

const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'Member'
  }
});

module.exports = { TeamMember };