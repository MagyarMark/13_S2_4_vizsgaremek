const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { body, query, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/adminAuth');

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['tanar', 'diak', 'admin']),
  query('active').optional().isBoolean(),
  query('search').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Hibás kérés paraméterek',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { role, active, search } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (role) {
      whereConditions.push(`szerep_tipus = $${paramCount}`);
      queryParams.push(role);
      paramCount++;
    }

    if (active !== undefined) {
      whereConditions.push(`aktiv = $${paramCount}`);
      queryParams.push(active === 'true');
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(felhasznalonev ILIKE $${paramCount} OR email ILIKE $${paramCount} OR teljes_nev ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM "Felhasznalo" ${whereClause}`,
      queryParams
    );
    const totalUsers = parseInt(countResult.rows[0].count);

    queryParams.push(limit, offset);
    const usersResult = await pool.query(
      `SELECT id, felhasznalonev, email, teljes_nev, szerep_tipus, aktiv, elerheto, 
              letrehozas_idopont, utolso_bejelentkezes
       FROM "Felhasznalo" 
       ${whereClause}
       ORDER BY letrehozas_idopont DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    });
  } catch (error) {
    console.error('Hiba a felhasználók lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a felhasználók lekérése során'
    });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      `SELECT id, felhasznalonev, email, teljes_nev, szerep_tipus, aktiv, elerheto,
              letrehozas_idopont, utolso_bejelentkezes
       FROM "Felhasznalo"
       WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      });
    }

    const projectCount = await pool.query(
      `SELECT COUNT(*) as count FROM "Projekt" WHERE letrehozo_id = $1`,
      [id]
    );

    const submissionCount = await pool.query(
      `SELECT COUNT(*) as count FROM "Beadas" WHERE felhasznalo_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        user: userResult.rows[0],
        stats: {
          projectsCreated: parseInt(projectCount.rows[0].count),
          submissions: parseInt(submissionCount.rows[0].count)
        }
      }
    });
  } catch (error) {
    console.error('Hiba a felhasználó lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a felhasználó lekérése során'
    });
  }
});

router.put('/userUpdate/:id', [
  body('email').optional().isEmail().withMessage('Érvényes email cím szükséges'),
  body('teljes_nev').optional(),
  body('jelszo').optional().isLength({ min: 6 }).withMessage('A jelszónak legalább 6 karakter hosszúnak kell lennie'),
  body('szerep_tipus').optional().isIn(['tanar', 'diak', 'admin']).withMessage('Érvényes szerep: tanar, diak, admin'),
  body('aktiv').optional().isBoolean(),
  body('elerheto').optional().isBoolean()
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

    const { id } = req.params;
    const { email, teljes_nev, jelszo, szerep_tipus, aktiv, elerheto } = req.body;

    const userCheck = await pool.query(
      'SELECT id FROM "Felhasznalo" WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      });
    }

    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM "Felhasznalo" WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Az email cím már használatban van'
        });
      }
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (email !== undefined) {
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
      paramCount++;
    }

    if (teljes_nev !== undefined) {
      updateFields.push(`teljes_nev = $${paramCount}`);
      updateValues.push(teljes_nev);
      paramCount++;
    }

    if (jelszo !== undefined) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(jelszo, saltRounds);
      updateFields.push(`jelszo = $${paramCount}`);
      updateValues.push(hashedPassword);
      paramCount++;
    }

    if (szerep_tipus !== undefined) {
      updateFields.push(`szerep_tipus = $${paramCount}`);
      updateValues.push(szerep_tipus);
      paramCount++;
    }

    if (aktiv !== undefined) {
      updateFields.push(`aktiv = $${paramCount}`);
      updateValues.push(aktiv);
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
        message: 'Nincs frissítendő adat'
      });
    }

    updateValues.push(id);

    const updateQuery = `
      UPDATE "Felhasznalo"
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, felhasznalonev, email, teljes_nev, szerep_tipus, aktiv, elerheto, 
                letrehozas_idopont, utolso_bejelentkezes
    `;

    const result = await pool.query(updateQuery, updateValues);

    res.json({
      success: true,
      message: 'Felhasználó sikeresen frissítve',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Hiba a felhasználó frissítése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a felhasználó frissítése során'
    });
  }
});

router.delete('/userDelete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Nem törölheti saját magát'
      });
    }

    const userCheck = await pool.query(
      'SELECT id, felhasznalonev FROM "Felhasznalo" WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      });
    }

    await pool.query('DELETE FROM "ProjektTag" WHERE felhasznalo_id = $1', [id]);
    await pool.query('DELETE FROM "Uzenet" WHERE kuldo_id = $1 OR fogado_id = $1', [id]);
    await pool.query('DELETE FROM "File" WHERE felhasznalo_id = $1', [id]);
    await pool.query('DELETE FROM "Beadas" WHERE felhasznalo_id = $1', [id]);
    
    await pool.query('DELETE FROM "Projekt" WHERE letrehozo_id = $1', [id]);

    await pool.query('DELETE FROM "Felhasznalo" WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Felhasználó sikeresen törölve',
      data: {
        deleted_id: id,
        deleted_username: userCheck.rows[0].felhasznalonev
      }
    });
  } catch (error) {
    console.error('Hiba a felhasználó törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a felhasználó törlése során'
    });
  }
});

router.put('/user/:id/role', [
  body('szerep_tipus').isIn(['tanar', 'diak', 'admin']).withMessage('Érvényes szerep: tanar, diak, admin')
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

    const { id } = req.params;
    const { szerep_tipus } = req.body;

    const result = await pool.query(
      `UPDATE "Felhasznalo"
       SET szerep_tipus = $1
       WHERE id = $2
       RETURNING id, felhasznalonev, szerep_tipus`,
      [szerep_tipus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      });
    }

    res.json({
      success: true,
      message: 'Felhasználó szerepe sikeresen módosítva',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Hiba a felhasználó szerepének módosítása során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a felhasználó szerepének módosítása során'
    });
  }
});

router.get('/projects', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional(),
  query('search').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Hibás kérés paraméterek',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { status, search } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`p.statusz = $${paramCount}`);
      queryParams.push(status);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(p.projekt_nev ILIKE $${paramCount} OR p.leiras ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM "Projekt" p ${whereClause}`,
      queryParams
    );
    const totalProjects = parseInt(countResult.rows[0].count);

    queryParams.push(limit, offset);
    const projectsResult = await pool.query(
      `SELECT p.id, p.projekt_nev, p.leiras, p.letrehozo_id, p.statusz, 
              p.hatarido, p.letrehozas_idopont,
              f.felhasznalonev as creator_username, f.teljes_nev as creator_name
       FROM "Projekt" p
       LEFT JOIN "Felhasznalo" f ON p.letrehozo_id = f.id
       ${whereClause}
       ORDER BY p.letrehozas_idopont DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        projects: projectsResult.rows,
        pagination: {
          page,
          limit,
          total: totalProjects,
          totalPages: Math.ceil(totalProjects / limit)
        }
      }
    });
  } catch (error) {
    console.error('Hiba a projektek lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a projektek lekérése során'
    });
  }
});

router.delete('/projectDelete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const projectCheck = await pool.query(
      'SELECT id, projekt_nev FROM "Projekt" WHERE id = $1',
      [id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Projekt nem található'
      });
    }

    await pool.query(`DELETE FROM "File" WHERE beadas_id IN (SELECT b.id FROM "Beadas" b INNER JOIN "Feladat" f ON b.feladat_id = f.id WHERE f.projekt_id = $1)`, [id]);

    await pool.query(`
      DELETE FROM "Beadas" WHERE feladat_id IN (SELECT id FROM "Feladat" WHERE projekt_id = $1)`, [id]);

    await pool.query(`DELETE FROM "FeladatKomment" WHERE feladat_id IN (SELECT id FROM "Feladat" WHERE projekt_id = $1)`, [id]);

    await pool.query('DELETE FROM "Feladat" WHERE projekt_id = $1', [id]);
    await pool.query('DELETE FROM "ProjektTag" WHERE projekt_id = $1', [id]);
    await pool.query('DELETE FROM "Statisztika" WHERE projekt_id = $1', [id]);
    await pool.query('DELETE FROM "Naplo" WHERE projekt_id = $1', [id]);
    await pool.query('DELETE FROM "Uzenet" WHERE projekt_id = $1', [id]);

    await pool.query('DELETE FROM "Projekt" WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Projekt sikeresen törölve',
      data: {
        deleted_id: id,
        deleted_name: projectCheck.rows[0].projekt_nev
      }
    });
  } catch (error) {
    console.error('Hiba a projekt törlése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a projekt törlése során'
    });
  }
});

router.get('/submissions', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional(),
  query('student_id').optional().isInt(),
  query('teacher_id').optional().isInt(),
  query('task_id').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Hibás kérés paraméterek',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { status, student_id, teacher_id, task_id } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`b.statusz = $${paramCount}`);
      queryParams.push(status);
      paramCount++;
    }

    if (student_id) {
      whereConditions.push(`b.felhasznalo_id = $${paramCount}`);
      queryParams.push(student_id);
      paramCount++;
    }

    if (teacher_id) {
      whereConditions.push(`b.tanar_id = $${paramCount}`);
      queryParams.push(teacher_id);
      paramCount++;
    }

    if (task_id) {
      whereConditions.push(`b.feladat_id = $${paramCount}`);
      queryParams.push(task_id);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM "Beadas" b ${whereClause}`,
      queryParams
    );
    const totalSubmissions = parseInt(countResult.rows[0].count);

    queryParams.push(limit, offset);
    const submissionsResult = await pool.query(
      `SELECT b.id, b.feladat_id, b.felhasznalo_id, b.tanar_id, 
              b.pontszam, b.jegy, b.statusz, b.visszajelzes,
              b.bekuldes_idopont, b.ertekeles_idopont,
              fs.felhasznalonev as student_username, fs.teljes_nev as student_name,
              ft.felhasznalonev as teacher_username, ft.teljes_nev as teacher_name,
              f.feladat_nev as task_name
       FROM "Beadas" b
       LEFT JOIN "Felhasznalo" fs ON b.felhasznalo_id = fs.id
       LEFT JOIN "Felhasznalo" ft ON b.tanar_id = ft.id
       LEFT JOIN "Feladat" f ON b.feladat_id = f.id
       ${whereClause}
       ORDER BY b.bekuldes_idopont DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        submissions: submissionsResult.rows,
        pagination: {
          page,
          limit,
          total: totalSubmissions,
          totalPages: Math.ceil(totalSubmissions / limit)
        }
      }
    });
  } catch (error) {
    console.error('Hiba a beadások lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a beadások lekérése során'
    });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM "Felhasznalo"');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    const activeUsersResult = await pool.query('SELECT COUNT(*) as count FROM "Felhasznalo" WHERE aktiv = true');
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    const usersByRoleResult = await pool.query(
      `SELECT szerep_tipus, COUNT(*) as count 
       FROM "Felhasznalo" 
       GROUP BY szerep_tipus`
    );

    const totalProjectsResult = await pool.query('SELECT COUNT(*) as count FROM "Projekt"');
    const totalProjects = parseInt(totalProjectsResult.rows[0].count);

    const projectsByStatusResult = await pool.query(
      `SELECT statusz, COUNT(*) as count 
       FROM "Projekt" 
       GROUP BY statusz`
    );

    const totalSubmissionsResult = await pool.query('SELECT COUNT(*) as count FROM "Beadas"');
    const totalSubmissions = parseInt(totalSubmissionsResult.rows[0].count);

    const submissionsByStatusResult = await pool.query(
      `SELECT statusz, COUNT(*) as count 
       FROM "Beadas" 
       GROUP BY statusz`
    );

    const totalMessagesResult = await pool.query('SELECT COUNT(*) as count FROM "Uzenet"');
    const totalMessages = parseInt(totalMessagesResult.rows[0].count);

    const totalFilesResult = await pool.query('SELECT COUNT(*) as count FROM "File"');
    const totalFiles = parseInt(totalFilesResult.rows[0].count);

    const recentUsersResult = await pool.query(
      `SELECT COUNT(*) as count FROM "Felhasznalo" 
       WHERE letrehozas_idopont >= NOW() - INTERVAL '7 days'`
    );

    const recentProjectsResult = await pool.query(
      `SELECT COUNT(*) as count FROM "Projekt" 
       WHERE letrehozas_idopont >= NOW() - INTERVAL '7 days'`
    );

    const recentSubmissionsResult = await pool.query(
      `SELECT COUNT(*) as count FROM "Beadas" 
       WHERE bekuldes_idopont >= NOW() - INTERVAL '7 days'`
    );

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          byRole: usersByRoleResult.rows
        },
        projects: {
          total: totalProjects,
          byStatus: projectsByStatusResult.rows
        },
        submissions: {
          total: totalSubmissions,
          byStatus: submissionsByStatusResult.rows
        },
        messages: {
          total: totalMessages
        },
        files: {
          total: totalFiles
        },
        recentActivity: {
          newUsers: parseInt(recentUsersResult.rows[0].count),
          newProjects: parseInt(recentProjectsResult.rows[0].count),
          newSubmissions: parseInt(recentSubmissionsResult.rows[0].count)
        }
      }
    });
  } catch (error) {
    console.error('Hiba a statisztikák lekérése során:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a statisztikák lekérése során'
    });
  }
});

module.exports = router;
