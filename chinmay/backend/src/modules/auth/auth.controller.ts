import { Request, Response, NextFunction } from "express";
import { authTokenService } from "../../services/token.service";
import { verifyRefreshToken } from "../../utils/jwt";
import { env } from "../../config/env";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const secure = env.cookies.secure;
  const sameSite = env.cookies.sameSite;
  const domain = env.cookies.domain;

  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite,
    domain,
    maxAge: env.jwt.accessExpiresInSec * 1000
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite,
    domain,
    maxAge: env.jwt.refreshExpiresInSec * 1000
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE);
  res.clearCookie(REFRESH_COOKIE);
}

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const { user, tokens } = await authTokenService.register({ email, password, name });
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.status(201).json({ success: true, user, accessToken: tokens.accessToken });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await authTokenService.login({ email, password });
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json({ success: true, user, accessToken: tokens.accessToken });
    } catch (err) {
      next(err);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      const { user, tokens } = await authTokenService.loginWithGoogle(idToken);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json({ success: true, user, accessToken: tokens.accessToken });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenFromCookie = (req as any).cookies?.[REFRESH_COOKIE];
      const tokenFromBody = req.body?.refreshToken;
      const refreshToken = tokenFromCookie || tokenFromBody;
      if (!refreshToken) throw new Error("No refresh token provided");

      verifyRefreshToken(refreshToken);

      const { user, tokens } = await authTokenService.refreshTokens(refreshToken);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      res.json({
        success: true,
        user,
        accessToken: tokens.accessToken
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = (req as any).cookies?.[REFRESH_COOKIE];
      let jti: string | undefined;
      if (refreshToken) {
        try {
          const payload = verifyRefreshToken(refreshToken);
          jti = payload.jti;
        } catch {
          // ignore
        }
      }
      const userId = (req as any).user?.id;
      if (userId) {
        await authTokenService.logout(userId, jti);
      }
      clearAuthCookies(res);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

