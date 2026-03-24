const fs = require('fs');
const path = require('path');

const databaseConfig = require('../database');

const outputPath = path.resolve(__dirname, '../database.json');

fs.writeFileSync(outputPath, JSON.stringify(databaseConfig, null, 2), 'utf8');
console.log(`Generated ${outputPath}`);
