import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

export interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'webp' | 'png';
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

@Injectable()
export class ImageCompressionService {
  private readonly logger = new Logger(ImageCompressionService.name);

  /**
   * Get optimal compression options based on file size
   */
  getOptimalCompressionOptions(fileSize: number): CompressionOptions {
    if (fileSize < 500 * 1024) { // < 500KB
      return {
        quality: 85,
        maxWidth: 1920,
        maxHeight: 1080,
        format: 'jpeg',
        generateThumbnail: true,
        thumbnailWidth: 300,
        thumbnailHeight: 200
      };
    } else if (fileSize < 2 * 1024 * 1024) { // < 2MB
      return {
        quality: 80,
        maxWidth: 1600,
        maxHeight: 900,
        format: 'jpeg',
        generateThumbnail: true,
        thumbnailWidth: 400,
        thumbnailHeight: 300
      };
    } else { // >= 2MB
      return {
        quality: 75,
        maxWidth: 1280,
        maxHeight: 720,
        format: 'jpeg',
        generateThumbnail: true,
        thumbnailWidth: 500,
        thumbnailHeight: 400
      };
    }
  }

  /**
   * Compress image with Sharp
   */
  async compressImage(
    buffer: Buffer,
    options: CompressionOptions = {}
  ): Promise<{ compressed: Buffer; thumbnail?: Buffer }> {
    try {
      const {
        quality = 80,
        maxWidth = 1920,
        maxHeight = 1080,
        format = 'jpeg',
        generateThumbnail = true,
        thumbnailWidth = 300,
        thumbnailHeight = 200
      } = options;

      // Get image metadata
      const metadata = await sharp(buffer).metadata();
      this.logger.log(`Original image: ${metadata.width}x${metadata.height}, ${format.toUpperCase()}`);

      // Calculate optimal dimensions
      const { width, height } = this.calculateOptimalDimensions(
        metadata.width || 0,
        metadata.height || 0,
        maxWidth,
        maxHeight
      );

      // Compress main image
      let compressedImage = sharp(buffer)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true });

      // Apply format-specific compression
      switch (format) {
        case 'jpeg':
          compressedImage = compressedImage.jpeg({ quality, progressive: true });
          break;
        case 'webp':
          compressedImage = compressedImage.webp({ quality });
          break;
        case 'png':
          compressedImage = compressedImage.png({ quality, progressive: true });
          break;
      }

      const compressed = await compressedImage.toBuffer();

      // Generate thumbnail if requested
      let thumbnail: Buffer | undefined;
      if (generateThumbnail) {
        thumbnail = await sharp(buffer)
          .resize(thumbnailWidth, thumbnailHeight, { fit: 'cover' })
          .jpeg({ quality: 70, progressive: true })
          .toBuffer();
      }

      const originalSize = buffer.length;
      const compressedSize = compressed.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      this.logger.log(
        `Image compressed: ${originalSize} -> ${compressedSize} bytes (${compressionRatio}% reduction)`
      );

      return { compressed, thumbnail };
    } catch (error) {
      this.logger.error(`Image compression failed: ${error.message}`);
      throw new Error(`Image compression failed: ${error.message}`);
    }
  }

  /**
   * Compress multiple images in batch
   */
  async compressImages(
    images: Array<{ buffer: Buffer; options?: CompressionOptions }>
  ): Promise<Array<{ compressed: Buffer; thumbnail?: Buffer }>> {
    const results: Array<{ compressed: Buffer; thumbnail?: Buffer }> = [];
    
    for (const image of images) {
      try {
        const result = await this.compressImage(image.buffer, image.options);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to compress image: ${error.message}`);
        // Return original image if compression fails
        results.push({ compressed: image.buffer });
      }
    }

    return results;
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }

  /**
   * Get image format from buffer
   */
  async getImageFormat(buffer: Buffer): Promise<string> {
    try {
      const metadata = await sharp(buffer).metadata();
      return metadata.format || 'jpeg';
    } catch {
      return 'jpeg';
    }
  }

  /**
   * Validate if buffer is a valid image
   */
  async isValidImage(buffer: Buffer): Promise<boolean> {
    try {
      await sharp(buffer).metadata();
      return true;
    } catch {
      return false;
    }
  }
}
