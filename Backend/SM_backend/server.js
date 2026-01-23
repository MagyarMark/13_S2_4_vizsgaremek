require('dotenv').config({ path: './.env' });

const app = require('./app');
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'A Smart Manager API fut',
    timestamp: new Date().toISOString()
  });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
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