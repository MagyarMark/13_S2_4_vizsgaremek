const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const fileUpload = require('express-fileupload');
const filesPayloadExists = require('../middleware/filesPayloadExists');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');
const { verifyToken, verifyRefreshToken } = require('../middleware/auth');
const { accessTokenSecret, refreshTokenSecret, accessTokenExpiration, refreshTokenExpiration } = require('../config/jwt');

const router = express.Router();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      felhasznalonev: user.felhasznalonev,
      email: user.email,
      szerep_tipus: user.szerep_tipus
    },
    accessTokenSecret,
    { expiresIn: accessTokenExpiration }
  );

  const refreshToken = jwt.sign(
    { id: user.id, felhasznalonev: user.felhasznalonev },
    refreshTokenSecret,
    { expiresIn: refreshTokenExpiration }
  );

  return { accessToken, refreshToken };
};

router.post('/register', [
  body('felhasznalonev')
    .notEmpty()
    .withMessage('Felhasználónév kötelező'),
  body('email')
    .isEmail()
    .withMessage('Érvényes email cím megadása kötelező')
    .notEmpty()
    .withMessage('Email cím kötelező'),
  body('jelszo')
    .notEmpty()
    .withMessage('Jelszó kötelező'),
  body('teljes_nev'),
  body('szerep_tipus')
    .isIn(['tanar', 'diak', 'admin'])
    .withMessage('Létező szereptípus megadása kötelező (tanar, diak, admin)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Hibás adatok',
        errors: errors.array()
      });
    }

    const { felhasznalonev, jelszo, email, teljes_nev, szerep_tipus } = req.body;

    const userExists = await pool.query(
      'SELECT id FROM "Felhasznalo" WHERE felhasznalonev = $1 OR email = $2',
      [felhasznalonev, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A felhasználónév vagy email cím már foglalt'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(jelszo, saltRounds);

    const newUser = await pool.query(
      `INSERT INTO "Felhasznalo" (
        felhasznalonev, jelszo, email, teljes_nev, szerep_tipus
      ) VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, felhasznalonev, email, teljes_nev, szerep_tipus, letrehozas_idopont`,
      [felhasznalonev, hashedPassword, email, teljes_nev, szerep_tipus]
    );

    res.status(201).json({
      success: true,
      message: 'Sikeres regisztráció',
      data: {
        user: newUser.rows[0]
      }
    });

  } catch (error) {
    console.error('Szerver hiba a regisztráció során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a regisztráció során'
    });
  }
});

router.post('/login', [
  body('felhasznalonev')
    .notEmpty()
    .withMessage('Felhasználónév kötelező'),
  body('jelszo')
    .notEmpty()
    .withMessage('Jelszó kötelező')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Hibás adatok',
        errors: errors.array()
      });
    }

    const { felhasznalonev, jelszo } = req.body;

    const userResult = await pool.query(
      `SELECT id, felhasznalonev, jelszo, email, teljes_nev, szerep_tipus, aktiv, elerheto 
       FROM "Felhasznalo" 
       WHERE felhasznalonev = $1`,
      [felhasznalonev]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Hibás felhasználónév vagy jelszó'
      });
    }

    const user = userResult.rows[0];

    if (!user.aktiv) {
      return res.status(401).json({
        success: false,
        message: 'A felhasználói fiók inaktív'
      });
    }

    const isPasswordValid = await bcrypt.compare(jelszo, user.jelszo);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Hibás felhasználónév vagy jelszó'
      });
    }

    await pool.query(
      'UPDATE "Felhasznalo" SET utolso_bejelentkezes = NOW(), elerheto = true WHERE id = $1',
      [user.id]
    );

    const { jelszo: _, ...userWithoutPassword } = user;
    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      success: true,
      message: 'Sikeres bejelentkezés',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a bejelentkezés során'
    });
  }
});


router.post('/logout', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE "Felhasznalo" SET elerheto = false WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Sikeres kijelentkezés'
    });
  } catch (error) {
    console.error('Szerver hiba a kijelentkezés során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a kijelentkezés során'
    });
  }
});

router.get('/profileData', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      `SELECT id, felhasznalonev, email, teljes_nev, szerep_tipus, aktiv, elerheto, letrehozas_idopont
       FROM "Felhasznalo" WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található.'
      });
    }

    res.json({
      success: true,
      data: { user: userResult.rows[0] }
    });
  } catch (error) {
    console.error('Szerver hiba a felhasználó lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a felhasználó lekérése során'
    });
  }
});

router.put('/profile', verifyToken, [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Érvényes email cím megadása kötelező'),
  body('teljes_nev')
    .optional(),
  body('jelszo')
    .optional(),
  body('elerheto')
    .optional()
    .isBoolean()
    .withMessage('Az elérhetőség boolean értéket kell hogy legyen')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Hibás adatok',
        errors: errors.array()
      });
    }

    const { email, teljes_nev, jelszo, elerheto } = req.body;
    const userId = req.user.id;

    if (email) {
      const emailExists = await pool.query(
        'SELECT id FROM "Felhasznalo" WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (emailExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Az email cím már foglalt'
        });
      }
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (email) {
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
      paramCount++;
    }

    if (teljes_nev) {
      updateFields.push(`teljes_nev = $${paramCount}`);
      updateValues.push(teljes_nev);
      paramCount++;
    }

    if (jelszo) {
      updateFields.push(`jelszo = $${paramCount}`);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(jelszo, saltRounds);
      updateValues.push(hashedPassword);
      paramCount++;
    }

    if (elerheto !== undefined) {
      updateFields.push(`elerheto = $${paramCount}`);
      updateValues.push(elerheto);
      paramCount++;
    }
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nincs megadva frissítendő adat'
      });
    }

    updateValues.push(userId);

    const updateQuery = `
      UPDATE "Felhasznalo" 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, felhasznalonev, email, teljes_nev, szerep_tipus, aktiv
    `;

    const updatedUser = await pool.query(updateQuery, updateValues);

    res.json({
      success: true,
      message: 'Profil sikeresen frissítve',
      data: {
        user: updatedUser.rows[0]
      }
    });

  } catch (error) {
    console.error('Szerver hiba a profil frissítése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a profil frissítése során'
    });
  }
});


router.post('/refresh-token', verifyRefreshToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      `SELECT id, felhasznalonev, email, teljes_nev, szerep_tipus
       FROM "Felhasznalo" 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      });
    }

    const user = userResult.rows[0];
    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      success: true,
      message: 'Token sikeresen frissítve',
      data: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a token frissítése során'
    });
  }
});

router.put('/profile-torles', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      'SELECT id, aktiv FROM "Felhasznalo" WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      });
    }

    const user = userResult.rows[0];

    if (!user.aktiv) {
      return res.status(400).json({
        success: false,
        message: 'A felhasználói fiók már inaktív'
      });
    }

    await pool.query(
      `UPDATE "Felhasznalo" 
       SET aktiv = false,
           email = NULL,
           jelszo = NULL,
           teljes_nev = NULL
       WHERE id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Felhasználói fiók sikeresen törölve (deaktiválva)'
    });

  } catch (error) {
    console.error('Szerver hiba a felhasználó törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a felhasználó törlése során'
    });
  }
});

module.exports = router;