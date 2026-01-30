const express = require('express');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const { 
    felhFeltoltesiElozmeny,
    beadasFileok, 
    felhEngedelyBeadas
} = require('../utils/filekov');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const router = express.Router();

router.get('/feltoltesek', verifyToken, async (req, res) => {
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

router.get('/beadas', verifyToken, async (req, res) => {
    try {
        const beadasResult = await pool.query(
            `SELECT 
                b.id, 
                b.feladat_id, 
                b.felhasznalo_id, 
                b.tanar_id, 
                b.pontszam, 
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

router.get('/beadas/:beadas_id', verifyToken, async (req, res) => {
    try {
        const { beadas_id } = req.params;
    
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

router.post('/beadas', verifyToken, [
    body('feladat_id'),
    body('felhasznalo_id'),
    body('tanar_id'),
    body('pontszam'),
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
        const { feladat_id, felhasznalo_id, tanar_id, pontszam, jegy, statusz, visszajelzes, ertekeles_idopont} = req.body;

        const beadas = await pool.query(
            `INSERT INTO "Beadas" (feladat_id, felhasznalo_id, tanar_id, pontszam, jegy, statusz, visszajelzes, ertekeles_idopont)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, feladat_id, felhasznalo_id, tanar_id, pontszam, jegy, statusz, visszajelzes, bekuldes_idopont, ertekeles_idopont`,
             [feladat_id, felhasznalo_id, tanar_id, pontszam, jegy, statusz, visszajelzes, ertekeles_idopont]
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
