import crypto from 'crypto';
import Redis from 'ioredis';
import logger from '../utils/logger.js';
import env from '../config/env.js';

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.ttls = new Map();
    this.maxItems = 1000;
    this.redisClient = null;
    this.isRedisReady = false;

    // Periodically sweep expired keys in memory every 60 seconds
    this.sweepInterval = setInterval(() => this._sweepExpired(), 60000);
    if (this.sweepInterval.unref) {
      this.sweepInterval.unref();
    }

    this._initRedis();
  }

  _initRedis() {
    const redisUrl = env.redisUrl || process.env.REDIS_URL || 'redis://127.0.0.1:6379';

    try {
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 1500,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts if Redis is not running
          }
          return Math.min(times * 200, 1000);
        },
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      this.redisClient.on('connect', () => {
        this.isRedisReady = true;
        logger.info('CacheService: Connected to Redis successfully');
      });

      this.redisClient.on('error', (err) => {
        if (this.isRedisReady) {
          logger.warn('CacheService: Redis connection lost, falling back to memory', { error: err.message });
        }
        this.isRedisReady = false;
      });

      this.redisClient.connect().catch((err) => {
        logger.info('CacheService: Redis server not running locally. Operating in high-performance In-Memory cache mode.');
        this.isRedisReady = false;
      });
    } catch (err) {
      this.isRedisReady = false;
      this.redisClient = null;
      logger.info('CacheService: Initialized with In-Memory cache engine.');
    }
  }

  /**
   * Compute a deterministic SHA-256 hash for a buffer or string
   */
  computeHash(content) {
    if (!content) return null;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get an item from Redis or In-Memory fallback
   */
  async get(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        if (data) return JSON.parse(data);
      } catch (err) {
        // Fallback to memory
      }
    }

    if (!this.memoryCache.has(key)) return null;

    const expiry = this.ttls.get(key);
    if (expiry && Date.now() > expiry) {
      this.del(key);
      return null;
    }

    return this.memoryCache.get(key);
  }

  /**
   * Set an item with TTL in seconds (default: 3600 seconds = 1 hour)
   */
  async set(key, value, ttlSeconds = 3600) {
    if (this.isRedisReady && this.redisClient) {
      try {
        const payload = JSON.stringify(value);
        if (ttlSeconds > 0) {
          await this.redisClient.set(key, payload, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, payload);
        }
      } catch (err) {
        // Fallback to memory
      }
    }

    if (this.memoryCache.size >= this.maxItems) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.del(oldestKey);
    }

    this.memoryCache.set(key, value);
    if (ttlSeconds > 0) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    } else {
      this.ttls.delete(key);
    }

    return true;
  }

  /**
   * Delete an item
   */
  async del(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        // ignore
      }
    }
    this.memoryCache.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear() {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (err) {
        // ignore
      }
    }
    this.memoryCache.clear();
    this.ttls.clear();
  }

  _sweepExpired() {
    const now = Date.now();
    for (const [key, expiry] of this.ttls.entries()) {
      if (now > expiry) {
        this.memoryCache.delete(key);
        this.ttls.delete(key);
      }
    }
  }

  // --- Specialized Cache Helpers ---

  async getDocumentByHash(hash) {
    return this.get(`doc:hash:${hash}`);
  }

  async setDocumentHash(hash, data, ttlSeconds = 86400) {
    return this.set(`doc:hash:${hash}`, data, ttlSeconds);
  }

  async getDocumentText(docId) {
    return this.get(`doc:text:${docId}`);
  }

  async setDocumentText(docId, text, ttlSeconds = 14400) {
    return this.set(`doc:text:${docId}`, text, ttlSeconds);
  }

  async getKbQuery(queryHash) {
    return this.get(`kb:query:${queryHash}`);
  }

  async setKbQuery(queryHash, results, ttlSeconds = 7200) {
    return this.set(`kb:query:${queryHash}`, results, ttlSeconds);
  }
}

export default new CacheService();
