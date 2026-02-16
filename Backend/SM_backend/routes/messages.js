const express = require('express');
const pool = require('../config/database');
const { body, query, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const isProjectMember = async (userId, projektId) => {
  const membership = await pool.query(
    `SELECT 1
     FROM "Projekt" p
     LEFT JOIN "ProjektTag" pt ON p.id = pt.projekt_id
     WHERE p.id = $1 AND (p.letrehozo_id = $2 OR pt.felhasznalo_id = $2)
     LIMIT 1`,
    [projektId, userId]
  );

  return membership.rows.length > 0;
};

router.get('/osszes', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId, projektId } = req.query;

    if (projektId) {
      const hasAccess = await isProjectMember(userId, projektId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Nincs jogosultság a projekt üzeneteihez'
        });
      }

      const result = await pool.query(
        `SELECT id, kuldo_id, fogado_id, projekt_id, uzenet_tartalom, allapot, kuldes_ideje
         FROM "Uzenet"
         WHERE projekt_id = $1
         ORDER BY kuldes_ideje ASC`,
        [projektId]
      );

      return res.json({
        success: true,
        data: {
          messages: result.rows,
          count: result.rows.length
        }
      });
    }

    let query = `
      SELECT id, kuldo_id, fogado_id, projekt_id, uzenet_tartalom, allapot, kuldes_ideje
      FROM "Uzenet"
      WHERE kuldo_id = $1 OR fogado_id = $1
    `;
    const params = [userId];

    if (recipientId) {
      query += ` AND (kuldo_id = $2 OR fogado_id = $2)`;
      params.push(recipientId);
    }

    if (projektId) {
      query += ` AND projekt_id = $${params.length + 1}`;
      params.push(projektId);
    }

    query += ` ORDER BY kuldes_ideje DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        messages: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Szerver hiba az üzenetek lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az üzenetek lekérése során'
    });
  }
});

router.get('/beszelgetes', verifyToken, [
  query('with')
    .notEmpty()
    .withMessage('A másik felhasználó ID-ja kötelező'),
  query('projektId')
    .optional()
    .isInt()
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { with: withUserId, projektId } = req.query;

    if (!withUserId) {
      return res.status(400).json({
        success: false,
        message: 'A másik felhasználó ID-ja (with) kötelező'
      });
    }

    let query = `
      SELECT id, kuldo_id, fogado_id, projekt_id, uzenet_tartalom, allapot, kuldes_ideje
      FROM "Uzenet"
      WHERE (kuldo_id = $1 AND fogado_id = $2) OR (kuldo_id = $2 AND fogado_id = $1)
    `;
    const params = [userId, withUserId];

    if (projektId) {
      query += ` AND projekt_id = $3`;
      params.push(projektId);
    }

    query += ` ORDER BY kuldes_ideje ASC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        messages: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Szerver hiba a beszélgetés lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a beszélgetés lekérése során'
    });
  }
});

router.post('/kuldes', verifyToken, [
  body('fogado_id')
    .optional()
    .isInt()
    .withMessage('A fogadó ID-nak számnak kell lennie'),
  body('uzenet_tartalom')
    .notEmpty()
    .withMessage('Az üzenet tartalma kötelező')
    .trim(),
  body('projekt_id')
    .optional()
    .isInt()
    .withMessage('A projekt ID-nak számnak kell lennie'),
  body('allapot')
    .optional()
    .isIn(['nem_olvasott', 'olvasott', 'torlolt'])
    .withMessage('Az állapot értéke hibás'),
  body().custom((value, { req }) => {
    if (!req.body.fogado_id && !req.body.projekt_id) {
      throw new Error('A fogadó ID-ja vagy a projekt ID-ja kötelező');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validációs hibák',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { fogado_id, uzenet_tartalom, projekt_id, allapot } = req.body;
    const recipientId = fogado_id ? parseInt(fogado_id, 10) : null;

    if (recipientId && userId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Nem küldhetsz üzenetet magadnak'
      });
    }

    if (recipientId) {
      const recipientCheck = await pool.query(
        'SELECT id FROM "Felhasznalo" WHERE id = $1',
        [recipientId]
      );

      if (recipientCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'A megadott felhasználó nem létezik'
        });
      }
    }

    if (projekt_id) {
      const projectCheck = await pool.query(
        'SELECT id FROM "Projekt" WHERE id = $1',
        [projekt_id]
      );

      if (projectCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'A megadott projekt nem létezik'
        });
      }

      const hasAccess = await isProjectMember(userId, projekt_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Nincs jogosultság az adott projekthez'
        });
      }
    }

    const messageStatus = allapot || 'nem_olvasott';

    const result = await pool.query(
      `INSERT INTO "Uzenet" (kuldo_id, fogado_id, projekt_id, uzenet_tartalom, allapot, kuldes_ideje)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, kuldo_id, fogado_id, projekt_id, uzenet_tartalom, allapot, kuldes_ideje`,
      [userId, recipientId, projekt_id || null, uzenet_tartalom, messageStatus]
    );

    res.status(201).json({
      success: true,
      message: 'Üzenet sikeresen elküldve',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Szerver hiba az üzenet küldése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az üzenet küldése során'
    });
  }
});

router.put('/frissites/:id', verifyToken, [
  body('allapot')
    .optional()
    .isIn(['nem_olvasott', 'olvasott', 'torlolt'])
    .withMessage('Az állapot értéke hibás'),
  body('uzenet_tartalom')
    .optional()
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validációs hibák',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const messageId = req.params.id;
    const { allapot, uzenet_tartalom } = req.body;

    const messageCheck = await pool.query(
      'SELECT kuldo_id FROM "Uzenet" WHERE id = $1',
      [messageId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Az üzenet nem létezik'
      });
    }

    if (messageCheck.rows[0].kuldo_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs engedélyem módosítani ezt az üzenetet'
      });
    }

    let query = 'UPDATE "Uzenet" SET ';
    const params = [];
    const setClauses = [];

    if (allapot) {
      setClauses.push(`allapot = $${setClauses.length + 1}`);
      params.push(allapot);
    }

    if (uzenet_tartalom) {
      setClauses.push(`uzenet_tartalom = $${setClauses.length + 1}`);
      params.push(uzenet_tartalom);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Legalább egy mezőt meg kell adni a frissítéshez'
      });
    }

    query += setClauses.join(', ');
    query += ` WHERE id = $${setClauses.length + 1}`;
    params.push(messageId);
    query += ` RETURNING id, kuldo_id, fogado_id, projekt_id, uzenet_tartalom, allapot, kuldes_ideje`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      message: 'Üzenet sikeresen frissítve',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Szerver hiba az üzenet frissítése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az üzenet frissítése során'
    });
  }
});

router.delete('/torles/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const messageCheck = await pool.query(
      'SELECT kuldo_id FROM "Uzenet" WHERE id = $1',
      [messageId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Az üzenet nem létezik'
      });
    }

    if (messageCheck.rows[0].kuldo_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs engedélyem törölni ezt az üzenetet'
      });
    }

    await pool.query(
      'DELETE FROM "Uzenet" WHERE id = $1',
      [messageId]
    );

    res.json({
      success: true,
      message: 'Üzenet sikeresen törölve'
    });
  } catch (error) {
    console.error('Szerver hiba az üzenet törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az üzenet törlése során'
    });
  }
});

module.exports = router;