"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileService = exports.FileService = void 0;
const crypto_1 = require("crypto");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const aws_1 = require("../config/aws");
const database_1 = require("../config/database");
const httpErrors_1 = require("../utils/httpErrors");
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];
class FileService {
    validateFileInput(input) {
        if (!input.filename || !input.mimeType) {
            throw new httpErrors_1.BadRequestError("Filename and MIME type are required");
        }
        if (input.sizeBytes <= 0 || input.sizeBytes > MAX_FILE_SIZE_BYTES) {
            throw new httpErrors_1.BadRequestError("File size exceeds allowed limit");
        }
        if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
            throw new httpErrors_1.BadRequestError("File type not allowed");
        }
    }
    buildStorageKey(ctx, input) {
        const safeName = input.filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const idPart = (0, crypto_1.randomUUID)();
        if (input.taskId) {
            return `orgs/${ctx.orgId}/tasks/${input.taskId}/${idPart}-${safeName}`;
        }
        if (input.projectId) {
            return `orgs/${ctx.orgId}/projects/${input.projectId}/${idPart}-${safeName}`;
        }
        if (input.commentId) {
            return `orgs/${ctx.orgId}/comments/${input.commentId}/${idPart}-${safeName}`;
        }
        return `orgs/${ctx.orgId}/misc/${idPart}-${safeName}`;
    }
    async createUploadUrl(ctx, input) {
        this.validateFileInput(input);
        // Access control: validate related entities belong to this org
        if (input.taskId) {
            const task = await database_1.prisma.task.findFirst({
                where: { id: input.taskId, organizationId: ctx.orgId, deletedAt: null }
            });
            if (!task)
                throw new httpErrors_1.ForbiddenError("Cannot upload to this task");
        }
        if (input.projectId) {
            const project = await database_1.prisma.project.findFirst({
                where: { id: input.projectId, organizationId: ctx.orgId, deletedAt: null }
            });
            if (!project)
                throw new httpErrors_1.ForbiddenError("Cannot upload to this project");
        }
        if (input.commentId) {
            const comment = await database_1.prisma.comment.findFirst({
                where: {
                    id: input.commentId,
                    task: { organizationId: ctx.orgId, deletedAt: null },
                    deletedAt: null
                }
            });
            if (!comment)
                throw new httpErrors_1.ForbiddenError("Cannot upload to this comment");
        }
        const storageKey = this.buildStorageKey(ctx, input);
        const putCommand = new client_s3_1.PutObjectCommand({
            Bucket: aws_1.s3Config.bucket,
            Key: storageKey,
            ContentType: input.mimeType,
            ContentLength: input.sizeBytes
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, putCommand, {
            expiresIn: 60 * 5 // 5 minutes
        });
        const file = await database_1.prisma.fileUpload.create({
            data: {
                organizationId: ctx.orgId,
                uploaderId: ctx.userId,
                taskId: input.taskId,
                projectId: input.projectId,
                commentId: input.commentId,
                filename: input.filename,
                mimeType: input.mimeType,
                sizeBytes: input.sizeBytes,
                storageProvider: "s3",
                storageKey,
                url: null
            }
        });
        return {
            file,
            uploadUrl
        };
    }
    async getDownloadUrl(ctx, fileId) {
        const file = await database_1.prisma.fileUpload.findFirst({
            where: { id: fileId, organizationId: ctx.orgId, deletedAt: null }
        });
        if (!file)
            throw new httpErrors_1.NotFoundError("File not found");
        const getCommand = new client_s3_1.GetObjectCommand({
            Bucket: aws_1.s3Config.bucket,
            Key: file.storageKey
        });
        const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, getCommand, {
            expiresIn: 60 * 5
        });
        return { file, downloadUrl };
    }
}
exports.FileService = FileService;
exports.fileService = new FileService();
