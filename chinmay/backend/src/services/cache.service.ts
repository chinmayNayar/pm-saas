import { redisClient } from "../config/redis";

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      // No cache in dev if Redis unavailable.
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await redisClient.setEx(key, ttlSeconds, payload);
      } else {
        await redisClient.set(key, payload);
      }
    } catch {
      // ignore in dev
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch {
      // ignore in dev
    }
  }
}

export const cacheService = new CacheService();

