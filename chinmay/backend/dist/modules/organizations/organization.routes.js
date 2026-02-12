"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const organization_controller_1 = require("./organization.controller");
exports.organizationRouter = (0, express_1.Router)();
exports.organizationRouter.use(authMiddleware_1.authMiddleware);
exports.organizationRouter.get("/", (req, res, next) => organization_controller_1.organizationController.list(req, res, next));
