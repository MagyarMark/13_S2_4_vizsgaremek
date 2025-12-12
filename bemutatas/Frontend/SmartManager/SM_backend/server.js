const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'A Smart Manager API fut',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`A szerver a következő porton fut:${PORT}`);
  console.log(`Környezet: ${process.env.NODE_ENV || 'fejlesztői'}`);
});