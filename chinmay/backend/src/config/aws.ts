import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
      }
    : undefined
});

export const s3Config = {
  bucket: process.env.S3_BUCKET_NAME || "your_bucket_name",
  region: process.env.AWS_REGION || "us-east-1"
};

