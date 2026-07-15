const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const requestLogger = require("./middleware/requestLogger");
const rateLimiter = require("./middleware/rateLimiter");
const {
  notFoundHandler,
  globalErrorHandler,
} = require("./middleware/errorHandler");

const universityRoutes = require("./routes/universityRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");
const historyRoutes = require("./routes/historyRoutes");

function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "https:", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "validator.swagger.io"],
        },
      },
    }),
  );
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.use(rateLimiter);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

  app.use("/api/universities", universityRoutes);
  app.use("/api/favourites", favouriteRoutes);
  app.use("/api/search-history", historyRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

module.exports = createApp;
