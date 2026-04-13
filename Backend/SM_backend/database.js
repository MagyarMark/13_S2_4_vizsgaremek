require('dotenv').config({ path: './.env' });

// db-migrate környezetenkénti adatbázis beállítások
module.exports = {
	dev: {
		driver: 'pg',
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		port: Number(process.env.DB_PORT) || 5432,
	},
	test: {
		driver: 'pg',
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		port: Number(process.env.DB_PORT) || 5432,
	},
	production: {
		driver: 'pg',
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		port: Number(process.env.DB_PORT) || 5432,
	},
};