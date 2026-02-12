import { Request, Response, NextFunction } from "express";
import { boardService } from "./board.service";
import { ok } from "../../utils/apiResponse";

class BoardController {
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = (req as any).authContext!;
      const { boardId } = req.params;
      const data = await boardService.getBoardForOrg(ctx.orgId, boardId);
      return ok(res, data);
    } catch (err) {
      next(err);
    }
  }
}

export const boardController = new BoardController();
