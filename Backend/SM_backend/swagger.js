const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartManager API Dokumentacio',
      description: 'API vegpontok a SmartManager webalkalmazashoz, Swagger segitsegevel dokumentalva.',
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

function swaggerDocs(app, port) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = swaggerDocs;