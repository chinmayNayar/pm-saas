"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenStore = void 0;
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
const REFRESH_USER_KEY = (userId) => `auth:rt:user:${userId}`;
const REFRESH_BLACKLIST_KEY = (jti) => `auth:rt:blacklist:${jti}`;
const ACCESS_BLACKLIST_KEY = (jti) => `auth:at:blacklist:${jti}`;
exports.tokenStore = {
    async setUserRefreshJti(userId, jti) {
        await redis_1.redisClient.setEx(REFRESH_USER_KEY(userId), env_1.env.jwt.refreshExpiresInSec, jti);
    },
    async getUserRefreshJti(userId) {
        return redis_1.redisClient.get(REFRESH_USER_KEY(userId));
    },
    async deleteUserRefreshJti(userId) {
        await redis_1.redisClient.del(REFRESH_USER_KEY(userId));
    },
    async blacklistRefreshJti(jti, ttlSec) {
        await redis_1.redisClient.setEx(REFRESH_BLACKLIST_KEY(jti), ttlSec, "1");
    },
    async isRefreshJtiBlacklisted(jti) {
        return !!(await redis_1.redisClient.get(REFRESH_BLACKLIST_KEY(jti)));
    },
    async blacklistAccessJti(jti, ttlSec) {
        await redis_1.redisClient.setEx(ACCESS_BLACKLIST_KEY(jti), ttlSec, "1");
    },
    async isAccessJtiBlacklisted(jti) {
        return !!(await redis_1.redisClient.get(ACCESS_BLACKLIST_KEY(jti)));
    }
};
