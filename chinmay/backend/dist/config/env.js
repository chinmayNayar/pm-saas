"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 4000,
    databaseUrl: process.env.DATABASE_URL,
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiresInSec: Number(process.env.JWT_ACCESS_EXPIRES_IN_SEC || 900),
        refreshExpiresInSec: Number(process.env.JWT_REFRESH_EXPIRES_IN_SEC || 2592000)
    },
    cookies: {
        domain: process.env.COOKIE_DOMAIN || undefined,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: process.env.COOKIE_SAMESITE || "lax"
    },
    redisUrl: process.env.REDIS_URL,
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        prices: {
            free: process.env.STRIPE_PRICE_FREE || "",
            pro: process.env.STRIPE_PRICE_PRO || "",
            enterprise: process.env.STRIPE_PRICE_ENTERPRISE || ""
        }
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    }
};
if (!exports.env.databaseUrl)
    throw new Error("DATABASE_URL is required");
if (!exports.env.jwt.accessSecret || !exports.env.jwt.refreshSecret) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required");
}
