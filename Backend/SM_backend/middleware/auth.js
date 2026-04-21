const jwt = require('jsonwebtoken');
const { accessTokenSecret, refreshTokenSecret } = require('../config/jwt');

// access token ellenőrzése minden védett kéréssel
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  // ha nincs token, nem engedjük tovább
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token szükséges a hozzáféréshez'
    });
  }

  try {
    // érvényes token esetén a user adatot eltesszük
    const decoded = jwt.verify(token, accessTokenSecret);
    req.user = decoded;
    next();
  } catch (error) {
    // külön kezeljük ha lejárt a token
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

  // frissítéshez kötelező refresh token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token szükséges'
    });
  }

  try {
    // refresh token ellenőrzés külön kulccsal
    const decoded = jwt.verify(token, refreshTokenSecret);
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
