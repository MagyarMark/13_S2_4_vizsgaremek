require('dotenv').config({ path: './.env' });
const { assertConfig } = require('./config/validateConfig');
assertConfig();

if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV environment variable must be set');
}

const app = require('./app');
const pool = require('./config/db');
const http = require('http');
const server = http.createServer(app);
const swaggerDocs = require('./swagger');

const initializeChat = require('./chat/application');
// itt indul el a chat szerver része a fő http szerveren
initializeChat(server, app);

// ez egy gyors állapot ellenőrző végpont, adatbázis kapcsolatot is ellenőriz
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      success: true, 
      message: 'A Smart Manager API fut',
      timestamp: new Date().toISOString(),
      db: 'connected'
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'Adatbázis kapcsolat sikertelen',
      timestamp: new Date().toISOString(),
      db: 'disconnected'
    });
  }
});

// favicon kérést ignorálunk, hogy ne legyen felesleges log
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
// swagger dokumentáció csak nem-production környezetben
if (process.env.NODE_ENV !== 'production') {
  swaggerDocs(app, PORT);
}

// ha nincs ilyen útvonal, akkor 404-et adunk vissza
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// itt kezeljük a nem elkapott szerver hibákat
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const BIND_HOST =
  process.env.BIND_HOST ||
  (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');

// itt indul el ténylegesen a szerver a megadott porton
server.listen(PORT, BIND_HOST, () => {
  console.log(`A szerver a következő címen fut: ${BIND_HOST}:${PORT}`);
  console.log(`Környezet: ${process.env.NODE_ENV}`);
});

// tiszta leállítás SIGTERM és SIGINT jelekre (pl. deployment, Ctrl+C)
function gracefulShutdown(signal) {
  console.log(`${signal} érkezett, szerver leállítása...`);
  server.close(() => {
    pool.end(() => {
      console.log('Adatbázis kapcsolat lezárva.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));