import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { organizationController } from "./organization.controller";
import { body } from "express-validator";
import { validateRequest } from "../../middleware/validateRequest";

export const organizationRouter = Router();

organizationRouter.use(authMiddleware);

organizationRouter.get("/", (req, res, next) =>
  organizationController.list(req, res, next)
);

organizationRouter.post(
  "/",
  [
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("demo").optional().isBoolean()
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) =>
    organizationController.create(req, res, next)
);
