const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'University API Service',
      version: '1.0.0',
      description:
        'A REST API service that wraps the public Hipolabs Universities API with search, favourites, caching, pagination, and search history.',
      contact: { name: 'API Support' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development server' },
    ],
    tags: [
      { name: 'Universities', description: 'Search and lookup universities' },
      { name: 'Favourites', description: 'Persist and manage favourite universities' },
      { name: 'History', description: 'Search history' },
    ],
    components: {
      schemas: {
        University: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Indian Institute of Technology Delhi' },
            country: { type: 'string', example: 'India' },
            domain: { type: 'string', example: 'iitd.ac.in' },
            website: { type: 'string', example: 'http://www.iitd.ac.in' },
          },
        },
        Favourite: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Indian Institute of Technology Delhi' },
            country: { type: 'string', example: 'India' },
            domain: { type: 'string', nullable: true, example: 'iitd.ac.in' },
            website: { type: 'string', nullable: true, example: 'http://www.iitd.ac.in' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        FavouriteInput: {
          type: 'object',
          required: ['name', 'country'],
          properties: {
            name: { type: 'string', example: 'Indian Institute of Technology Delhi' },
            country: { type: 'string', example: 'India' },
            domain: { type: 'string', example: 'iitd.ac.in' },
            website: { type: 'string', example: 'http://www.iitd.ac.in' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'ValidationError' },
            message: { type: 'string', example: 'Query parameter "country" is required' },
            statusCode: { type: 'integer', example: 400 },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
