const jwt = require('jsonwebtoken');
const prisma = require('../models/prisma.js');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request (access token is authoritative)
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

verifyToken.revokeToken = async (user_id) => {
  try {
    await prisma.refreshToken.updateMany({
      where: { user_id },
      data: { revokedAt: new Date() },
    });
  } catch (error) {
    console.error('Error revoking token:', error);
  }
};

module.exports = verifyToken;
