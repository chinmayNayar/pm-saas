"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const redis_1 = require("../config/redis");
class CacheService {
    async get(key) {
        const value = await redis_1.redisClient.get(key);
        return value ? JSON.parse(value) : null;
    }
    async set(key, value, ttlSeconds) {
        const payload = JSON.stringify(value);
        if (ttlSeconds) {
            await redis_1.redisClient.setEx(key, ttlSeconds, payload);
        }
        else {
            await redis_1.redisClient.set(key, payload);
        }
    }
    async del(key) {
        await redis_1.redisClient.del(key);
    }
}
exports.cacheService = new CacheService();
