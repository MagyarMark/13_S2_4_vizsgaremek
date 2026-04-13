const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  // swagger alap adatok és yaml források
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartManager API Dokumentáció',
      description: 'API végpontok a SmartManager webalkalmazáshoz, Swagger segitségével dokumentálva.',
      contact: {
        name: 'Magyar Mark, Nagy Huba',
        email: 'smartmanager.help@gmail.com',
        url: 'https://github.com/MagyarMark/13_S2_4_vizsgaremek'
      },
      version: '1.0.0'
    }
  },
  apis: ['./routes/*.yaml']
};

const swaggerSpec = swaggerJsdoc(options);

// swagger felület és json leírás publikusan elérhetővé tétele
function swaggerDocs(app, port) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = swaggerDocs;