import { randomUUID } from "crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, s3Config } from "../config/aws";
import { prisma } from "../config/database";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/httpErrors";
import { AuthContext } from "./activity.service";

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

export class FileService {
  validateFileInput(input: { filename: string; mimeType: string; sizeBytes: number }) {
    if (!input.filename || !input.mimeType) {
      throw new BadRequestError("Filename and MIME type are required");
    }
    if (input.sizeBytes <= 0 || input.sizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError("File size exceeds allowed limit");
    }
    if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
      throw new BadRequestError("File type not allowed");
    }
  }

  private buildStorageKey(ctx: AuthContext, input: {
    filename: string;
    taskId?: string;
    projectId?: string;
    commentId?: string;
  }) {
    const safeName = input.filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const idPart = randomUUID();
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

  async createUploadUrl(
    ctx: AuthContext,
    input: {
      filename: string;
      mimeType: string;
      sizeBytes: number;
      taskId?: string;
      projectId?: string;
      commentId?: string;
    }
  ) {
    this.validateFileInput(input);

    // Access control: validate related entities belong to this org
    if (input.taskId) {
      const task = await prisma.task.findFirst({
        where: { id: input.taskId, organizationId: ctx.orgId, deletedAt: null }
      });
      if (!task) throw new ForbiddenError("Cannot upload to this task");
    }
    if (input.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.orgId, deletedAt: null }
      });
      if (!project) throw new ForbiddenError("Cannot upload to this project");
    }
    if (input.commentId) {
      const comment = await prisma.comment.findFirst({
        where: {
          id: input.commentId,
          task: { organizationId: ctx.orgId, deletedAt: null },
          deletedAt: null
        }
      });
      if (!comment) throw new ForbiddenError("Cannot upload to this comment");
    }

    const storageKey = this.buildStorageKey(ctx, input);

    const putCommand = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: storageKey,
      ContentType: input.mimeType,
      ContentLength: input.sizeBytes
    });

    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 60 * 5 // 5 minutes
    });

    const file = await prisma.fileUpload.create({
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

  async getDownloadUrl(ctx: AuthContext, fileId: string) {
    const file = await prisma.fileUpload.findFirst({
      where: { id: fileId, organizationId: ctx.orgId, deletedAt: null }
    });
    if (!file) throw new NotFoundError("File not found");

    const getCommand = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: file.storageKey
    });

    const downloadUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 60 * 5
    });

    return { file, downloadUrl };
  }
}

export const fileService = new FileService();

