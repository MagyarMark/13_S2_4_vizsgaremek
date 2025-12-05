const pool = require('../config/database');

const auth = async (req, res, next) => {
  try {
    
 const userResult = await pool.query(
      'SELECT id, felhasznalonev, email, teljes_nev, szerep_tipus, aktiv FROM "Felhasznalo" WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Felhasználó nem található.' 
      });
    }

    if (!userResult.rows[0].aktiv) {
      return res.status(401).json({ 
        success: false, 
        message: 'A felhasználói fiók inaktív.' 
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Érvénytelen token.' 
    });
  }
};

module.exports = auth;