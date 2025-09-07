import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface OptimizedImage {
  original: string;
  optimized?: string;
  thumbnail?: string;
  loading: 'lazy' | 'eager';
  placeholder?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  private readonly defaultOptions: Required<ImageOptimizationOptions> = {
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 800,
    format: 'webp',
    generateThumbnail: true,
    thumbnailSize: 300
  };

  private imageCache = new Map<string, OptimizedImage>();
  private loadingImages = new BehaviorSubject<Set<string>>(new Set());

  /**
   * Optimize image URL with compression and thumbnail
   */
  optimizeImageUrl(
    originalUrl: string, 
    options: Partial<ImageOptimizationOptions> = {}
  ): OptimizedImage {
    const opts = { ...this.defaultOptions, ...options };
    
    // Check cache first
    if (this.imageCache.has(originalUrl)) {
      return this.imageCache.get(originalUrl)!;
    }

    // Generate optimized URLs
    const optimized = this.generateOptimizedUrl(originalUrl, opts);
    const thumbnail = opts.generateThumbnail 
      ? this.generateThumbnailUrl(originalUrl, opts.thumbnailSize)
      : undefined;

    const optimizedImage: OptimizedImage = {
      original: originalUrl,
      optimized,
      thumbnail,
      loading: 'lazy',
      placeholder: this.generatePlaceholderUrl(opts.thumbnailSize)
    };

    // Cache the result
    this.imageCache.set(originalUrl, optimizedImage);
    
    return optimizedImage;
  }

  /**
   * Generate optimized image URL with compression parameters
   */
  private generateOptimizedUrl(url: string, options: ImageOptimizationOptions): string {
    // If it's already an external optimized service, return as is
    if (this.isExternalOptimizedService(url)) {
      return url;
    }

    // For local images, add optimization parameters
    if (url.startsWith('/assets/') || url.startsWith('http://localhost')) {
      return `${url}?optimize=true&quality=${options.quality}&w=${options.maxWidth}&h=${options.maxHeight}`;
    }

    // For external images, try to use image optimization services
    return this.convertToOptimizedService(url, options);
  }

  /**
   * Generate thumbnail URL
   */
  private generateThumbnailUrl(url: string, size: number): string {
    if (this.isExternalOptimizedService(url)) {
      return `${url}&w=${size}&h=${size}&fit=crop`;
    }

    if (url.startsWith('/assets/') || url.startsWith('http://localhost')) {
      return `${url}?thumbnail=true&w=${size}&h=${size}&fit=crop`;
    }

    return this.convertToThumbnailService(url, size);
  }

  /**
   * Convert external URL to optimized service
   */
  private convertToOptimizedService(url: string, options: ImageOptimizationOptions): string {
    // For now, return original URL to avoid Cloudinary demo account issues
    // TODO: Set up your own Cloudinary account or use alternative image optimization service
    return url;
  }

  /**
   * Convert external URL to thumbnail service
   */
  private convertToThumbnailService(url: string, size: number): string {
    // For now, return original URL to avoid Cloudinary demo account issues
    // TODO: Set up your own Cloudinary account or use alternative image optimization service
    return url;
  }

  /**
   * Generate placeholder URL
   */
  private generatePlaceholderUrl(size: number): string {
    // Use a simple data URI placeholder instead of external service
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="14">Loading...</text>
      </svg>
    `)}`;
  }

  /**
   * Check if URL is already from optimized service
   */
  private isExternalOptimizedService(url: string): boolean {
    return url.includes('cloudinary.com') || 
           url.includes('imgix.net') || 
           url.includes('imagekit.io') ||
           url.includes('optimized');
  }

  /**
   * Preload critical images
   */
  preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Get loading state for images
   */
  getLoadingImages(): Observable<Set<string>> {
    return this.loadingImages.asObservable();
  }

  /**
   * Mark image as loading
   */
  setImageLoading(url: string, loading: boolean): void {
    const current = this.loadingImages.value;
    if (loading) {
      current.add(url);
    } else {
      current.delete(url);
    }
    this.loadingImages.next(current);
  }

  /**
   * Clear image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.imageCache.size,
      keys: Array.from(this.imageCache.keys())
    };
  }
}
