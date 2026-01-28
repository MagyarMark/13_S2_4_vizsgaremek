const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/ujProjekt', verifyToken, [
  body('projekt_nev')
    .notEmpty()
    .withMessage('Projekt név kötelező'),
  body('leiras')
    .optional(),
  body('statusz')
    .optional(),
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

    const { projekt_nev, leiras, statusz, hatarido } = req.body;
    const letrehozo_id = req.user.id;

    const newProject = await pool.query(
      `INSERT INTO "project" (projekt_nev, leiras, letrehozo_id, statusz, hatarido)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, projekt_nev, leiras, letrehozo_id, statusz, hatarido, letrehozas_idopont`,
      [projekt_nev, leiras || null, letrehozo_id, statusz || 'aktiv', hatarido || null]
    );

    res.status(201).json({
      success: true,
      message: 'Sikeres projekt létrehozás',
      data: {
        project: newProject.rows[0]
      }
    });
  } catch (error) {
    console.error('Szerver hiba a projekt létrehozása során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a projekt létrehozása során'
    });
  }
});

router.get('/projektTag', verifyToken, async (req, res) => {
  try {
    const usersResult = await pool.query(
      'SELECT id, felhasznalonev, teljes_nev, email, szerep_tipus FROM "Felhasznalo" WHERE aktiv = true ORDER BY teljes_nev, felhasznalonev'
    );

    return res.json({
      success: true,
      data: usersResult.rows
    });
  } catch (error) {
    console.error('Szerver hiba a felhasználók lekérése során:', error);
    return res.status(500).json({ success: false, message: 'Szerver hiba a felhasználók lekérése során' });
  }
});

router.post('/ujProjektTag', verifyToken, [
  body('projekt_id')
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
      const { projekt_id } = req.body;
      const felhasznalo_id = req.user.id;

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

    

router.post('/ujFeladat', verifyToken, [
  body('feladat_nev')
    .notEmpty()
    .withMessage('Feladat név kötelező'),
  body('feladat_leiras')
    .optional(),
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
      const { feladat_nev, feladat_leiras, felelos_id, prioritas, statusz, hatarido } = req.body;
      const letrehozo_id = req.user.id;

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

  router.get('/feladatok', verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const tasksResult = await pool.query(
        `SELECT id, feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido, letrehozas_idopont
         FROM "Feladat"
          WHERE letrehozo_id = $1 OR felelos_id = $1`,
        [userId]
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

 router.post('/ujStat', verifyToken, [
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
      const { projekt_id, statisztika_nev, ertek, pontszam } = req.body;
      const felhasznalo_id = req.user.id;

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

  router.get('/statisztika', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const statsResult = await pool.query(
      `SELECT id, felhasznalo_id, projekt_id, statisztika_nev, ertek, meresi_idopont, pontszam
       FROM "Statisztika"
       WHERE felhasznalo_id = $1
       ORDER BY meresi_idopont DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        statistics: statsResult.rows,
        count: statsResult.rows.length
      }
    });
  } catch (error) {
    console.error('Szerver hiba a statisztika lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a statisztika lekérése során'
    });
  }
});


router.get('/statisztika/:projektId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { projektId } = req.params;

    const statsResult = await pool.query(
      `SELECT id, felhasznalo_id, projekt_id, statisztika_nev, ertek, meresi_idopont, pontszam
       FROM "Statisztika"
       WHERE felhasznalo_id = $1 AND projekt_id = $2
       ORDER BY meresi_idopont DESC`,
      [userId, projektId]
    );

    res.json({
      success: true,
      data: {
        statistics: statsResult.rows,
        count: statsResult.rows.length
      }
    });
  } catch (error) {
    console.error('Szerver hiba a statisztika lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a statisztika lekérése során'
    });
  }
});

router.get('/naplo', verifyToken, async (req, res) => {
  try {
    const { projekt_id, feladat_id } = req.query;
    let query = `SELECT id, felhasznalo_id, projekt_id, feladat_id, muvelet, leiras, idopont FROM "Naplo"`;
    const params = [];
    const conditions = [];

    if (projekt_id) {
      conditions.push(`projekt_id = $${params.length + 1}`);
      params.push(projekt_id);
    }

    if (feladat_id) {
      conditions.push(`feladat_id = $${params.length + 1}`);
      params.push(feladat_id);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY idopont DESC`;

    const logsResult = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        logs: logsResult.rows,
        count: logsResult.rows.length
      }
    });
  } catch (error) {
    console.error('Szerver hiba a naplók lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a naplók lekérése során'
    });
  }
});

router.post('/ujNaplo', verifyToken, [
  body('projekt_id')
    .notEmpty(),
  body('muvelet')
    .notEmpty()
    .withMessage('Művelet megadása kötelező'),
  body('feladat_id')
    .optional(),
  body('leiras')
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

    const { projekt_id, feladat_id, muvelet, leiras } = req.body;
    const felhasznalo_id = req.user.id;

    const newLog = await pool.query(
      `INSERT INTO "Naplo" (felhasznalo_id, projekt_id, feladat_id, muvelet, leiras)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, felhasznalo_id, projekt_id, feladat_id, muvelet, leiras, idopont`,
      [felhasznalo_id, projekt_id, feladat_id || null, muvelet, leiras || null]
    );

    res.status(201).json({
      success: true,
      message: 'Sikeres naplóbejegyzés létrehozás',
      data: {
        log: newLog.rows[0]
      }
    });
  } catch (error) {
    console.error('Szerver hiba a naplóbejegyzés létrehozása során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a naplóbejegyzés létrehozása során'
    });
  }
});

module.exports = router;