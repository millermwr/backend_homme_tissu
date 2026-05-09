import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResult {
  mediaUrl: string;
  mediaPublicId: string;
  fileSize: number;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    } else {
      this.logger.warn(
        'Cloudinary is not configured. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
      );
    }
  }

  isConfigured() {
    return Boolean(
      process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
        process.env.CLOUDINARY_API_KEY?.trim() &&
        process.env.CLOUDINARY_API_SECRET?.trim(),
    );
  }

  uploadBuffer(
    buffer: Buffer,
    options: { folder: string; resourceType?: 'image' | 'video' | 'auto' },
  ): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Cloudinary non configure. Renseignez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.',
      );
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType ?? 'auto',
        },
        (error, result) => {
          if (error || !result) {
            const message =
              error instanceof Error
                ? error.message
                : typeof error === 'string'
                  ? error
                  : 'Upload Cloudinary impossible';
            reject(
              new BadGatewayException(`Upload Cloudinary impossible: ${message}`),
            );
            return;
          }

          resolve({
            mediaUrl: result.secure_url,
            mediaPublicId: result.public_id,
            fileSize: result.bytes ?? buffer.length,
          });
        },
      );

      stream.end(buffer);
    });
  }

  async deleteByPublicId(publicId: string) {
    if (!this.isConfigured() || !publicId) {
      return;
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
      invalidate: true,
    });
  }
}