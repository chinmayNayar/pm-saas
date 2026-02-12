import { createClient } from "redis";
import { env } from "./env";
import { logger } from "./logger";

export const redisClient = createClient({ url: env.redisUrl });

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err);
});

// Connect to Redis. In development we log and continue if Redis
// is unavailable so that the app can still run without cache/blacklist.
export async function initRedis(): Promise<void> {
  if (redisClient.isOpen) return;
  try {
    await redisClient.connect();
    logger.info("Connected to Redis");
  } catch (err) {
    logger.error("Failed to connect to Redis", err);
    if (env.nodeEnv === "production") {
      // In production, Redis is required.
      throw err;
    }
    // In dev, continue without Redis (features depending on cache/blacklist degrade gracefully)
  }
}


