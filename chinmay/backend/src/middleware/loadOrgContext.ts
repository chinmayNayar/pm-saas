import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { Role } from "@prisma/client";

function resolveOrgId(req: Request): string | undefined {
  return (
    (req.headers["x-org-id"] as string | undefined) ||
    (req.query.orgId as string | undefined) ||
    (req.params.orgId as string | undefined)
  );
}

export async function loadOrgContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const orgId = resolveOrgId(req);
    if (!orgId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing organization context" });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        orgId,
        deletedAt: null
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not belong to this organization"
      });
    }

    (req as any).authContext = {
      userId: user.id,
      email: user.email,
      orgId,
      role: membership.role as Role
    };

    next();
  } catch (err) {
    next(err);
  }
}

