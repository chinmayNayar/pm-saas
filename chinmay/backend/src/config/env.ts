import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL as string,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpiresInSec: Number(process.env.JWT_ACCESS_EXPIRES_IN_SEC || 900),
    refreshExpiresInSec: Number(process.env.JWT_REFRESH_EXPIRES_IN_SEC || 2592000)
  },
  cookies: {
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none") || "lax"
  },
  redisUrl: process.env.REDIS_URL as string,
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY as string,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
    prices: {
      free: process.env.STRIPE_PRICE_FREE || "",
      pro: process.env.STRIPE_PRICE_PRO || "",
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE || ""
    }
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirectUri: process.env.GOOGLE_REDIRECT_URI as string
  }
};

if (!env.databaseUrl) throw new Error("DATABASE_URL is required");
if (!env.jwt.accessSecret || !env.jwt.refreshSecret) {
  throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required");
}

