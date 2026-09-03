const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const networkRoutes = require('./routes/network.routes');
const assetsRoutes = require('./routes/assets.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const predictionRoutes = require('./routes/prediction.routes');
const trainsRoutes = require('./routes/trains.routes');
const blocksRoutes = require('./routes/blocks.routes');
const optimizationRoutes = require('./routes/optimization.routes');
const simulationRoutes = require('./routes/simulation.routes');
const conflictsRoutes = require('./routes/conflicts.routes');
const planningRoutes = require('./routes/planning.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const historyRoutes = require('./routes/history.routes');
const departmentsRoutes = require('./routes/departments.routes');

const { successResponse } = require('./utils/helpers');

function createApp() {
  const app = express();

  app.use(cors({
    origin: env.frontendUrl || true,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (req, res) => {
    res.json(successResponse({ message: 'RailOptix backend is running' }));
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/network', networkRoutes);
  app.use('/api/assets', assetsRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/predictions', predictionRoutes);
  app.use('/api/trains', trainsRoutes);
  app.use('/api/blocks', blocksRoutes);
  app.use('/api/optimize', optimizationRoutes);
  app.use('/api/simulation', simulationRoutes);
  app.use('/api/conflicts', conflictsRoutes);
  app.use('/api/planning', planningRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/departments', departmentsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
