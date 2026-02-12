"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const loadOrgContext_1 = require("../../middleware/loadOrgContext");
const analytics_controller_1 = require("./analytics.controller");
exports.analyticsRouter = (0, express_1.Router)();
exports.analyticsRouter.use(authMiddleware_1.authMiddleware, loadOrgContext_1.loadOrgContext);
// GET /api/v1/analytics/dashboard
exports.analyticsRouter.get("/dashboard", (req, res, next) => analytics_controller_1.analyticsController.dashboard(req, res, next));
