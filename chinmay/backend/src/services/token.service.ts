import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/passwords";
import {
  generateJti,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  JwtSubject
} from "../utils/jwt";
import { tokenStore } from "./token.store";
import { env } from "../config/env";
import { googleOAuthService } from "./google.oauth.service";

export class AuthTokenService {
  async register(input: { email: string; password: string; name: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new Error("Email already in use");

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        provider: "credentials"
      }
    });

    return this.issueTokens(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.passwordHash) throw new Error("Invalid credentials");

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    return this.issueTokens(user);
  }

  async loginWithGoogle(idToken: string) {
    const profile = await googleOAuthService.verifyIdToken(idToken);

    let user = await prisma.user.findUnique({
      where: { email: profile.email }
    });

    if (!user) {
      user = await prisma.user.create({
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

  async refreshTokens(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const isBlacklisted = await tokenStore.isRefreshJtiBlacklisted(payload.jti);
    if (isBlacklisted) {
      await tokenStore.deleteUserRefreshJti(payload.sub);
      throw new Error("Invalid refresh token");
    }

    const currentJti = await tokenStore.getUserRefreshJti(payload.sub);
    if (!currentJti || currentJti !== payload.jti) {
      await tokenStore.deleteUserRefreshJti(payload.sub);
      await tokenStore.blacklistRefreshJti(payload.jti, env.jwt.refreshExpiresInSec);
      throw new Error("Refresh token reuse detected");
    }

    await tokenStore.blacklistRefreshJti(payload.jti, env.jwt.refreshExpiresInSec);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new Error("User not found");

    return this.issueTokens(user);
  }

  async logout(userId: string, currentRefreshJti?: string) {
    if (currentRefreshJti) {
      await tokenStore.blacklistRefreshJti(currentRefreshJti, env.jwt.refreshExpiresInSec);
    }
    await tokenStore.deleteUserRefreshJti(userId);
  }

  private async issueTokens(user: { id: string; email: string }) {
    const subject: JwtSubject = { sub: user.id, email: user.email };

    const accessJti = generateJti();
    const refreshJti = generateJti();

    const accessToken = signAccessToken(subject, accessJti);
    const refreshToken = signRefreshToken(subject, refreshJti);

    await tokenStore.setUserRefreshJti(user.id, refreshJti);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
        accessTokenExpiresInSec: env.jwt.accessExpiresInSec,
        refreshTokenExpiresInSec: env.jwt.refreshExpiresInSec
      }
    };
  }
}

export const authTokenService = new AuthTokenService();

