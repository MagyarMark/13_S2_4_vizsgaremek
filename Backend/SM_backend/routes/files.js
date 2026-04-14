const express = require('express');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const { 
    felhFeltoltesiElozmeny,
    beadasFileok, 
    felhEngedelyBeadas
} = require('../utils/filekov');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');

const router = express.Router();

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
            error: error.message
        });
    }
});

// beadások listája a kapcsolódó adatokkal
router.get('/submission', verifyToken, async (req, res) => {
    try {
        const beadasResult = await pool.query(
            `SELECT 
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
             ORDER BY b.ertekeles_idopont DESC NULLS LAST`
        );

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
            error: error.message
        });
    }
});

// egy konkrét beadáshoz tartozó fájlok lekérése
router.get('/submission/:submission_id', verifyToken, async (req, res) => {
    try {
        const { submission_id } = req.params;
        const beadas_id = submission_id;
    
        const authorized = await felhEngedelyBeadas(req.user.id, beadas_id);
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
    body('feladat_id'),
    body('felhasznalo_id'),
    body('tanar_id'),
    body('pontszam'),
    body('maxpontszam'),
    body('jegy'),
    body('statusz'),
    body('visszajelzes'),
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
        const { feladat_id, felhasznalo_id, tanar_id, pontszam, maxpontszam, jegy, statusz, visszajelzes, ertekeles_idopont} = req.body;

        const beadas = await pool.query(
            `INSERT INTO "Beadas" (feladat_id, felhasznalo_id, tanar_id, pontszam, maxpontszam, jegy, statusz, visszajelzes, ertekeles_idopont)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, feladat_id, felhasznalo_id, tanar_id, pontszam, maxpontszam, jegy, statusz, visszajelzes, bekuldes_idopont, ertekeles_idopont`,
             [feladat_id, felhasznalo_id, tanar_id, pontszam, maxpontszam, jegy, statusz, visszajelzes, ertekeles_idopont]
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
            error: error.message
        });
    }
});

// fájlok listázása feladat id alapján
router.get('/task/:task_id', verifyToken, async (req, res) => {
    try {
        const { task_id } = req.params;

        const result = await pool.query(
            `SELECT f.id, f.file_nev, f.file_meret, f.file_tipus, f.feltoltes_idopont, f.feladat_id, f.felhasznalo_id,
                    fu.teljes_nev as feltolto_nev, fu.felhasznalonev
             FROM "File" f
             LEFT JOIN "Felhasznalo" fu ON f.felhasznalo_id = fu.id
             WHERE f.feladat_id = $1
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
            error: error.message
        });
    }
});

// fájlok listázása projekt id alapján (az összes feladathoz tartozó fájl)
router.get('/project/:project_id', verifyToken, async (req, res) => {
    try {
        const { project_id } = req.params;

        const result = await pool.query(
            `SELECT f.id, f.file_nev, f.file_meret, f.file_tipus, f.feltoltes_idopont, f.feladat_id, f.felhasznalo_id,
                    fu.teljes_nev as feltolto_nev, fu.felhasznalonev,
                    ft.feladat_nev
             FROM "File" f
             LEFT JOIN "Felhasznalo" fu ON f.felhasznalo_id = fu.id
             LEFT JOIN "Feladat" ft ON f.feladat_id = ft.id
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
            error: error.message
        });
    }
});

// fájl letöltése - projekt tagok és tanárok számára elérhető
router.get('/download/:file_id', verifyToken, async (req, res) => {
    try {
        const { file_id } = req.params;

        const fileResult = await pool.query(
            `SELECT f.id, f.felhasznalo_id, f.file_eleresiut, f.file_nev, f.feladat_id,
                    ft.projekt_id
             FROM "File" f
             LEFT JOIN "Feladat" ft ON f.feladat_id = ft.id
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

        if (!file.file_eleresiut || !fs.existsSync(file.file_eleresiut)) {
            return res.status(404).json({
                success: false,
                message: 'A fájl nem található a szerveren'
            });
        }

        res.download(file.file_eleresiut, file.file_nev);
    } catch (error) {
        console.error('Szerver hiba a fájl letöltése során:', error);
        return res.status(500).json({
            success: false,
            message: 'Szerver hiba a fájl letöltése során',
            error: error.message
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
        const isTeacher = req.user.szerep_tipus === 'tanar';

        if (!isOwner && !isAdmin && !isTeacher) {
            return res.status(403).json({
                success: false,
                message: 'Nincs jogosultsága a fájl törléséhez'
            });
        }

        if (file.file_eleresiut) {
            try {
                if (fs.existsSync(file.file_eleresiut)) {
                    await fs.promises.unlink(file.file_eleresiut);
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
            error: error.message
        });
    }
});

module.exports = router;