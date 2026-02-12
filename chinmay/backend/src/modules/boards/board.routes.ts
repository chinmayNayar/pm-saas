import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { loadOrgContext } from "../../middleware/loadOrgContext";
import { boardController } from "./board.controller";

export const boardRouter = Router();

boardRouter.use(authMiddleware, loadOrgContext);

boardRouter.get("/:boardId", (req, res, next) =>
  boardController.getOne(req, res, next)
);
