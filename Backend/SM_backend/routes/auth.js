const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const fileUpload = require('express-fileupload');
const filesPayloadExists = require('../middleware/filesPayloadExists');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');
const { verifyToken, verifyRefreshToken } = require('../middleware/auth');
const { accessTokenSecret, refreshTokenSecret, accessTokenExpiration, refreshTokenExpiration } = require('../config/jwt');
const { sendVerificationEmail, sendAccountReactivationEmail } = require('../nodemailer/nmapp');

const router = express.Router();

const generateEmailVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return { rawToken, hashedToken, expiresAt };
};

const buildVerificationUrl = (rawToken) => {
  const verificationBaseUrl = process.env.EMAIL_VERIFICATION_URL_BASE || 'http://localhost:5173/verify-email';
  return `${verificationBaseUrl}?token=${rawToken}`;
};

const generateAccountReactivationToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return { rawToken, hashedToken, expiresAt };
};

const buildAccountReactivationUrl = (rawToken) => {
  const reactivationBaseUrl = process.env.ACCOUNT_REACTIVATION_URL_BASE || 'http://localhost:5173/reactivate-account';
  return `${reactivationBaseUrl}?token=${rawToken}`;
};

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

    const { rawToken, hashedToken, expiresAt } = generateEmailVerificationToken();

    const newUser = await pool.query(
      `INSERT INTO "Felhasznalo" (
        felhasznalonev, jelszo, email, teljes_nev, szerep_tipus, email_megerositve, email_megerosito_token, email_megerosites_hatarido
      ) VALUES ($1, $2, $3, $4, $5, false, $6, $7) 
      RETURNING id, felhasznalonev, email, teljes_nev, szerep_tipus, letrehozas_idopont, email_megerositve`,
      [felhasznalonev, hashedPassword, email, teljes_nev, szerep_tipus, hashedToken, expiresAt]
    );

    const verificationUrl = buildVerificationUrl(rawToken);
    try {
      await sendVerificationEmail({
        to: email,
        felhasznalonev,
        verificationUrl
      });
    } catch (mailError) {
      console.error('Nem sikerult kikuldeni a megerosito emailt:', mailError);
    }

    res.status(201).json({
      success: true,
      message: 'Sikeres regisztráció. Ellenorizd az emailedet a fiok aktivalasahoz.',
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
      `SELECT id, felhasznalonev, jelszo, email, teljes_nev, szerep_tipus, aktiv, elerheto, email_megerositve 
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

    if (!user.email_megerositve) {
      return res.status(403).json({
        success: false,
        message: 'Az email cim meg nincs megerositve. Ellenorizd a postaladadat.'
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

router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Hianyzik a megerosito token'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const verifiedUser = await pool.query(
      `UPDATE "Felhasznalo"
       SET email_megerositve = true,
           email_megerosito_token = NULL,
           email_megerosites_hatarido = NULL
       WHERE email_megerosito_token = $1
         AND email_megerosites_hatarido > NOW()
       RETURNING id, felhasznalonev, email, email_megerositve`,
      [hashedToken]
    );

    if (verifiedUser.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Érvénytelen vagy lejárt megerősítő link'
      });
    }

    return res.json({
      success: true,
      message: 'Email cim sikeresen megerősítve',
      data: {
        user: verifiedUser.rows[0]
      }
    });
  } catch (error) {
    console.error('Szerver hiba az email megerősítése során:', error);
    return res.status(500).json({
      success: false,
      message: 'Szerver hiba az email megerősítése során'
    });
  }
});

router.post('/resend-verification-email', [
  body('email')
    .isEmail()
    .withMessage('Ervenyes email cim megadasa kotelezo')
    .notEmpty()
    .withMessage('Email cim kotelezo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Hibas adatok',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const userResult = await pool.query(
      `SELECT id, felhasznalonev, email, email_megerositve
       FROM "Felhasznalo"
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Felhasznalo nem talalhato ezzel az email cimmel'
      });
    }

    const user = userResult.rows[0];

    if (user.email_megerositve) {
      return res.status(400).json({
        success: false,
        message: 'Az email cim mar meg van erosítve'
      });
    }

    const { rawToken, hashedToken, expiresAt } = generateEmailVerificationToken();
    await pool.query(
      `UPDATE "Felhasznalo"
       SET email_megerosito_token = $1,
           email_megerosites_hatarido = $2
       WHERE id = $3`,
      [hashedToken, expiresAt, user.id]
    );

    const verificationUrl = buildVerificationUrl(rawToken);
    await sendVerificationEmail({
      to: user.email,
      felhasznalonev: user.felhasznalonev,
      verificationUrl
    });

    return res.json({
      success: true,
      message: 'Megerosito email ujra elkuldve'
    });
  } catch (error) {
    console.error('Szerver hiba a megerosito email ujrakuldesekor:', error);
    return res.status(500).json({
      success: false,
      message: 'Szerver hiba a megerosito email ujrakuldesekor'
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

router.put('/profileDelete', verifyToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;

    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT id, aktiv, email, felhasznalonev FROM "Felhasznalo" WHERE id = $1 FOR UPDATE',
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      });
    }

    const user = userResult.rows[0];

    if (!user.aktiv) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'A felhasználói fiók már inaktív'
      });
    }

    if (!user.email) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'A fiókhoz nincs email cím társítva, így nem küldhető reaktivációs link'
      });
    }

    const { rawToken, hashedToken, expiresAt } = generateAccountReactivationToken();
    const reactivationUrl = buildAccountReactivationUrl(rawToken);

    await client.query(
      `UPDATE "Felhasznalo" 
       SET aktiv = false,
           elerheto = false,
           email = NULL,
           jelszo = NULL,
           teljes_nev = NULL,
           reaktivacio_token = $1,
           reaktivacio_hatarido = $2
       WHERE id = $3`,
      [hashedToken, expiresAt, userId]
    );

    await sendAccountReactivationEmail({
      to: user.email,
      felhasznalonev: user.felhasznalonev,
      reactivationUrl
    });

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Felhasználói fiók sikeresen deaktiválva. Reaktivációs email elküldve.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Szerver hiba a felhasználó törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a felhasználó törlése során'
    });
  } finally {
    client.release();
  }
});

router.post('/reactivate-account', [
  body('token')
    .notEmpty()
    .withMessage('A reaktivacios token kotelezo'),
  body('email')
    .isEmail()
    .withMessage('Ervenyes email cim megadasa kotelezo')
    .notEmpty()
    .withMessage('Email cim kotelezo'),
  body('jelszo')
    .notEmpty()
    .withMessage('Jelszo kotelezo'),
  body('teljes_nev')
    .optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Hibas adatok',
        errors: errors.array()
      });
    }

    const { token, email, jelszo, teljes_nev } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const userByToken = await pool.query(
      `SELECT id
       FROM "Felhasznalo"
       WHERE reaktivacio_token = $1
         AND reaktivacio_hatarido > NOW()`,
      [hashedToken]
    );

    if (userByToken.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ervenytelen vagy lejart reaktivacios link'
      });
    }

    const userId = userByToken.rows[0].id;

    const emailExists = await pool.query(
      'SELECT id FROM "Felhasznalo" WHERE email = $1 AND id != $2',
      [email, userId]
    );

    if (emailExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Az email cim mar foglalt'
      });
    }

    const hashedPassword = await bcrypt.hash(jelszo, 10);

    const reactivatedUser = await pool.query(
      `UPDATE "Felhasznalo"
       SET aktiv = true,
           email = $2,
           jelszo = $3,
           teljes_nev = COALESCE($4, teljes_nev),
           email_megerositve = true,
           reaktivacio_token = NULL,
           reaktivacio_hatarido = NULL
       WHERE reaktivacio_token = $1
         AND reaktivacio_hatarido > NOW()
       RETURNING id, felhasznalonev, email, aktiv`,
      [hashedToken, email, hashedPassword, teljes_nev || null]
    );

    if (reactivatedUser.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ervenytelen vagy lejart reaktivacios link'
      });
    }

    return res.json({
      success: true,
      message: 'A fiok sikeresen ujraaktiválva',
      data: {
        user: reactivatedUser.rows[0]
      }
    });
  } catch (error) {
    console.error('Szerver hiba a fiok ujraaktiválása során:', error);
    return res.status(500).json({
      success: false,
      message: 'Szerver hiba a fiok ujraaktiválása során'
    });
  }
});

module.exports = router;