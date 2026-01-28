const express = require('express');
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
    body('tanar_id'),
    body('pontszam'),
    body('jegy'),
    body('statusz'),
    body('visszajelzes')
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
        const { feladat_id, tanar_id, pontszam, jegy, statusz, visszajelzes} = req.body;
        const felhasznalo_id = req.user.id;

        const beadas = await pool.query(
            `INSERT INTO "Beadas" (feladat_id, felhasznalo_id, tanar_id, pontszam, jegy, statusz, visszajelzes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, feladat_id, felhasznalo_id, tanar_id, pontszam, jegy, statusz, visszajelzes, bekuldes_idopont, ertekeles_idopont`,
             [feladat_id, felhasznalo_id, tanar_id, pontszam, jegy, statusz, visszajelzes]
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

module.exports = router;
