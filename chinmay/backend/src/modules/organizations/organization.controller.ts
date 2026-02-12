import { Request, Response, NextFunction } from "express";
import { organizationService } from "./organization.service";
import { ok, created } from "../../utils/apiResponse";

class OrganizationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const orgs = await organizationService.listForUser(userId);
      return ok(res, orgs);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const { name, demo } = req.body as { name: string; demo?: boolean };
      const org = demo
        ? await organizationService.createDemoOrganization(userId)
        : await organizationService.createOrganization(userId, name);
      return created(res, org, "Organization created");
    } catch (err) {
      next(err);
    }
  }
}

export const organizationController = new OrganizationController();
