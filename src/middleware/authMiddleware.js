const jwt = require('jsonwebtoken');

const blacklistedTokens = new Set();

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (blacklistedTokens.has(token)) {
      return res.status(401).json({ message: 'Token has been revoked.Login again to continue' });
    }

    // Verify token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

verifyToken.blacklistToken = (token) => {
  if (token) {
    blacklistedTokens.add(token);
  }
};

module.exports = verifyToken;
