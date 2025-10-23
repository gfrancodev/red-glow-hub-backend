import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { secrets } from '@/shared/config/secrets';
import { E } from '@/shared/errors';

export class R2Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: secrets.r2.endpoint,
      credentials: {
        accessKeyId: secrets.r2.accessKeyId,
        secretAccessKey: secrets.r2.secretAccessKey,
      },
    });
  }

  async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ url: string; key: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: secrets.r2.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });

      return { url, key };
    } catch (error) {
      throw E.INTERNAL({ meta: { context: 'r2.generatePresignedUrl', error } });
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: secrets.r2.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      throw E.INTERNAL({ meta: { context: 'r2.deleteFile', error } });
    }
  }

  generateKey(prefix: string, filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}/${timestamp}-${random}-${filename}`;
  }

  getPublicUrl(key: string): string {
    return `${secrets.r2.endpoint}/${key}`;
  }
}
