// src/services/redis/CacheService.js
const { createClient } = require('redis');

class CacheService {
  constructor() {
    this._client = createClient({
      url: process.env.REDIS_SERVER
    });

    this._client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    // Connect to Redis
    this._client.connect();
  }

  async set(key, value, expirationInSeconds) {
    await this._client.set(key, value, {
      EX: expirationInSeconds
    });
  }

  async get(key) {
    return await this._client.get(key);
  }

  async delete(key) {
    await this._client.del(key);
  }
}

module.exports = CacheService;