"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const loadOrgContext_1 = require("../../middleware/loadOrgContext");
const validateRequest_1 = require("../../middleware/validateRequest");
const file_controller_1 = require("./file.controller");
exports.fileRouter = (0, express_1.Router)();
exports.fileRouter.use(authMiddleware_1.authMiddleware, loadOrgContext_1.loadOrgContext);
exports.fileRouter.post("/upload-url", [
    (0, express_validator_1.body)("filename").isString().notEmpty(),
    (0, express_validator_1.body)("mimeType").isString().notEmpty(),
    (0, express_validator_1.body)("sizeBytes").isInt({ gt: 0 })
], validateRequest_1.validateRequest, (req, res, next) => file_controller_1.fileController.createUploadUrl(req, res, next));
exports.fileRouter.get("/:id/url", (req, res, next) => file_controller_1.fileController.getDownloadUrl(req, res, next));
