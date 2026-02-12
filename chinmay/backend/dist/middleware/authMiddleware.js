"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
const token_store_1 = require("../services/token.store");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7)
            : undefined;
        const cookieToken = req.cookies?.["access_token"];
        const token = bearerToken || cookieToken;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const blacklisted = await token_store_1.tokenStore.isAccessJtiBlacklisted(payload.jti);
        if (blacklisted) {
            return res.status(401).json({ success: false, message: "Token revoked" });
        }
        req.user = {
            id: payload.sub,
            email: payload.email
        };
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
}
