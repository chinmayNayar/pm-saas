"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileController = exports.FileController = void 0;
const file_service_1 = require("../../services/file.service");
const apiResponse_1 = require("../../utils/apiResponse");
class FileController {
    async createUploadUrl(req, res, next) {
        try {
            const ctx = req.authContext;
            const { filename, mimeType, sizeBytes, taskId, projectId, commentId } = req.body;
            const result = await file_service_1.fileService.createUploadUrl(ctx, {
                filename,
                mimeType,
                sizeBytes,
                taskId,
                projectId,
                commentId
            });
            return (0, apiResponse_1.created)(res, result, "Upload URL created");
        }
        catch (err) {
            next(err);
        }
    }
    async getDownloadUrl(req, res, next) {
        try {
            const ctx = req.authContext;
            const { id } = req.params;
            const result = await file_service_1.fileService.getDownloadUrl(ctx, id);
            return (0, apiResponse_1.ok)(res, result, "Download URL created");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.FileController = FileController;
exports.fileController = new FileController();
