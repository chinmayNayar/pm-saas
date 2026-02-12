"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJti = generateJti;
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function generateJti() {
    return crypto_1.default.randomBytes(16).toString("hex");
}
function signAccessToken(subject, jti) {
    const payload = { ...subject, jti, type: "access" };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwt.accessSecret, {
        expiresIn: env_1.env.jwt.accessExpiresInSec
    });
}
function signRefreshToken(subject, jti) {
    const payload = { ...subject, jti, type: "refresh" };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwt.refreshSecret, {
        expiresIn: env_1.env.jwt.refreshExpiresInSec
    });
}
function verifyAccessToken(token) {
    const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwt.accessSecret);
    if (payload.type !== "access")
        throw new Error("Invalid token type");
    return payload;
}
function verifyRefreshToken(token) {
    const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwt.refreshSecret);
    if (payload.type !== "refresh")
        throw new Error("Invalid token type");
    return payload;
}
