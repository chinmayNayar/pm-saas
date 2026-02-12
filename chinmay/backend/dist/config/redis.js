"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.initRedis = initRedis;
const redis_1 = require("redis");
const env_1 = require("./env");
const logger_1 = require("./logger");
exports.redisClient = (0, redis_1.createClient)({ url: env_1.env.redisUrl });
exports.redisClient.on("error", (err) => {
    logger_1.logger.error("Redis Client Error", err);
});
async function initRedis() {
    if (!exports.redisClient.isOpen) {
        await exports.redisClient.connect();
        logger_1.logger.info("Connected to Redis");
    }
}
