const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: './.env' });

const databaseJsonPath = path.resolve(__dirname, '../database.json');
let generatedConfig = {};

// ha van generált adatbázis beállítás, akkor innen olvasunk
try {
  generatedConfig = JSON.parse(fs.readFileSync(databaseJsonPath, 'utf8'));
} catch (error) {
  generatedConfig = {};
}

const environment = process.env.DB_ENV || process.env.NODE_ENV || 'dev';
const selectedConfig = generatedConfig[environment] || generatedConfig.dev || {};

function pickPort() {
  const fromEnv = process.env.DB_PORT;
  if (fromEnv !== undefined && fromEnv !== '') {
    const n = Number(fromEnv);
    return Number.isFinite(n) ? n : 5432;
  }
  const fromFile = selectedConfig.port;
  if (fromFile !== undefined && fromFile !== '') {
    const n = Number(fromFile);
    return Number.isFinite(n) ? n : 5432;
  }
  return 5432;
}

// itt jön létre az adatbázis kapcsolat pool
const pool = new Pool({
  host: process.env.DB_HOST || selectedConfig.host,
  port: pickPort(),
  database: process.env.DB_NAME || selectedConfig.database,
  user: process.env.DB_USER || selectedConfig.user,
  password: process.env.DB_PASSWORD || selectedConfig.password,
});

// sikeres kapcsolódás logolása (csak fejlesztői módban)
if (process.env.NODE_ENV !== 'production') {
  pool.on('connect', () => {
    console.log('Csatlakoztatva a  PostgreSQL adatbázishoz.');
  });
}

// kapcsolat hibák logolása
pool.on('error', (err) => {
  console.error('Adatbázis csatlakozási hiba:', err);
});

module.exports = pool;