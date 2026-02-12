import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { tokenStore } from "../services/token.store";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    const cookieToken = (req as any).cookies?.["access_token"];
    const token = bearerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const payload = verifyAccessToken(token);

    const blacklisted = await tokenStore.isAccessJtiBlacklisted(payload.jti);
    if (blacklisted) {
      return res.status(401).json({ success: false, message: "Token revoked" });
    }

    (req as any).user = {
      id: payload.sub,
      email: payload.email
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

