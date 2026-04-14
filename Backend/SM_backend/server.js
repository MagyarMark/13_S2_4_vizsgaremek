require('dotenv').config({ path: './.env' });

const app = require('./app');
const http = require('http');
const server = http.createServer(app);
const swaggerDocs = require('./swagger');

const initializeChat = require('./chat/application');
// itt indul el a chat szerver része a fő http szerveren
initializeChat(server, app);

// ez egy gyors állapot ellenőrző végpont
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'A Smart Manager API fut',
    timestamp: new Date().toISOString()
  });
});

// favicon kérést ignorálunk, hogy ne legyen felesleges log
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
// swagger dokumentáció endpointok bekötése
swaggerDocs(app, PORT);

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

// itt indul el ténylegesen a szerver a megadott porton
server.listen(PORT, 'localhost', () => {
  console.log(`A szerver a következő porton fut:${PORT}`);
  console.log(`Környezet: ${process.env.NODE_ENV || 'fejlesztői'}`);
});