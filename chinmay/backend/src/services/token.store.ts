import { redisClient } from "../config/redis";
import { env } from "../config/env";

const REFRESH_USER_KEY = (userId: string) => `auth:rt:user:${userId}`;
const REFRESH_BLACKLIST_KEY = (jti: string) => `auth:rt:blacklist:${jti}`;
const ACCESS_BLACKLIST_KEY = (jti: string) => `auth:at:blacklist:${jti}`;

export const tokenStore = {
  async setUserRefreshJti(userId: string, jti: string): Promise<void> {
    try {
      await redisClient.setEx(
        REFRESH_USER_KEY(userId),
        env.jwt.refreshExpiresInSec,
        jti
      );
    } catch {
      // In dev without Redis this is a no-op; refresh rotation is disabled.
    }
  },

  async getUserRefreshJti(userId: string): Promise<string | null> {
    try {
      return redisClient.get(REFRESH_USER_KEY(userId));
    } catch {
      return null;
    }
  },

  async deleteUserRefreshJti(userId: string): Promise<void> {
    try {
      await redisClient.del(REFRESH_USER_KEY(userId));
    } catch {
      // ignore if Redis unavailable
    }
  },

  async blacklistRefreshJti(jti: string, ttlSec: number): Promise<void> {
    try {
      await redisClient.setEx(REFRESH_BLACKLIST_KEY(jti), ttlSec, "1");
    } catch {
      // ignore in dev
    }
  },

  async isRefreshJtiBlacklisted(jti: string): Promise<boolean> {
    try {
      return !!(await redisClient.get(REFRESH_BLACKLIST_KEY(jti)));
    } catch {
      return false;
    }
  },

  async blacklistAccessJti(jti: string, ttlSec: number): Promise<void> {
    try {
      await redisClient.setEx(ACCESS_BLACKLIST_KEY(jti), ttlSec, "1");
    } catch {
      // ignore in dev
    }
  },

  async isAccessJtiBlacklisted(jti: string): Promise<boolean> {
    try {
      return !!(await redisClient.get(ACCESS_BLACKLIST_KEY(jti)));
    } catch {
      return false;
    }
  }
};

