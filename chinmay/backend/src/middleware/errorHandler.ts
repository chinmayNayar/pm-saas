import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { HttpError } from "../utils/httpErrors";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isHttpError = err instanceof HttpError;
  const statusCode = isHttpError ? err.statusCode : 500;

  if (!isHttpError || statusCode >= 500) {
    logger.error("Unhandled error", err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error"
  });
}

