const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

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
    console.error('Registration error:', error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a regisztráció során',
      error: error.message
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

    console.log('Login request body:', req.body);

    

    const userResult = await pool.query(
      `SELECT id, felhasznalonev, jelszo, email, teljes_nev, szerep_tipus, aktiv, elerheto 
       FROM "Felhasznalo" 
       WHERE felhasznalonev = felhasznalonev`,
      [felhasznalonev]
    );

    console.log('Login query returned rows:', userResult.rows.length);

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
      'UPDATE "Felhasznalo" SET utolso_bejelentkezes = NOW() WHERE id = $1',
      [user.id]
    );

    const { jelszo: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Sikeres bejelentkezés',
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Login error:', error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a bejelentkezés során',
      error: error.message
    });
  }
});



router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Profile error:', error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a profil lekérése során',
      error: error.message
    });
  }
});


router.put('/profile', auth, [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Érvényes email cím megadása kötelező'),
  body('teljes_nev')
    .optional()
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

    const { email, teljes_nev } = req.body;
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
    console.error('Profile update error:', error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a profil frissítése során',
      error: error.message
    });
  }
});

module.exports = router;

