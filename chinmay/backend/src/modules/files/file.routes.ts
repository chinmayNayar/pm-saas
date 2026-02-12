import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../../middleware/authMiddleware";
import { loadOrgContext } from "../../middleware/loadOrgContext";
import { validateRequest } from "../../middleware/validateRequest";
import { fileController } from "./file.controller";

export const fileRouter = Router();

fileRouter.use(authMiddleware, loadOrgContext);

fileRouter.post(
  "/upload-url",
  [
    body("filename").isString().notEmpty(),
    body("mimeType").isString().notEmpty(),
    body("sizeBytes").isInt({ gt: 0 })
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => fileController.createUploadUrl(req, res, next)
);

fileRouter.get("/:id/url", (req, res, next) =>
  fileController.getDownloadUrl(req, res, next)
);

