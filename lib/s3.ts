import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface PresignedUrlResult {
  success: boolean;
  uploadUrl?: string;
  fileUrl?: string;
  key?: string;
  error?: string;
}

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }

  /**
   * Generate a presigned URL for direct client-side uploads
   */
  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600 // 1 hour
  ): Promise<PresignedUrlResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      const fileUrl = `https://dlig4rk2wuthx.cloudfront.net/${key}`;

      return {
        success: true,
        uploadUrl,
        fileUrl,
        key
      };
    } catch (error) {
      console.error({ error, key }, "Failed to generate presigned upload URL");
      return {
        success: false,
        error: "Failed to generate upload URL"
      };
    }
  }

  /**
   * Upload a file buffer directly to S3
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata
      });

      const result = await this.s3Client.send(command);
      const url = `https://dlig4rk2wuthx.cloudfront.net/${key}`; // Replace with your CloudFront domain

      console.info({ key, url }, "File uploaded successfully to S3");

      return {
        success: true,
        url,
        key
      };
    } catch (error) {
      console.error({ error, key }, "Failed to upload file to S3");
      return {
        success: false,
        error: "Failed to upload file"
      };
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.s3Client.send(command);

      console.info({ key }, "File deleted successfully from S3");

      return { success: true };
    } catch (error) {
      console.error({ error, key }, "Failed to delete file from S3");
      return {
        success: false,
        error: "Failed to delete file"
      };
    }
  }

  /**
   * Generate a file key for photos
   */
  generatePhotoKey(onboardingId: string, fileName: string, userId?: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";

    // Create a organized folder structure
    const folder = userId ? `users/${userId}/photos` : `onboarding/${onboardingId}/photos`;
    return `${folder}/${timestamp}_${randomSuffix}.${fileExtension}`;
  }

  /**
   * Validate file for media upload (photos and videos)
   */
  validateMediaFile(file: { mimetype: string; size: number }): {
    valid: boolean;
    error?: string;
    mediaType: "image" | "video";
  } {
    const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const videoTypes = ["video/mp4", "video/quicktime", "video/webm"];
    const imageMaxSize = 10 * 1024 * 1024; // 10MB for images
    const videoMaxSize = 50 * 1024 * 1024; // 50MB for videos (10 seconds ~= 10-50MB depending on quality)

    let mediaType: "image" | "video";
    let maxSize: number;

    if (imageTypes.includes(file.mimetype)) {
      mediaType = "image";
      maxSize = imageMaxSize;
    } else if (videoTypes.includes(file.mimetype)) {
      mediaType = "video";
      maxSize = videoMaxSize;
    } else {
      return {
        valid: false,
        error: "Invalid file type. Only JPEG, PNG, WebP images and MP4, QuickTime, WebM videos are allowed.",
        mediaType: "image"
      };
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        valid: false,
        error: `File size too large. Maximum size for ${mediaType}s is ${maxSizeMB}MB.`,
        mediaType
      };
    }

    return { valid: true, mediaType };
  }

  /**
   * Legacy method for backward compatibility
   */
  validatePhotoFile(file: { mimetype: string; size: number }): { valid: boolean; error?: string } {
    const result = this.validateMediaFile(file);
    if (result.mediaType === "video") {
      return {
        valid: false,
        error: "Videos not supported in photo upload. Use media upload instead."
      };
    }
    return { valid: result.valid, error: result.error };
  }
}

export const s3Service = new S3Service();

// Helper functions for backward compatibility
export const uploadToS3 = async (buffer: Buffer, key: string, contentType: string): Promise<UploadResult> => {
  return s3Service.uploadFile(key, buffer, contentType);
};

export const deleteFromS3 = async (key: string): Promise<{ success: boolean; error?: string }> => {
  return s3Service.deleteFile(key);
};
