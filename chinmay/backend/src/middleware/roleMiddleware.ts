import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../utils/httpErrors";
import { Role } from "@prisma/client";

export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user?.role) {
      return next(new ForbiddenError("Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }
    next();
  };
}

