"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const express_validator_1 = require("express-validator");
const httpErrors_1 = require("../utils/httpErrors");
function validateRequest(req, _res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new httpErrors_1.BadRequestError("Validation failed", errors.array()));
    }
    next();
}
