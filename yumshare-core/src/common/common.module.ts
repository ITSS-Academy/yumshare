import { Module } from '@nestjs/common';
import { SupabaseStorageService } from './services/supabase-storage.service';
import { TimezoneService } from './services/timezone.service';
import { ImageCompressionService } from './services/image-compression.service';
import { OptimizedQueryService } from './services/optimized-query.service';
import { EgressMonitorService } from './services/egress-monitor.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { CompressionMiddleware } from './middleware/compression.middleware';

@Module({
  providers: [
    SupabaseStorageService, 
    TimezoneService, 
    ImageCompressionService,
    OptimizedQueryService,
    EgressMonitorService,
    RateLimitGuard,
    CompressionMiddleware
  ],
  exports: [
    SupabaseStorageService, 
    TimezoneService, 
    ImageCompressionService,
    OptimizedQueryService,
    EgressMonitorService,
    RateLimitGuard,
    CompressionMiddleware
  ],
})
export class CommonModule {}
