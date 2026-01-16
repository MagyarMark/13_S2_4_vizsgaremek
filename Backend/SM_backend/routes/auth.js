const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const fileUpload = require('express-fileupload');
const filesPayloadExists = require('../middleware/filesPayloadExists');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');

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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a bejelentkezés során'
    });
  }
});

router.get('/profile/:felhasznalonev', async (req, res) => {
  try {
    const { felhasznalonev } = req.params;

    const userResult = await pool.query(
      `SELECT id, felhasznalonev, email, teljes_nev, szerep_tipus, aktiv, elerheto, letrehozas_idopont
       FROM "Felhasznalo" WHERE felhasznalonev = $1`,
      [felhasznalonev]
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


router.put('/profile', [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Érvényes email cím megadása kötelező'),
  body('teljes_nev')
    .optional(),
  body('jelszo')
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

    const { email, teljes_nev, jelszo, id } = req.body;
    const userId = id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'A frissítéshez adja meg a felhasználó azonosítóját (id).'
      });
    }

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

router.get('/projektTag/:felhasznaloid', async (req, res) => {
  try {
    let { felhasznaloid } = req.params;

    if (!felhasznaloid) {
      return res.status(400).json({ success: false, message: 'Nincs megadva felhasznaloid.' });
    }

    let userId = null;
    if (/^\d+$/.test(felhasznaloid)) {
      userId = Number(felhasznaloid);
    } else {
      const userRes = await pool.query(
        'SELECT id FROM "Felhasznalo" WHERE felhasznalonev = $1',
        [felhasznaloid]
      );
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Felhasználó nem található ezzel a felhasználónévvel.' });
      }
      userId = userRes.rows[0].id;
    }

    const ptResult = await pool.query(
      'SELECT projekt_id FROM "ProjektTag" WHERE felhasznalo_id = $1',
      [userId]
    );

    const projektIds = (ptResult.rows || []).map(r => r.projekt_id);

    return res.json({ success: true, data: { projektIds, rows: ptResult.rows } });
  } catch (error) {
    console.error('Szerver hiba a projekt tag lekérése során:', error);
    return res.status(500).json({ success: false, message: 'Szerver hiba a projekt tag lekérése során' });
  }
});

router.post('/projektTag', [
  body('projekt_id')
    .notEmpty(),
  body('felhasznalo_id')
    .notEmpty(),
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
      const {projekt_id, felhasznalo_id} = req.body;

      const newProjektTag = await pool.query (`INSERT INTO "ProjektTag" (projekt_id, felhasznalo_id)
      VALUES ($1, $2)
      RETURNING projekt_id, felhasznalo_id, csatlakozas_idopont`,
      [projekt_id, felhasznalo_id]
    );
    res.status(201).json({
        success: true,
        message: 'Projekttag sikeres hozzáadása',
        data: {
          projekttag: newProjektTag.rows[0]
        }
      });
    } catch (error) {
      console.error('Szerver hiba a projekttag hozzáadása során:', error);
      res.status(500).json({
        success: false,
        message: 'Szerver hiba a projekttag hozzáadása során'
      });
    }
});

    

router.post('/ujFeladat', [
  body('feladat_nev')
    .notEmpty()
    .withMessage('Feladat név kötelező'),
  body('feladat_leiras')
    .optional(),
  body('letrehozo_id')
    .notEmpty()
    .withMessage('Létrehozó azonosító kötelező'),
  body('felelos_id')
    .optional(),
  body('prioritas')
    .isIn(['alacsony', 'közepes', 'magas']),
  body('statusz')
    .isIn(['folyamatban', 'elvégezve']),
  body('hatarido')
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
      const { feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido } = req.body;

      const newTask = await pool.query(`INSERT INTO "Feladat" ( feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido, letrehozas_idopont`,
        [feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido]
      );
      res.status(201).json({
        success: true,
        message: 'Sikeres feladat létrehozás',
        data: {
          task: newTask.rows[0]
        }
      });
    } catch (error) {
      console.error('Szerver hiba a feladat létrehozása során:', error);
      res.status(500).json({
        success: false,
        message: 'Szerver hiba a feladat létrehozása során'
      });
    }
});

  router.get('/feladatok/:felhasznaloid', async (req, res) => {
    try {
      const { felhasznaloid } = req.params;
      const tasksResult = await pool.query(
        `SELECT id, feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido, letrehozas_idopont
         FROM "Feladat"
          WHERE letrehozo_id = $1 OR felelos_id = $1`,
        [felhasznaloid]
      );
      res.json({
        success: true,
        data: {
          tasks: tasksResult.rows
        }
      });
    } catch (error) {
      console.error('Szerver hiba a feladatok lekérése során:', error);
      res.status(500).json({
        success: false,
        message: 'Szerver hiba a feladatok lekérése során'
      });
    }
});

 router.post('/ujStat',[
  body('felhasznalo_id')
   .notEmpty(),
  body('projekt_id')
   .notEmpty(),
  body('statisztika_nev')
    .notEmpty(),
  body('ertek')
    .optional(),
  body('pontszam')
    .optional(),
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
      const {felhasznalo_id, projekt_id, statisztika_nev, ertek, pontszam} = req.body;

      const newStat = await pool.query(
        `INSERT INTO "Statisztika" (felhasznalo_id, projekt_id, statisztika_nev, ertek, pontszam)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, felhasznalo_id, projekt_id, statisztika_nev, ertek, meresi_idopont, pontszam`,
        [felhasznalo_id, projekt_id, statisztika_nev, ertek, pontszam]
      );
    res.status(201).json({
          success: true,
          message: 'Sikeres statisztika létrehozás',
          data: {
            statistics: newStat.rows[0]
          }
        });
      } catch (error) {
        console.error('Szerver hiba a statisztika létrehozása során:', error);
        res.status(500).json({
          success: false,
          message: 'Szerver hiba a statisztika létrehozása során'
        });
      }
  });

module.exports = router;