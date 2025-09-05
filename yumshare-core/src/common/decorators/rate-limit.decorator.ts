import { SetMetadata } from '@nestjs/common';
import { RateLimitOptions } from '../guards/rate-limit.guard';

export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Rate limit decorator for API endpoints
 * @param options Rate limiting configuration
 */
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  // Strict rate limiting for sensitive operations
  STRICT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many attempts, please try again later.'
  } as RateLimitOptions,

  // Standard rate limiting for most endpoints
  STANDARD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Rate limit exceeded, please slow down.'
  } as RateLimitOptions,

  // Relaxed rate limiting for public endpoints
  RELAXED: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
    message: 'Too many requests, please try again later.'
  } as RateLimitOptions,

  // Per-minute rate limiting
  PER_MINUTE: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Too many requests per minute, please slow down.'
  } as RateLimitOptions,

  // Per-second rate limiting for high-frequency endpoints
  PER_SECOND: {
    windowMs: 1000, // 1 second
    max: 10, // 10 requests per second
    message: 'Too many requests per second, please slow down.'
  } as RateLimitOptions,

  // Custom rate limiting for specific use cases
  CUSTOM: (windowMs: number, max: number, message?: string): RateLimitOptions => ({
    windowMs,
    max,
    message: message || 'Rate limit exceeded.'
  })
};
