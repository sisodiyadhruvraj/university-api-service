require('dotenv').config();

const createApp = require('./app');
const { initDb, closeDb } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

initDb();
const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`University API service listening on port ${PORT}`);
  logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    closeDb();
    logger.info('Server closed. Bye!');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

module.exports = server;
