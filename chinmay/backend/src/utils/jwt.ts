import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtSubject = {
  sub: string;
  email: string;
  orgId?: string;
};

export type AccessTokenPayload = JwtSubject & {
  jti: string;
  type: "access";
};

export type RefreshTokenPayload = JwtSubject & {
  jti: string;
  type: "refresh";
};

export function generateJti(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function signAccessToken(subject: JwtSubject, jti: string): string {
  const payload: AccessTokenPayload = { ...subject, jti, type: "access" };
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresInSec
  });
}

export function signRefreshToken(subject: JwtSubject, jti: string): string {
  const payload: RefreshTokenPayload = { ...subject, jti, type: "refresh" };
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresInSec
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
  if (payload.type !== "access") throw new Error("Invalid token type");
  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
  if (payload.type !== "refresh") throw new Error("Invalid token type");
  return payload;
}

