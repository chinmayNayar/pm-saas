"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthService = void 0;
const google_auth_library_1 = require("google-auth-library");
const env_1 = require("../config/env");
const client = new google_auth_library_1.OAuth2Client(env_1.env.google.clientId || "google_client_id_placeholder");
exports.googleOAuthService = {
    async verifyIdToken(idToken) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: env_1.env.google.clientId
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error("Invalid Google token");
        }
        return {
            email: payload.email,
            emailVerified: !!payload.email_verified,
            name: payload.name,
            picture: payload.picture,
            sub: payload.sub
        };
    }
};
