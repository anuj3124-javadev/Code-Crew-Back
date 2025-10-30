const jwt = require('jsonwebtoken');
const { User } = require('../models/User'); // Fixed path

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireTL = (req, res, next) => {
  if (req.user.role !== 'TL') {
    return res.status(403).json({ message: 'Access denied. Team Leader role required.' });
  }
  next();
};

module.exports = { authMiddleware, requireTL };