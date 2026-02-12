"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const httpErrors_1 = require("../utils/httpErrors");
function requireRole(roles) {
    return (req, _res, next) => {
        if (!req.user?.role) {
            return next(new httpErrors_1.ForbiddenError("Authentication required"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new httpErrors_1.ForbiddenError("Insufficient permissions"));
        }
        next();
    };
}
