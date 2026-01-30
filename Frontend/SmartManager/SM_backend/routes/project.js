const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/projektek', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const projectsResult = await pool.query(
      `SELECT DISTINCT p.id, p.projekt_nev, p.leiras, p.letrehozo_id, p.statusz, p.hatarido, p.letrehozas_idopont
       FROM "Projekt" p
       LEFT JOIN "ProjektTag" pt ON p.id = pt.projekt_id
       WHERE p.letrehozo_id = $1 OR pt.felhasznalo_id = $1
       ORDER BY p.letrehozas_idopont DESC`,
      [userId]
    );
    res.json({
      success: true,
      data: {
        projects: projectsResult.rows,
        count: projectsResult.rows.length
      }
    });
  } catch (error) {
    console.error('Szerver hiba a projektek lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a projektek lekérése során'
    });
  }
});

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
      `INSERT INTO "Projekt" (projekt_nev, leiras, letrehozo_id, statusz, hatarido)
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

router.delete('/projekt/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const projektCheck = await pool.query(
      'SELECT id, letrehozo_id FROM "Projekt" WHERE id = $1',
      [id]
    );

    if (projektCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Projekt nem található'
      });
    }

    const projekt = projektCheck.rows[0];
    if (projekt.letrehozo_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultsága a projekt törléséhez'
      });
    }

    await pool.query('DELETE FROM "ProjektTag" WHERE projekt_id = $1', [id]);
    await pool.query('DELETE FROM "Feladat" WHERE projekt_id = $1', [id]);
    await pool.query('DELETE FROM "Statisztika" WHERE projekt_id = $1', [id]);
    await pool.query('DELETE FROM "Naplo" WHERE projekt_id = $1', [id]);

    const deleteResult = await pool.query(
      'DELETE FROM "Projekt" WHERE id = $1 RETURNING id',
      [id]
    );

    res.json({
      success: true,
      message: 'Projekt sikeresen törölve',
      data: {
        deleted_id: deleteResult.rows[0].id
      }
    });
  } catch (error) {
    console.error('Szerver hiba a projekt törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a projekt törlése során'
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

router.get('/projektTagok', verifyToken, async (req, res) => {
  try {
    const { projekt_id } = req.query;
    
    if (!projekt_id) {
      return res.status(400).json({
        success: false,
        message: 'Projekt ID kötelező'
      });
    }

    const tagsResult = await pool.query(
      `SELECT DISTINCT u.id, u.teljes_nev, u.email, u.szerep_tipus
       FROM "Felhasznalo" u
       LEFT JOIN "ProjektTag" pt ON u.id = pt.felhasznalo_id AND pt.projekt_id = $1
       LEFT JOIN "Projekt" p ON u.id = p.letrehozo_id AND p.id = $1
       WHERE pt.projekt_id = $1 OR p.id = $1
       ORDER BY u.teljes_nev`,
      [projekt_id]
    );

    return res.json({
      success: true,
      data: tagsResult.rows
    });
  } catch (error) {
    console.error('Szerver hiba a projekt tagok lekérése során:', error);
    return res.status(500).json({ success: false, message: 'Szerver hiba a projekt tagok lekérése során' });
  }
});


router.post('/ujProjektTag', verifyToken, [
  body('projekt_id')
    .notEmpty(),
  body('felhasznalo_id')
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
      const { projekt_id, felhasznalo_id: requestedUserId } = req.body;
      
      const felhasznalo_id = requestedUserId || req.user.id;

      console.log('ProjektTag hozzáadás - projekt_id:', projekt_id, 'felhasznalo_id:', felhasznalo_id);

      const userCheck = await pool.query('SELECT id FROM "Felhasznalo" WHERE id = $1', [felhasznalo_id]);
      if (userCheck.rows.length === 0) {
        console.error('Felhasználó nem található:', felhasznalo_id);
        return res.status(400).json({
          success: false,
          message: 'Felhasználó nem található'
        });
      }

      const projectCheck = await pool.query('SELECT id FROM "Projekt" WHERE id = $1', [projekt_id]);
      if (projectCheck.rows.length === 0) {
        console.error('Projekt nem található:', projekt_id);
        return res.status(400).json({
          success: false,
          message: 'Projekt nem található'
        });
      }

      const tagCheck = await pool.query(
        'SELECT * FROM "ProjektTag" WHERE projekt_id = $1 AND felhasznalo_id = $2',
        [projekt_id, felhasznalo_id]
      );
      if (tagCheck.rows.length > 0) {
        console.log('Tag már hozzá van adva a projekthez');
        return res.status(400).json({
          success: false,
          message: 'A felhasználó már tag a projektben'
        });
      }

      const newProjektTag = await pool.query (`INSERT INTO "ProjektTag" (projekt_id, felhasznalo_id)
      VALUES ($1, $2)
      RETURNING projekt_id, felhasznalo_id, csatlakozas_idopont`,
      [projekt_id, felhasznalo_id]
    );
    console.log('Sikeres projekttag hozzáadás:', newProjektTag.rows[0]);
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

router.delete('/ProjektTag', verifyToken, async (req, res) => {
  try {
    const { projekt_id, felhasznalo_id } = req.body;
    const userId = req.user.id;

    if (!projekt_id || !felhasznalo_id) {
      return res.status(400).json({
        success: false,
        message: 'Projekt ID és felhasználó ID kötelező'
      });
    }

    const projektCheck = await pool.query(
      'SELECT letrehozo_id FROM "Projekt" WHERE id = $1',
      [projekt_id]
    );

    if (projektCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Projekt nem található'
      });
    }

    if (projektCheck.rows[0].letrehozo_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultsága a projekt tag eltávolítására'
      });
    }

    const deleteResult = await pool.query(
      'DELETE FROM "ProjektTag" WHERE projekt_id = $1 AND felhasznalo_id = $2 RETURNING projekt_id, felhasznalo_id',
      [projekt_id, felhasznalo_id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Projekt tag nem található'
      });
    }

    res.json({
      success: true,
      message: 'Projekt tag sikeresen eltávolítva',
      data: {
        projekt_id: deleteResult.rows[0].projekt_id,
        felhasznalo_id: deleteResult.rows[0].felhasznalo_id
      }
    });
  } catch (error) {
    console.error('Szerver hiba a projekt tag eltávolítása során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a projekt tag eltávolítása során'
    });
  }
})

router.post('/ujFeladat', verifyToken, [
   body('projekt_id')
    .notEmpty()
    .withMessage('Projekt ID kötelező')
    .isInt()
    .withMessage('A projekt ID egész szám kell legyen')
    .toInt(),
  body('feladat_nev')
    .notEmpty()
    .withMessage('Feladat név kötelező'),
  body('feladat_leiras')
    .optional(),
  body('felelos_id')
    .optional()
    .toInt(),
  body('prioritas')
    .notEmpty()
    .withMessage('Prioritás kötelező')
    .isIn(['alacsony', 'közepes', 'magas']),
  body('statusz')
    .notEmpty()
    .withMessage('Státusz kötelező')
    .isIn(['folyamatban', 'befejezett', 'késett']),
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
      const { projekt_id, feladat_nev, feladat_leiras, felelos_id, prioritas, statusz, hatarido } = req.body;
      const letrehozo_id = req.user.id;

      const newTask = await pool.query(`INSERT INTO "Feladat" (projekt_id, feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id, projekt_id, feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido, letrehozas_idopont`,
        [projekt_id, feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido]
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

router.get('/feladat', verifyToken, async (req, res) => {
  try {
    const { projekt_id } = req.query;
    const userId = req.user.id;
    
    if (!projekt_id) {
      return res.status(400).json({
        success: false,
        message: 'Projekt ID kötelező'
      });
    }

    const tasksResult = await pool.query(
      `SELECT f.id, f.feladat_nev, f.feladat_leiras, f.letrehozo_id, f.felelos_id, f.prioritas, f.statusz, f.hatarido, f.letrehozas_idopont,
              u.teljes_nev as felelos_nev
       FROM "Feladat" f
       LEFT JOIN "Felhasznalo" u ON f.felelos_id = u.id
       WHERE f.projekt_id = $1 AND (f.felelos_id = $2 OR f.letrehozo_id = $2)
       ORDER BY f.letrehozas_idopont DESC`,
      [projekt_id, userId]
    );

    return res.json({
      success: true,
      data: tasksResult.rows
    });
  } catch (error) {
    console.error('Szerver hiba a feladatok lekérése során:', error);
    return res.status(500).json({ success: false, message: 'Szerver hiba a feladatok lekérése során' });
  }
});

  router.get('/feladatok', verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const tasksResult = await pool.query(
        `SELECT id, projekt_id, feladat_nev, feladat_leiras, letrehozo_id, felelos_id, prioritas, statusz, hatarido, letrehozas_idopont
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

router.delete('/feladat/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const taskCheck = await pool.query(
      'SELECT id, letrehozo_id, felelos_id FROM "Feladat" WHERE id = $1',
      [id]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feladat nem található'
      });
    }

    const task = taskCheck.rows[0];
    if (task.letrehozo_id !== userId && task.felelos_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultsága a feladat törlésére'
      });
    }

    const deleteResult = await pool.query(
      'DELETE FROM "Feladat" WHERE id = $1 RETURNING id',
      [id]
    );

    res.json({
      success: true,
      message: 'Feladat sikeresen törölve',
      data: {
        deleted_id: deleteResult.rows[0].id
      }
    });
  } catch (error) {
    console.error('Szerver hiba a feladat törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a feladat törlése során'
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

router.delete('/statisztika/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const statCheck = await pool.query(
      'SELECT id, felhasznalo_id FROM "Statisztika" WHERE id = $1',
      [id]
    );

    if (statCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Statisztika nem található'
      });
    }

    const stat = statCheck.rows[0];
    if (stat.felhasznalo_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultsága a statisztika törléséhez'
      });
    }

    const deleteResult = await pool.query(
      'DELETE FROM "Statisztika" WHERE id = $1 RETURNING id',
      [id]
    );

    res.json({
      success: true,
      message: 'Statisztika sikeresen törölve',
      data: {
        deleted_id: deleteResult.rows[0].id
      }
    });
  } catch (error) {
    console.error('Szerver hiba a statisztika törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a statisztika törlése során'
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

router.delete('/naplo/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const logCheck = await pool.query(
      'SELECT id, felhasznalo_id FROM "Naplo" WHERE id = $1',
      [id]
    );

    if (logCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Napló bejegyzés nem található'
      });
    }

    const logEntry = logCheck.rows[0];
    if (logEntry.felhasznalo_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultsága a napló bejegyzés törlésére'
      });
    }

    const deleteResult = await pool.query(
      'DELETE FROM "Naplo" WHERE id = $1 RETURNING id',
      [id]
    );

    res.json({
      success: true,
      message: 'Napló bejegyzés sikeresen törölve',
      data: {
        deleted_id: deleteResult.rows[0].id
      }
    });
  } catch (error) {
    console.error('Szerver hiba a napló bejegyzés törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a napló bejegyzés törlése során'
    });
  }
});

router.post('/ujFeladatKomment', verifyToken, [
  body('feladat_id')
    .notEmpty()
    .withMessage('Feladat ID kötelező'),
  body('komment_szoveg')
    .notEmpty()
    .withMessage('Komment szövege kötelező')
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

    const { feladat_id, komment_szoveg } = req.body;
    const felhasznalo_id = req.user.id;

    const newComment = await pool.query(
      `INSERT INTO "FeladatKomment" (feladat_id, felhasznalo_id, komment_szoveg)
       VALUES ($1, $2, $3)
       RETURNING id, feladat_id, felhasznalo_id, komment_szoveg, letrehozas_idopont`,
      [feladat_id, felhasznalo_id, komment_szoveg]
    );

    res.status(201).json({
      success: true,
      message: 'Komment sikeresen létrehozva',
      data: {
        comment: newComment.rows[0]
      }
    });
  } catch (error) {
    console.error('Szerver hiba a komment létrehozása során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a komment létrehozása során'
    });
  }
});

router.get('/feladatKommentek/:feladat_id', verifyToken, async (req, res) => {
  try {
    const { feladat_id } = req.params;

    const commentsResult = await pool.query(
      `SELECT fk.id, fk.feladat_id, fk.felhasznalo_id, fk.komment_szoveg, fk.letrehozas_idopont, f.felhasznalonev
       FROM "FeladatKomment" fk
       LEFT JOIN "Felhasznalo" f ON fk.felhasznalo_id = f.id
       WHERE fk.feladat_id = $1
       ORDER BY fk.letrehozas_idopont DESC`,
      [feladat_id]
    );

    res.json({
      success: true,
      data: {
        comments: commentsResult.rows
      }
    });
  } catch (error) {
    console.error('Szerver hiba a kommentek lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a kommentek lekérése során'
    });
  }
});

router.delete('/feladatKomment/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const commentCheck = await pool.query(
      'SELECT id, felhasznalo_id FROM "FeladatKomment" WHERE id = $1',
      [id]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Komment nem található'
      });
    }

    const comment = commentCheck.rows[0];
    if (comment.felhasznalo_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultsága a komment törlésére'
      });
    }

    const deleteResult = await pool.query(
      'DELETE FROM "FeladatKomment" WHERE id = $1 RETURNING id',
      [id]
    );

    res.json({
      success: true,
      message: 'Komment sikeresen törölve',
      data: {
        deleted_id: deleteResult.rows[0].id
      }
    });
  } catch (error) {
    console.error('Szerver hiba a komment törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a komment törlése során'
    });
  }
});

module.exports = router;