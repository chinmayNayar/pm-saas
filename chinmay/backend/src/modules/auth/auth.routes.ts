import { Router, Request, Response, NextFunction } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { body } from "express-validator";
import { authMiddleware } from "../../middleware/authMiddleware";

export const authRouter = Router();

authRouter.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6 }),
    body("name").isString().isLength({ min: 1 })
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next)
);

authRouter.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6 })
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next)
);

authRouter.post(
  "/google",
  [body("idToken").isString().notEmpty()],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => authController.googleLogin(req, res, next)
);

authRouter.post("/refresh", (req: Request, res: Response, next: NextFunction) =>
  authController.refresh(req, res, next)
);

authRouter.post("/logout", authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  authController.logout(req, res, next)
);

authRouter.get("/me", authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  authController.me(req, res, next)
);

