import * as http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { initRedis } from "./config/redis";
import { prisma } from "./config/database";
import { initSocket } from "./sockets";

async function bootstrap(): Promise<void> {
  const app = createApp();
  const server = http.createServer(app);

  await initSocket(server);
  await initRedis();
  await prisma.$queryRaw`SELECT 1`;

  server.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  });

  const shutdown = async () => {
    logger.info("Shutting down server...");
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrap().catch((err) => {
  logger.error("Bootstrap error", err);
  process.exit(1);
});

