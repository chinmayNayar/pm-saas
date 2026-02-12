"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const loadOrgContext_1 = require("../../middleware/loadOrgContext");
const validateRequest_1 = require("../../middleware/validateRequest");
const billing_controller_1 = require("./billing.controller");
exports.billingRouter = (0, express_1.Router)();
exports.billingRouter.use(authMiddleware_1.authMiddleware, loadOrgContext_1.loadOrgContext);
// POST /api/v1/billing/checkout-session
exports.billingRouter.post("/checkout-session", [
    (0, express_validator_1.body)("planId").isIn(["free", "pro", "enterprise"]),
    (0, express_validator_1.body)("successUrl").isURL(),
    (0, express_validator_1.body)("cancelUrl").isURL()
], validateRequest_1.validateRequest, (req, res, next) => billing_controller_1.billingController.createCheckoutSession(req, res, next));
