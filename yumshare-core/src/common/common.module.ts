import { Module } from '@nestjs/common';
import { SupabaseStorageService } from './services/supabase-storage.service';
import { TimezoneService } from './services/timezone.service';

@Module({
  providers: [SupabaseStorageService, TimezoneService],
  exports: [SupabaseStorageService, TimezoneService],
})
export class CommonModule {}
