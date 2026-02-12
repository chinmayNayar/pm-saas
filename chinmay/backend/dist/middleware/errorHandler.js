"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../config/logger");
const httpErrors_1 = require("../utils/httpErrors");
function errorHandler(err, _req, res, _next) {
    const isHttpError = err instanceof httpErrors_1.HttpError;
    const statusCode = isHttpError ? err.statusCode : 500;
    if (!isHttpError || statusCode >= 500) {
        logger_1.logger.error("Unhandled error", err);
    }
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error"
    });
}
