"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
function notFoundHandler(req, res, _next) {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
}
