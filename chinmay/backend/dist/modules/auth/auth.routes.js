"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validateRequest_1 = require("../../middleware/validateRequest");
const express_validator_1 = require("express-validator");
const authMiddleware_1 = require("../../middleware/authMiddleware");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("password").isString().isLength({ min: 6 }),
    (0, express_validator_1.body)("name").isString().isLength({ min: 1 })
], validateRequest_1.validateRequest, (req, res, next) => auth_controller_1.authController.register(req, res, next));
exports.authRouter.post("/login", [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("password").isString().isLength({ min: 6 })
], validateRequest_1.validateRequest, (req, res, next) => auth_controller_1.authController.login(req, res, next));
exports.authRouter.post("/google", [(0, express_validator_1.body)("idToken").isString().notEmpty()], validateRequest_1.validateRequest, (req, res, next) => auth_controller_1.authController.googleLogin(req, res, next));
exports.authRouter.post("/refresh", (req, res, next) => auth_controller_1.authController.refresh(req, res, next));
exports.authRouter.post("/logout", authMiddleware_1.authMiddleware, (req, res, next) => auth_controller_1.authController.logout(req, res, next));
exports.authRouter.get("/me", authMiddleware_1.authMiddleware, (req, res, next) => auth_controller_1.authController.me(req, res, next));
