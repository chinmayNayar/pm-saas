"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const redis_1 = require("./config/redis");
const database_1 = require("./config/database");
const sockets_1 = require("./sockets");
async function bootstrap() {
    const app = (0, app_1.createApp)();
    const server = http_1.default.createServer(app);
    await (0, sockets_1.initSocket)(server);
    await (0, redis_1.initRedis)();
    await database_1.prisma.$queryRaw `SELECT 1`;
    server.listen(env_1.env.port, () => {
        logger_1.logger.info(`Server running on port ${env_1.env.port} in ${env_1.env.nodeEnv} mode`);
    });
    const shutdown = async () => {
        logger_1.logger.info("Shutting down server...");
        await database_1.prisma.$disconnect();
        process.exit(0);
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}
bootstrap().catch((err) => {
    logger_1.logger.error("Bootstrap error", err);
    process.exit(1);
});
