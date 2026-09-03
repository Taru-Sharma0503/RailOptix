const env = require('./env');

let redisClient = null;
let redisAvailable = false;

async function initRedis() {
  if (!env.redisUrl) {
    console.log('Redis URL not configured — using in-memory job store');
    return null;
  }

  try {
    const { createClient } = require('redis');
    redisClient = createClient({ url: env.redisUrl });
    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
      redisAvailable = false;
    });
    redisClient.on('connect', () => {
      console.log('Redis connected');
      redisAvailable = true;
    });
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error('Redis connection failed, using in-memory fallback:', err.message);
    redisAvailable = false;
    return null;
  }
}

function getRedis() {
  return redisAvailable ? redisClient : null;
}

module.exports = { initRedis, getRedis, redisAvailable: () => redisAvailable };
