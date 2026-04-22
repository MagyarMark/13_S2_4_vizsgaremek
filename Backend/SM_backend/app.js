const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const pool = require('./config/db');
const filesPayloadExists = require('./middleware/filesPayloadExists');
const fileExtLimiter = require('./middleware/fileExtLimiter');
const fileSizeLimiter = require('./middleware/fileSizeLimiter');
const { verifyToken } = require('./middleware/auth');
const { clientErrorDetail } = require('./utils/clientErrorDetail');

const app = express();

// CORS beállítás: csak engedélyezett originek kapnak hozzáférést
const corsOriginsRaw = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174';
const corsAllowed = corsOriginsRaw.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (corsAllowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// rate limiter az auth végpontokhoz
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Túl sok kérés. Próbáld újra később.'
  }
});

// szükséges oszlopok hozzáadása a File táblához, ha még nem léteznek
pool.query('ALTER TABLE "File" ADD COLUMN IF NOT EXISTS feladat_id integer').catch(err => {
    console.error('Hiba a feladat_id oszlop hozzáadásakor:', err.message);
});

// a kezdőoldal html fájlt ad vissza
app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

// ez az egyszerű fájlfeltöltő végpont, tokennel védve
app.post('/api/upload', 
    verifyToken,
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter(['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.doc', '.docx', '.txt', '.zip']),
    fileSizeLimiter, 
    async (req, res) => {
        try {
            const files = req.files;
            const felhasznalo_id = req.user.id;
            const feladat_id = (req.query && req.query.feladat_id) || (req.body && req.body.feladat_id);
            
            if (!feladat_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'A feladat_id megadása kötelező'
                });
            }

            const feladatIdNum = Number(feladat_id);
            if (!Number.isFinite(feladatIdNum)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Érvényes feladat_id szükséges'
                });
            }

            const beadasLookup = await pool.query(
                `SELECT id FROM "Beadas" WHERE feladat_id = $1 AND felhasznalo_id = $2`,
                [feladatIdNum, felhasznalo_id]
            );

            if (beadasLookup.rows.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Ehhez a feladathoz nincs beadásod. Előbb hozd létre a beadást, majd tölts fel fájlt.'
                });
            }

            const resolvedBeadasId = beadasLookup.rows[0].id;
            
            const uploadedFiles = [];
            const errors = [];

            for (const key of Object.keys(files)) {
                try {
                    const file = files[key];
                    const safeOriginalName = path.basename(file.name || 'file');
                    const ext = path.extname(safeOriginalName);
                    const storedFileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
                    const filepath = path.join(__dirname, 'files', storedFileName);
                    const fileSizeBytes = file.size;
                    const fileType = path.extname(safeOriginalName);
                    const feltoltes_idopont = new Date();

                    await file.mv(filepath);

                    const query = `
                        INSERT INTO "File" (beadas_id, feladat_id, felhasznalo_id, file_nev, file_meret, file_tipus, feltoltes_idopont, file_eleresiut)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        RETURNING id
                    `;
                    
                    const result = await pool.query(query, [
                        resolvedBeadasId,
                        feladatIdNum,
                        felhasznalo_id,
                        safeOriginalName,
                        fileSizeBytes,
                        fileType,
                        feltoltes_idopont,
                        storedFileName
                    ]);

                    uploadedFiles.push({
                        name: safeOriginalName,
                        storedAs: storedFileName,
                        id: result.rows[0].id
                    });

                } catch (error) {
                    errors.push({
                        file: key,
                        error: clientErrorDetail(error) || 'Ismeretlen hiba'
                    });
                    console.error(`Hiba a ${key} fájl feltöltésekor:`, error);
                }
            }

            if (uploadedFiles.length > 0) {
                return res.json({
                    status: 'success',
                    message: `${uploadedFiles.length} fájl sikeresen feltöltve`,
                    uploadedFiles: uploadedFiles,
                    uploadInfo: {
                        felhasznalo_id: felhasznalo_id,
                        felhasznalonev: req.user.felhasznalonev,
                        feladat_id: feladatIdNum,
                        beadas_id: resolvedBeadasId
                    }
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
                error: clientErrorDetail(error)
            });
        }
    }
)

const fileRoutes = require('./routes/files');
// fájlokhoz tartozó api-k
app.use('/api/files', fileRoutes);

const authRoutes = require('./routes/auth');
// bejelentkezés és profil api-k (rate limittel védve)
app.use('/api/auth', authLimiter, authRoutes);

const projectRoutes = require('./routes/project');
// projektekhez, feladatokhoz és statokhoz tartozó api-k
app.use('/api/project', projectRoutes);

const messagesRoutes = require('./routes/messages');
// üzenetkezelő api-k
app.use('/api/messages', messagesRoutes);

const adminRoutes = require('./routes/admin');
// admin jogosultságú api-k
app.use('/api/admin', adminRoutes);

module.exports = app;

