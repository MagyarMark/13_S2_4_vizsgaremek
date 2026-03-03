const { Pool } = require('pg');
const fs = require('fs');

require('dotenv').config({ path: './.env' });

const seedQuery = fs.readFileSync("seeder/seeding.sql", {
  encoding: "utf-8",
})

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
});

pool.on('connect', () => {
  console.log('Csatlakoztatva a  PostgreSQL adatbázishoz.');
});

pool.on('error', (err) => {
  console.error('Adatbázis csatlaklozási hiba:', err);
});

pool.query(seedQuery, (err, res) => {
  if (err) {
    throw err
  }
  console.log("Adatok sikeresen beillesztve az adatbázisba.");
  pool.end();
})

module.exports = pool;