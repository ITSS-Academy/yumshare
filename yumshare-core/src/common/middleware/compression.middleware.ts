import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as zlib from 'zlib';

export interface CompressionOptions {
  threshold?: number; // Minimum size to compress (in bytes)
  level?: number; // Compression level (1-9, higher = more compression)
  algorithm?: 'gzip' | 'deflate' | 'br'; // Compression algorithm
}

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private readonly defaultOptions: Required<CompressionOptions> = {
    threshold: 1024, // 1KB
    level: 6,
    algorithm: 'gzip'
  };

  use(req: Request, res: Response, next: NextFunction): void {
    const options = { ...this.defaultOptions };
    
    // Check if client accepts compression
    const acceptEncoding = req.headers['accept-encoding'];
    if (!acceptEncoding) {
      return next();
    }

    // Determine best compression algorithm
    let algorithm = options.algorithm;
    if (acceptEncoding.includes('br')) {
      algorithm = 'br';
    } else if (acceptEncoding.includes('gzip')) {
      algorithm = 'gzip';
    } else if (acceptEncoding.includes('deflate')) {
      algorithm = 'deflate';
    } else {
      return next();
    }

    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    // Override send method
    res.send = function(body: any): Response {
      if (this.getHeader('Content-Encoding')) {
        return originalSend.call(this, body);
      }

      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      const bodyBuffer = Buffer.from(bodyStr, 'utf8');

      if (bodyBuffer.length < options.threshold) {
        return originalSend.call(this, body);
      }

      this.setHeader('Content-Encoding', algorithm);
      this.setHeader('Vary', 'Accept-Encoding');

      const compressed = this.compressBuffer(bodyBuffer, algorithm, options.level);
      this.setHeader('Content-Length', compressed.length);

      return originalSend.call(this, compressed);
    };

    // Override json method
    res.json = function(body: any): Response {
      if (this.getHeader('Content-Encoding')) {
        return originalJson.call(this, body);
      }

      const bodyStr = JSON.stringify(body);
      const bodyBuffer = Buffer.from(bodyStr, 'utf8');

      if (bodyBuffer.length < options.threshold) {
        return originalJson.call(this, body);
      }

      this.setHeader('Content-Encoding', algorithm);
      this.setHeader('Vary', 'Accept-Encoding');

      const compressed = this.compressBuffer(bodyBuffer, algorithm, options.level);
      this.setHeader('Content-Length', compressed.length);

      return originalSend.call(this, compressed);
    };

    // Override end method
    res.end = function(chunk?: any, encoding?: any): Response {
      if (this.getHeader('Content-Encoding')) {
        return originalEnd.call(this, chunk, encoding);
      }

      if (chunk) {
        const bodyBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding || 'utf8');

        if (bodyBuffer.length >= options.threshold) {
          this.setHeader('Content-Encoding', algorithm);
          this.setHeader('Vary', 'Accept-Encoding');

          const compressed = this.compressBuffer(bodyBuffer, algorithm, options.level);
          this.setHeader('Content-Length', compressed.length);

          return originalEnd.call(this, compressed);
        }
      }

      return originalEnd.call(this, chunk, encoding);
    };

    // Add compression method to response
    (res as any).compressBuffer = (buffer: Buffer, algo: string, level: number): Buffer => {
      try {
        switch (algo) {
          case 'br':
            return zlib.brotliCompressSync(buffer, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: level } });
          case 'gzip':
            return zlib.gzipSync(buffer, { level });
          case 'deflate':
            return zlib.deflateSync(buffer, { level });
          default:
            return buffer;
        }
      } catch (error) {
        // If compression fails, return original buffer
        return buffer;
      }
    };

    next();
  }

  // Static method to compress buffer
  static compressBuffer(buffer: Buffer, algorithm: string, level: number = 6): Buffer {
    try {
      switch (algorithm) {
        case 'br':
          return zlib.brotliCompressSync(buffer, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: level } });
        case 'gzip':
          return zlib.gzipSync(buffer, { level });
        case 'deflate':
          return zlib.deflateSync(buffer, { level });
        default:
          return buffer;
      }
    } catch (error) {
      return buffer;
    }
  }

  // Static method to get compression ratio
  static getCompressionRatio(original: Buffer, compressed: Buffer): number {
    if (original.length === 0) return 0;
    return ((original.length - compressed.length) / original.length) * 100;
  }
}
