const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = generateToken;
