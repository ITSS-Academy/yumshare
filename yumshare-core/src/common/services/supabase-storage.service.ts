import { Injectable, BadRequestException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Anon Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucketName = this.configService.get<string>('SUPABASE_BUCKET_NAME') || 'videos';
  }
  getClient(): SupabaseClient {
    return this.supabase;
  }
  /**
   * Upload image file to Supabase Storage
   */
  async uploadImage(file: Express.Multer.File, folderPath: string): Promise<string> {
    try {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${folderPath}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      let uploadData;
      
      if (file.buffer) {
        // If file has buffer (memory storage)
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });
        
        if (error) {
          throw new BadRequestException(`Upload failed: ${error.message}`);
        }
        uploadData = data;
      } else {
        // If file is stream (disk storage), convert to buffer
        const buffer = await this.streamToBuffer(file.stream);
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(fileName, buffer, {
            contentType: file.mimetype,
            upsert: false
          });
        
        if (error) {
          throw new BadRequestException(`Upload failed: ${error.message}`);
        }
        uploadData = data;
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload video file to Supabase Storage
   */
  async uploadVideo(file: Express.Multer.File, folderPath: string): Promise<string> {
    try {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${folderPath}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('Uploading video to:', fileName);
      console.log('Bucket name:', this.bucketName);
      console.log('File size:', file.size);
      console.log('File mimetype:', file.mimetype);

      let uploadData;
      
      if (file.buffer) {
        // If file has buffer (memory storage)
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });
        
        if (error) {
          console.error('Supabase upload error:', error);
          throw new BadRequestException(`Upload failed: ${error.message}`);
        }
        uploadData = data;
      } else {
        // If file is stream (disk storage), convert to buffer
        const buffer = await this.streamToBuffer(file.stream);
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(fileName, buffer, {
            contentType: file.mimetype,
            upsert: false
          });
        
        if (error) {
          console.error('Supabase upload error:', error);
          throw new BadRequestException(`Upload failed: ${error.message}`);
        }
        uploadData = data;
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      console.log('Upload successful, URL:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Video upload error:', error);
      throw new BadRequestException(`Failed to upload video: ${error.message}`);
    }
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Delete video file from Supabase Storage
   */
  async deleteVideo(videoUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(videoUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === this.bucketName);
      
      if (bucketIndex === -1) {
        return; // Not a Supabase storage URL, skip deletion
      }

      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting video from Supabase:', error.message);
      }
    } catch (error) {
      console.error('Error deleting video:', error.message);
    }
  }

  /**
   * Get signed URL for private video access
   */
  async getSignedUrl(videoUrl: string, expiresIn: number = 3600): Promise<string> {
    try {
      const url = new URL(videoUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === this.bucketName);
      
      if (bucketIndex === -1) {
        return videoUrl; // Not a Supabase storage URL, return as is
      }

      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new BadRequestException(`Failed to create signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      throw new BadRequestException(`Failed to get signed URL: ${error.message}`);
    }
  }

  /**
   * Check if bucket exists, create if not
   */
  async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError.message);
        return;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        const { error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'],
          fileSizeLimit: 100 * 1024 * 1024 // 100MB
        });

        if (createError) {
          console.error('Error creating bucket:', createError.message);
        } else {
          console.log(`Bucket ${this.bucketName} created successfully`);
        }
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error.message);
    }
  }
}
