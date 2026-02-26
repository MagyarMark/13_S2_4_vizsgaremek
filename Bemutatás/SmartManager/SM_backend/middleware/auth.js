const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../config/jwt');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token szükséges a hozzáféréshez'
    });
  }

  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'A token lejárt',
        isTokenExpired: true
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Érvénytelen token'
    });
  }
};

const verifyRefreshToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token szükséges'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Érvénytelen vagy lejárt refresh token'
    });
  }
};

module.exports = {
  verifyToken,
  verifyRefreshToken
};
