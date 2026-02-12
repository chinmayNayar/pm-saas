"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authTokenService = exports.AuthTokenService = void 0;
const database_1 = require("../config/database");
const passwords_1 = require("../utils/passwords");
const jwt_1 = require("../utils/jwt");
const token_store_1 = require("./token.store");
const env_1 = require("../config/env");
const google_oauth_service_1 = require("./google.oauth.service");
class AuthTokenService {
    async register(input) {
        const existing = await database_1.prisma.user.findUnique({ where: { email: input.email } });
        if (existing)
            throw new Error("Email already in use");
        const passwordHash = await (0, passwords_1.hashPassword)(input.password);
        const user = await database_1.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                name: input.name,
                provider: "credentials"
            }
        });
        return this.issueTokens(user);
    }
    async login(input) {
        const user = await database_1.prisma.user.findUnique({ where: { email: input.email } });
        if (!user || !user.passwordHash)
            throw new Error("Invalid credentials");
        const valid = await (0, passwords_1.comparePassword)(input.password, user.passwordHash);
        if (!valid)
            throw new Error("Invalid credentials");
        return this.issueTokens(user);
    }
    async loginWithGoogle(idToken) {
        const profile = await google_oauth_service_1.googleOAuthService.verifyIdToken(idToken);
        let user = await database_1.prisma.user.findUnique({
            where: { email: profile.email }
        });
        if (!user) {
            user = await database_1.prisma.user.create({
                data: {
                    email: profile.email,
                    name: profile.name || profile.email.split("@")[0],
                    avatarUrl: profile.picture,
                    provider: "google",
                    providerId: profile.sub,
                    isEmailVerified: profile.emailVerified
                }
            });
        }
        return this.issueTokens(user);
    }
    async refreshTokens(refreshToken) {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const isBlacklisted = await token_store_1.tokenStore.isRefreshJtiBlacklisted(payload.jti);
        if (isBlacklisted) {
            await token_store_1.tokenStore.deleteUserRefreshJti(payload.sub);
            throw new Error("Invalid refresh token");
        }
        const currentJti = await token_store_1.tokenStore.getUserRefreshJti(payload.sub);
        if (!currentJti || currentJti !== payload.jti) {
            await token_store_1.tokenStore.deleteUserRefreshJti(payload.sub);
            await token_store_1.tokenStore.blacklistRefreshJti(payload.jti, env_1.env.jwt.refreshExpiresInSec);
            throw new Error("Refresh token reuse detected");
        }
        await token_store_1.tokenStore.blacklistRefreshJti(payload.jti, env_1.env.jwt.refreshExpiresInSec);
        const user = await database_1.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user)
            throw new Error("User not found");
        return this.issueTokens(user);
    }
    async logout(userId, currentRefreshJti) {
        if (currentRefreshJti) {
            await token_store_1.tokenStore.blacklistRefreshJti(currentRefreshJti, env_1.env.jwt.refreshExpiresInSec);
        }
        await token_store_1.tokenStore.deleteUserRefreshJti(userId);
    }
    async issueTokens(user) {
        const subject = { sub: user.id, email: user.email };
        const accessJti = (0, jwt_1.generateJti)();
        const refreshJti = (0, jwt_1.generateJti)();
        const accessToken = (0, jwt_1.signAccessToken)(subject, accessJti);
        const refreshToken = (0, jwt_1.signRefreshToken)(subject, refreshJti);
        await token_store_1.tokenStore.setUserRefreshJti(user.id, refreshJti);
        return {
            user,
            tokens: {
                accessToken,
                refreshToken,
                accessTokenExpiresInSec: env_1.env.jwt.accessExpiresInSec,
                refreshTokenExpiresInSec: env_1.env.jwt.refreshExpiresInSec
            }
        };
    }
}
exports.AuthTokenService = AuthTokenService;
exports.authTokenService = new AuthTokenService();
