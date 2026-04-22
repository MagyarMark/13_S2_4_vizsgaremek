const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const { 
    felhFeltoltesiElozmeny,
    beadasFileok, 
    felhEngedelyBeadas
} = require('../utils/filekov');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { clientErrorDetail } = require('../utils/clientErrorDetail');

const router = express.Router();

// ellenőrzi, hogy a user tagja-e a projektnek
async function userHasProjektAccess(felhasznaloId, projektId) {
    const r = await pool.query(
        `SELECT 1
         FROM "Projekt" p
         LEFT JOIN "ProjektTag" pt ON p.id = pt.projekt_id
         WHERE p.id = $1 AND (p.letrehozo_id = $2 OR pt.felhasznalo_id = $2)
         LIMIT 1`,
        [projektId, felhasznaloId]
    );
    return r.rows.length > 0;
}

// user feltöltési előzményének lekérése
router.get('/upload', verifyToken, async (req, res) => {
    try {
        const felhasznalo_id = req.user.id;
        const { beadas_id } = req.query;
        
        const uploadHistory = await felhFeltoltesiElozmeny(felhasznalo_id, beadas_id || null);
        
        res.json({
            success: true,
            data: {
                felhasznalo_id: felhasznalo_id,
                felhasznalonev: req.user.felhasznalonev,
                uploads: uploadHistory,
                count: uploadHistory.length
            }
        });
    } catch (error) {
        console.error('Hiba a feltöltések lekérdezésekor:', error);
        res.status(500).json({
            success: false,
            message: 'Hiba a feltöltések lekérdezésekor',
            error: clientErrorDetail(error)
        });
    }
});

// beadások listája a kapcsolódó adatokkal (szerep alapú szűréssel)
router.get('/submission', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.szerep_tipus;

        const baseSelect = `
            SELECT 
                b.id, 
                b.feladat_id, 
                b.felhasznalo_id, 
                b.tanar_id, 
                b.pontszam,
                b.maxpontszam, 
                b.jegy, 
                b.statusz, 
                b.visszajelzes, 
                b.bekuldes_idopont, 
                b.ertekeles_idopont,
                f.teljes_nev as student_name,
                ft.feladat_nev as task_name
             FROM "Beadas" b
             LEFT JOIN "Felhasznalo" f ON b.felhasznalo_id = f.id
             LEFT JOIN "Feladat" ft ON b.feladat_id = ft.id
        `;

        let beadasResult;
        if (role === 'admin') {
            beadasResult = await pool.query(
                `${baseSelect}
             ORDER BY b.ertekeles_idopont DESC NULLS LAST`
            );
        } else if (role === 'tanar') {
            beadasResult = await pool.query(
                `${baseSelect}
             WHERE b.tanar_id = $1 OR b.felhasznalo_id = $1
             ORDER BY b.ertekeles_idopont DESC NULLS LAST`,
                [userId]
            );
        } else {
            beadasResult = await pool.query(
                `${baseSelect}
             WHERE b.felhasznalo_id = $1
             ORDER BY b.ertekeles_idopont DESC NULLS LAST`,
                [userId]
            );
        }

        res.json({
            success: true,
            data: {
                beadasList: beadasResult.rows,
                count: beadasResult.rows.length
            }
        });
    } catch (error) {
        console.error('Hiba a beadas lekérdezésekor:', error);
        res.status(500).json({
            success: false,
            message: 'Hiba a beadas lekérdezésekor',
            error: clientErrorDetail(error)
        });
    }
});

// egy konkrét beadáshoz tartozó fájlok lekérése
router.get('/submission/:submission_id', verifyToken, async (req, res) => {
    try {
        const { submission_id } = req.params;
        const beadas_id = submission_id;
    
        const authorized = await felhEngedelyBeadas(req.user, beadas_id);
        if (!authorized) {
            return res.status(404).json({
                success: false,
                message: 'Az adott beadas nem létezik'
            });
        }
        
        const files = await beadasFileok(beadas_id);
        
        res.json({
            success: true,
            data: {
                beadas_id: beadas_id,
                files: files,
                count: files.length
            }
        });
    } catch (error) {
        console.error('Hiba a beadas fájljai lekérdezésekor:', error);
        res.status(500).json({
            success: false,
            message: 'Hiba a beadas fájljai lekérdezésekor',
            error: error.message
        });
    }
});

// új beadás rekord létrehozása
router.post('/submissionCreate', verifyToken, [
    body('feladat_id').notEmpty().isInt({ min: 1 }).withMessage('feladat_id kötelező'),
    body('felhasznalo_id').optional().isInt({ min: 1 }),
    body('tanar_id').optional().isInt({ min: 1 }),
    body('pontszam').optional().isNumeric(),
    body('maxpontszam').optional().isNumeric(),
    body('jegy').optional().isInt({ min: 1, max: 5 }),
    body('statusz').optional(),
    body('visszajelzes').optional(),
    body('ertekeles_idopont').optional()
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

      const role = req.user.szerep_tipus;
      const userId = req.user.id;
      let {
        feladat_id,
        felhasznalo_id,
        tanar_id,
        pontszam,
        maxpontszam,
        jegy,
        statusz,
        visszajelzes,
        ertekeles_idopont
      } = req.body;

      const feladatResult = await pool.query(
        `SELECT id, felelos_id, letrehozo_id, projekt_id FROM "Feladat" WHERE id = $1`,
        [feladat_id]
      );

      if (feladatResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Feladat nem található'
        });
      }

      const feladat = feladatResult.rows[0];

      if (role === 'admin') {
        if (felhasznalo_id == null || tanar_id == null) {
          return res.status(400).json({
            success: false,
            message: 'Admin létrehozáshoz felhasznalo_id és tanar_id megadása kötelező'
          });
        }
      } else if (role === 'diak') {
        felhasznalo_id = userId;
        tanar_id = feladat.felelos_id != null ? feladat.felelos_id : feladat.letrehozo_id;
        if (!(await userHasProjektAccess(userId, feladat.projekt_id))) {
          return res.status(403).json({
            success: false,
            message: 'Nincs jogosultságod ehhez a feladathoz'
          });
        }
      } else if (role === 'tanar') {
        if (felhasznalo_id == null) {
          return res.status(400).json({
            success: false,
            message: 'A diák felhasználó azonosítója (felhasznalo_id) kötelező'
          });
        }
        tanar_id = userId;
        if (!(await userHasProjektAccess(userId, feladat.projekt_id))) {
          return res.status(403).json({
            success: false,
            message: 'Nincs jogosultságod ehhez a feladathoz'
          });
        }
        if (!(await userHasProjektAccess(felhasznalo_id, feladat.projekt_id))) {
          return res.status(400).json({
            success: false,
            message: 'A megadott diák nem tagja a projektnek'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Nincs jogosultság beadás létrehozásához'
        });
      }

        const beadas = await pool.query(
            `INSERT INTO "Beadas" (feladat_id, felhasznalo_id, tanar_id, pontszam, maxpontszam, jegy, statusz, visszajelzes, ertekeles_idopont)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, feladat_id, felhasznalo_id, tanar_id, pontszam, maxpontszam, jegy, statusz, visszajelzes, bekuldes_idopont, ertekeles_idopont`,
             [
               feladat_id,
               felhasznalo_id,
               tanar_id,
               pontszam ?? null,
               maxpontszam ?? 100,
               jegy ?? null,
               statusz ?? 'hiányzik',
               visszajelzes ?? null,
               ertekeles_idopont ?? null
             ]
        );
        res.status(201).json({
            success: true,
            message: 'Sikeres beadas létrehozás',
            data: {
                beadas: beadas.rows[0]
            }
        });
        } catch (error) {
        console.error('Szerver hiba a beadas létrehozása során:', error);
        res.status(500).json({
            success: false,
            message: 'Szerver hiba a beadas létrehozása során'
        });
    }
});

// meglévő beadás frissítése jogosultság ellenőrzéssel
router.put('/submissionUpdate/:submission_id', verifyToken, [
    body('pontszam')
        .optional()
        .isNumeric()
        .withMessage('Pontszám számnak kell lennie'),
    body('maxpontszam')
        .optional()
        .isNumeric()
        .withMessage('Számnak kell lennie'),
    body('jegy')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Jegy 1 és 5 között kell legyen'),
    body('statusz')
        .optional()
        .isIn(['beadva', 'ertekelt', 'javitasra_visszaadva'])
        .withMessage('Érvényes státusz: beadva, ertekelt, javitasra_visszaadva'),
    body('visszajelzes')
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

        const { submission_id } = req.params;
        const beadas_id = submission_id;
        const userId = req.user.id;
        const userRole = req.user.szerep_tipus;
        const { pontszam, maxpontszam, jegy, statusz, visszajelzes } = req.body;

        const beadasCheck = await pool.query(
            'SELECT id, felhasznalo_id, tanar_id FROM "Beadas" WHERE id = $1',
            [beadas_id]
        );

        if (beadasCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Beadás nem található'
            });
        }

        const beadas = beadasCheck.rows[0];
        const isOwner = beadas.felhasznalo_id === userId;
        const isTeacher = beadas.tanar_id === userId || userRole === 'tanar' || userRole === 'admin';

        if (!isOwner && !isTeacher) {
            return res.status(403).json({
                success: false,
                message: 'Nincs jogosultsága a beadás módosításához'
            });
        }

        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (pontszam !== undefined) {
            updateFields.push(`pontszam = $${paramCount}`);
            updateValues.push(pontszam);
            paramCount++;
        }

        if (maxpontszam !== undefined) {
            updateFields.push(`maxpontszam = $${paramCount}`);
            updateValues.push(maxpontszam);
            paramCount++;
        }

        if (jegy !== undefined) {
            updateFields.push(`jegy = $${paramCount}`);
            updateValues.push(jegy);
            paramCount++;
        }

        if (statusz !== undefined) {
            updateFields.push(`statusz = $${paramCount}`);
            updateValues.push(statusz);
            paramCount++;
        }

        if (visszajelzes !== undefined) {
            updateFields.push(`visszajelzes = $${paramCount}`);
            updateValues.push(visszajelzes);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nincs megadva frissítendő adat'
            });
        }

        if (pontszam !== undefined || maxpontszam !== undefined || jegy !== undefined || visszajelzes !== undefined) {
            updateFields.push(`ertekeles_idopont = NOW()`);
        }

        updateValues.push(beadas_id);

        const updateQuery = `
            UPDATE "Beadas" 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING id, feladat_id, felhasznalo_id, tanar_id, pontszam, maxpontszam, jegy, statusz, visszajelzes, bekuldes_idopont, ertekeles_idopont
        `;

        const updatedBeadas = await pool.query(updateQuery, updateValues);

        res.json({
            success: true,
            message: 'Beadás sikeresen frissítve',
            data: {
                beadas: updatedBeadas.rows[0]
            }
        });
    } catch (error) {
        console.error('Szerver hiba a beadás frissítése során:', error);
        res.status(500).json({
            success: false,
            message: 'Szerver hiba a beadás frissítése során',
            error: clientErrorDetail(error)
        });
    }
});

// fájlok listázása feladat id alapján
router.get('/task/:task_id', verifyToken, async (req, res) => {
    try {
        const { task_id } = req.params;

        const result = await pool.query(
            `SELECT f.id, f.file_nev, f.file_meret, f.file_tipus, f.feltoltes_idopont,
                    COALESCE(f.feladat_id, b.feladat_id) as feladat_id,
                    f.felhasznalo_id,
                    fu.teljes_nev as feltolto_nev, fu.felhasznalonev
             FROM "File" f
             LEFT JOIN "Beadas" b ON f.beadas_id = b.id
             LEFT JOIN "Felhasznalo" fu ON f.felhasznalo_id = fu.id
             WHERE COALESCE(f.feladat_id, b.feladat_id) = $1
             ORDER BY f.feltoltes_idopont DESC`,
            [task_id]
        );

        res.json({
            success: true,
            data: {
                files: result.rows,
                count: result.rows.length
            }
        });
    } catch (error) {
        console.error('Hiba a feladat fájljai lekérdezésekor:', error);
        res.status(500).json({
            success: false,
            message: 'Hiba a feladat fájljai lekérdezésekor',
            error: clientErrorDetail(error)
        });
    }
});

// fájlok listázása projekt id alapján (az összes feladathoz tartozó fájl)
router.get('/project/:project_id', verifyToken, async (req, res) => {
    try {
        const { project_id } = req.params;

        const result = await pool.query(
            `SELECT f.id, f.file_nev, f.file_meret, f.file_tipus, f.feltoltes_idopont,
                    COALESCE(f.feladat_id, b.feladat_id) as feladat_id,
                    f.felhasznalo_id,
                    fu.teljes_nev as feltolto_nev, fu.felhasznalonev,
                    ft.feladat_nev
             FROM "File" f
             LEFT JOIN "Beadas" b ON f.beadas_id = b.id
             LEFT JOIN "Felhasznalo" fu ON f.felhasznalo_id = fu.id
             LEFT JOIN "Feladat" ft ON ft.id = COALESCE(f.feladat_id, b.feladat_id)
             WHERE ft.projekt_id = $1
             ORDER BY f.feltoltes_idopont DESC`,
            [project_id]
        );

        res.json({
            success: true,
            data: {
                files: result.rows,
                count: result.rows.length
            }
        });
    } catch (error) {
        console.error('Hiba a projekt fájljai lekérdezésekor:', error);
        res.status(500).json({
            success: false,
            message: 'Hiba a projekt fájljai lekérdezésekor',
            error: clientErrorDetail(error)
        });
    }
});

// fájl letöltése - projekt tagok és tanárok számára elérhető
router.get('/download/:file_id', verifyToken, async (req, res) => {
    try {
        const { file_id } = req.params;

        const fileResult = await pool.query(
            `SELECT f.id, f.felhasznalo_id, f.file_eleresiut, f.file_nev,
                    COALESCE(f.feladat_id, b.feladat_id) as feladat_id,
                    ft.projekt_id
             FROM "File" f
             LEFT JOIN "Beadas" b ON f.beadas_id = b.id
             LEFT JOIN "Feladat" ft ON ft.id = COALESCE(f.feladat_id, b.feladat_id)
             WHERE f.id = $1`,
            [file_id]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'A fájl nem található'
            });
        }

        const file = fileResult.rows[0];
        const userId = req.user.id;
        const userRole = req.user.szerep_tipus;

        // Tanár és admin mindig letölthet
        if (userRole !== 'tanar' && userRole !== 'admin') {
            if (file.projekt_id) {
                // Diák csak akkor tölthet le, ha tagja a projektnek
                const memberCheck = await pool.query(
                    `SELECT 1 FROM "ProjektTag" WHERE projekt_id = $1 AND felhasznalo_id = $2
                     UNION
                     SELECT 1 FROM "Projekt" WHERE id = $1 AND letrehozo_id = $2`,
                    [file.projekt_id, userId]
                );
                if (memberCheck.rows.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Nincs jogosultsága a fájl letöltéséhez'
                    });
                }
            } else {
                // Ha nincs projekt_id, csak a feltöltő tölthet le
                if (file.felhasznalo_id !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Nincs jogosultsága a fájl letöltéséhez'
                    });
                }
            }
        }

        const filePath = path.join(__dirname, '..', 'files', file.file_eleresiut);

        if (!file.file_eleresiut || !fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'A fájl nem található a szerveren'
            });
        }

        res.download(filePath, file.file_nev);
    } catch (error) {
        console.error('Szerver hiba a fájl letöltése során:', error);
        return res.status(500).json({
            success: false,
            message: 'Szerver hiba a fájl letöltése során',
            error: clientErrorDetail(error)
        });
    }
});

// fájl törlése adatbázisból és fájlrendszerből
router.delete('/:file_id', verifyToken, async (req, res) => {
    try {
        const { file_id } = req.params;

        const fileResult = await pool.query(
            `SELECT id, felhasznalo_id, file_eleresiut, file_nev
             FROM "File"
             WHERE id = $1`,
            [file_id]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'A fájl nem található'
            });
        }

        const file = fileResult.rows[0];
        const isOwner = file.felhasznalo_id === req.user.id;
        const isAdmin = req.user.szerep_tipus === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Nincs jogosultsága a fájl törléséhez'
            });
        }

        if (file.file_eleresiut) {
            try {
                const filePath = path.join(__dirname, '..', 'files', file.file_eleresiut);
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
                }
            } catch (deleteError) {
                console.error('Hiba a fájl törlésekor a fájlrendszerből:', deleteError);
            }
        }

        const deleteResult = await pool.query(
            'DELETE FROM "File" WHERE id = $1 RETURNING id',
            [file_id]
        );

        return res.json({
            success: true,
            message: 'Fájl sikeresen törölve',
            data: {
                deleted_id: deleteResult.rows[0].id,
                file_nev: file.file_nev
            }
        });
    } catch (error) {
        console.error('Szerver hiba a fájl törlése során:', error);
        return res.status(500).json({
            success: false,
            message: 'Szerver hiba a fájl törlése során',
            error: clientErrorDetail(error)
        });
    }
});

module.exports = router;