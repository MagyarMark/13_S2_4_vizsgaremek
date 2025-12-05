const { Pool } = require('pg');

require('dotenv').config({ path: './.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('Csatlakoztatva a  PostgreSQL adatbázishoz.');
});

pool.on('error', (err) => {
  console.error('Adatbázis csatlaklozási hiba:', err);
});

module.exports = pool;