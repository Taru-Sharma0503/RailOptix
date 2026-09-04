const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');
const { initRedis } = require('./config/redis');
const { setSocketIO: setOptSocket } = require('./services/optimization.service');
const { setSocketIO: setSimSocket } = require('./services/simulation.service');

async function startServer() {
  await testConnection();
  await initRedis();

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: env.frontendUrl || true,
      credentials: true,
    },
  });

  setOptSocket(io);
  setSimSocket(io);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const port = env.port || 5000;
  server.listen(port, () => {
    console.log(`RailOptix backend running on port ${port}`);
    console.log(`Environment: ${env.nodeEnv}`);
  });

  return server;
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
