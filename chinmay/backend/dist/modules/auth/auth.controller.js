"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const token_service_1 = require("../../services/token.service");
const jwt_1 = require("../../utils/jwt");
const env_1 = require("../../config/env");
const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
function setAuthCookies(res, accessToken, refreshToken) {
    const secure = env_1.env.cookies.secure;
    const sameSite = env_1.env.cookies.sameSite;
    const domain = env_1.env.cookies.domain;
    res.cookie(ACCESS_COOKIE, accessToken, {
        httpOnly: true,
        secure,
        sameSite,
        domain,
        maxAge: env_1.env.jwt.accessExpiresInSec * 1000
    });
    res.cookie(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        secure,
        sameSite,
        domain,
        maxAge: env_1.env.jwt.refreshExpiresInSec * 1000
    });
}
function clearAuthCookies(res) {
    res.clearCookie(ACCESS_COOKIE);
    res.clearCookie(REFRESH_COOKIE);
}
class AuthController {
    async register(req, res, next) {
        try {
            const { email, password, name } = req.body;
            const { user, tokens } = await token_service_1.authTokenService.register({ email, password, name });
            setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
            res.status(201).json({ success: true, user, accessToken: tokens.accessToken });
        }
        catch (err) {
            next(err);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, tokens } = await token_service_1.authTokenService.login({ email, password });
            setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
            res.json({ success: true, user, accessToken: tokens.accessToken });
        }
        catch (err) {
            next(err);
        }
    }
    async googleLogin(req, res, next) {
        try {
            const { idToken } = req.body;
            const { user, tokens } = await token_service_1.authTokenService.loginWithGoogle(idToken);
            setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
            res.json({ success: true, user, accessToken: tokens.accessToken });
        }
        catch (err) {
            next(err);
        }
    }
    async refresh(req, res, next) {
        try {
            const tokenFromCookie = req.cookies?.[REFRESH_COOKIE];
            const tokenFromBody = req.body?.refreshToken;
            const refreshToken = tokenFromCookie || tokenFromBody;
            if (!refreshToken)
                throw new Error("No refresh token provided");
            (0, jwt_1.verifyRefreshToken)(refreshToken);
            const { user, tokens } = await token_service_1.authTokenService.refreshTokens(refreshToken);
            setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
            res.json({
                success: true,
                user,
                accessToken: tokens.accessToken
            });
        }
        catch (err) {
            next(err);
        }
    }
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.[REFRESH_COOKIE];
            let jti;
            if (refreshToken) {
                try {
                    const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
                    jti = payload.jti;
                }
                catch {
                    // ignore
                }
            }
            const userId = req.user?.id;
            if (userId) {
                await token_service_1.authTokenService.logout(userId, jti);
            }
            clearAuthCookies(res);
            res.json({ success: true });
        }
        catch (err) {
            next(err);
        }
    }
    async me(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            res.json({ success: true, user: req.user });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.authController = new AuthController();
