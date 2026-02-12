import { Request, Response, NextFunction } from "express";
import { fileService } from "../../services/file.service";
import { ok, created } from "../../utils/apiResponse";

export class FileController {
  async createUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = (req as any).authContext!;
      const { filename, mimeType, sizeBytes, taskId, projectId, commentId } = req.body;
      const result = await fileService.createUploadUrl(ctx, {
        filename,
        mimeType,
        sizeBytes,
        taskId,
        projectId,
        commentId
      });
      return created(res, result, "Upload URL created");
    } catch (err) {
      next(err);
    }
  }

  async getDownloadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = (req as any).authContext!;
      const { id } = req.params;
      const result = await fileService.getDownloadUrl(ctx, id);
      return ok(res, result, "Download URL created");
    } catch (err) {
      next(err);
    }
  }
}

export const fileController = new FileController();

