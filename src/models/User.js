const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('TL', 'Member'),
    defaultValue: 'Member'
  },
  profilePhoto: {
    type: DataTypes.STRING,
    defaultValue: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.freepik.com%2Fpremium-vector%2Fman-character_665280-46970.jpg&f=1&nofb=1&ipt=491967750a78da1e328e6e97890424ae046a91cfafb269883173a558dbeebd79'
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  skills: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  position: {
    type: DataTypes.STRING,
    defaultValue: 'Team Member'
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = { User };