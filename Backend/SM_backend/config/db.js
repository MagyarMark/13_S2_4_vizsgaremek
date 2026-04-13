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

// itt jön létre az adatbázis kapcsolat pool
const pool = new Pool({
  host: selectedConfig.host || process.env.DB_HOST,
  port: selectedConfig.port || process.env.DB_PORT,
  database: selectedConfig.database || process.env.DB_NAME,
  user: selectedConfig.user || process.env.DB_USER,
  password: selectedConfig.password || process.env.DB_PASSWORD,
});

// sikeres kapcsolódás logolása
pool.on('connect', () => {
  console.log('Csatlakoztatva a  PostgreSQL adatbázishoz.');
});

// kapcsolat hibák logolása
pool.on('error', (err) => {
  console.error('Adatbázis csatlaklozási hiba:', err);
});

module.exports = pool;