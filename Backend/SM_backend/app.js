const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const pool = require('./config/database');
const filesPayloadExists = require('./middleware/filesPayloadExists');
const fileExtLimiter = require('./middleware/fileExtLimiter');
const fileSizeLimiter = require('./middleware/fileSizeLimiter');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.post('/upload', 
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    //fileExtLimiter(['.png','.jpg','.jpeg']),
    fileSizeLimiter, 
    async (req, res) => {
        try {
            const files = req.files;
            //Később dinamikusan beolvasni a jelenlegi felhasználó ID-t és beadas ID-t
            const beadas_id = 2;
            const felhasznalo_id = 3;
            
            const uploadedFiles = [];
            const errors = [];

            for (const key of Object.keys(files)) {
                try {
                    const file = files[key];
                    const filepath = path.join(__dirname, 'files', file.name);
                    const fileSizeBytes = file.size;
                    const fileType = path.extname(file.name);
                    const feltoltes_idopont = new Date();

                    // Fájl mentése
                    await file.mv(filepath);

                    // Metaadat mentése az adatbázisba
                    const query = `
                        INSERT INTO "File" (beadas_id, felhasznalo_id, file_nev, file_meret, file_tipus, feltoltes_idopont, file_eleresiut)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING id
                    `;
                    
                    const result = await pool.query(query, [
                        beadas_id,
                        felhasznalo_id,
                        file.name,
                        fileSizeBytes,
                        fileType,
                        feltoltes_idopont,
                        filepath
                    ]);

                    uploadedFiles.push({
                        name: file.name,
                        id: result.rows[0].id
                    });

                } catch (error) {
                    errors.push({
                        file: key,
                        error: error.message
                    });
                    console.error(`Hiba a ${key} fájl feltöltésekor:`, error);
                }
            }

            if (uploadedFiles.length > 0) {
                return res.json({
                    status: 'success',
                    message: `${uploadedFiles.length} fájl sikeresen feltöltve`,
                    uploadedFiles: uploadedFiles,
                    errors: errors.length > 0 ? errors : undefined
                });
            } else {
                return res.status(500).json({
                    status: 'error',
                    message: 'Nem sikerült feltölteni a fájlokat',
                    errors: errors
                });
            }

        } catch (error) {
            console.error('Feltöltési hiba:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Szerver hiba a feltöltés során',
                error: error.message
            });
        }
    }
)

module.exports = app;

