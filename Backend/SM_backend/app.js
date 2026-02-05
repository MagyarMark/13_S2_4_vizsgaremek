const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const swaggerjsdoc = require('swagger-jsdoc');
const swaggerui = require('swagger-ui-express');

const pool = require('./config/database');
const filesPayloadExists = require('./middleware/filesPayloadExists');
const fileExtLimiter = require('./middleware/fileExtLimiter');
const fileSizeLimiter = require('./middleware/fileSizeLimiter');
const { verifyToken } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SmartManager - API dokumentáció",
            version: "0.1",
            description: "",
            contact: {
                name: "",
                url: "",
                email: "",
            },
        },
        servers: [
            {
                url: "http://localhost:3000/",
            },
        ],
    },
    apis: [`${path.join(__dirname, "./routes/*.js")}`]
};

const specs = swaggerjsdoc(options)

app.use(
    "/api-docs",
    swaggerui.serve,
    swaggerui.setup(specs)
)

app.post('/api/upload', 
    verifyToken,
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    //fileExtLimiter(['.png','.jpg','.jpeg']),
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

            const beadas_id = feladat_id;
            
            const uploadedFiles = [];
            const errors = [];

            for (const key of Object.keys(files)) {
                try {
                    const file = files[key];
                    const filepath = path.join(__dirname, 'files', file.name);
                    const fileSizeBytes = file.size;
                    const fileType = path.extname(file.name);
                    const feltoltes_idopont = new Date();

                    await file.mv(filepath);

                    const query = `
                        INSERT INTO "File" (beadas_id, felhasznalo_id, file_nev, file_meret, file_tipus, feltoltes_idopont, file_eleresiut)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING id
                    `;
                    
                    const result = await pool.query(query, [
                        null,
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
                    uploadInfo: {
                        felhasznalo_id: felhasznalo_id,
                        felhasznalonev: req.user.felhasznalonev,
                        feladat_id: feladat_id,
                        feladat_id: feladat_id
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
                error: error.message
            });
        }
    }
)

const fileRoutes = require('./routes/files');
app.use('/api/files', fileRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/project');
app.use('/api/project', projectRoutes);

const messagesRoutes = require('./routes/messages');
app.use('/api/messages', messagesRoutes);

module.exports = app;

