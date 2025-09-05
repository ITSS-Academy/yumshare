import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly cleanupInterval = 60000; // Clean up every minute

  constructor(private reflector: Reflector) {
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.get<RateLimitOptions>('rateLimit', context.getHandler());
    
    if (!options) {
      return true; // No rate limiting configured
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request);
    
    if (this.isRateLimited(key, options)) {
      const message = options.message || 'Too many requests, please try again later.';
      const statusCode = options.statusCode || HttpStatus.TOO_MANY_REQUESTS;
      
      throw new HttpException(
        {
          statusCode,
          message,
          error: 'Rate Limit Exceeded',
          retryAfter: this.getRetryAfter(key, options)
        },
        statusCode
      );
    }

    this.incrementRequest(key, options);
    return true;
  }

  private generateKey(request: Request): string {
    // Use IP address as primary key
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    
    // If user is authenticated, include user ID for more granular control
    const userId = (request as any).user?.id;
    if (userId) {
      return `user:${userId}:${request.path}`;
    }
    
    return `ip:${ip}:${request.path}`;
  }

  private isRateLimited(key: string, options: RateLimitOptions): boolean {
    const record = this.requestCounts.get(key);
    
    if (!record) {
      return false;
    }

    // Check if window has expired
    if (Date.now() > record.resetTime) {
      this.requestCounts.delete(key);
      return false;
    }

    return record.count >= options.max;
  }

  private incrementRequest(key: string, options: RateLimitOptions): void {
    const now = Date.now();
    const record = this.requestCounts.get(key);
    
    if (record && now <= record.resetTime) {
      record.count++;
    } else {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
    }
  }

  private getRetryAfter(key: string, options: RateLimitOptions): number {
    const record = this.requestCounts.get(key);
    if (!record) return 0;
    
    const remaining = Math.ceil((record.resetTime - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, record] of this.requestCounts.entries()) {
      if (now > record.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }

  // Public method to get current rate limit status
  getRateLimitStatus(key: string): { count: number; remaining: number; resetTime: number } | null {
    const record = this.requestCounts.get(key);
    if (!record) return null;
    
    const now = Date.now();
    if (now > record.resetTime) {
      this.requestCounts.delete(key);
      return null;
    }
    
    return {
      count: record.count,
      remaining: Math.max(0, record.count),
      resetTime: record.resetTime
    };
  }
}
