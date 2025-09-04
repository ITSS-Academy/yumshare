import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EgressUsage {
  type: 'database' | 'storage' | 'realtime' | 'auth' | 'api' | 'edge_functions';
  bytes: number;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface DailyEgressStats {
  date: string;
  totalBytes: number;
  breakdown: {
    database: number;
    storage: number;
    realtime: number;
    auth: number;
    api: number;
    edge_functions: number;
  };
}

@Injectable()
export class EgressMonitorService {
  private readonly logger = new Logger(EgressMonitorService.name);
  private dailyUsage: Map<string, DailyEgressStats> = new Map();
  private readonly maxDailyBytes = 5 * 1024 * 1024 * 1024; // 5GB limit

  constructor(private configService: ConfigService) {}

  /**
   * Log egress usage for monitoring
   */
  async logEgressUsage(
    type: 'database' | 'storage' | 'realtime' | 'auth' | 'api' | 'edge_functions',
    bytes: number,
    details?: Record<string, any>
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const usage: EgressUsage = {
      type,
      bytes,
      timestamp: new Date(),
      details
    };

    // Update daily stats
    this.updateDailyStats(today, usage);

    // Log usage
    this.logger.log(
      `${type.toUpperCase()} egress: ${this.formatBytes(bytes)} - ${details?.operation || 'unknown operation'}`
    );

    // Check if approaching limit
    await this.checkEgressLimit(today);
  }

  /**
   * Update daily egress statistics
   */
  private updateDailyStats(date: string, usage: EgressUsage): void {
    if (!this.dailyUsage.has(date)) {
      this.dailyUsage.set(date, {
        date,
        totalBytes: 0,
        breakdown: {
          database: 0,
          storage: 0,
          realtime: 0,
          auth: 0,
          api: 0,
          edge_functions: 0
        }
      });
    }

    const dailyStats = this.dailyUsage.get(date)!;
    dailyStats.totalBytes += usage.bytes;
    dailyStats.breakdown[usage.type] += usage.bytes;
  }

  /**
   * Check if approaching daily egress limit
   */
  private async checkEgressLimit(date: string): Promise<void> {
    const dailyStats = this.dailyUsage.get(date);
    if (!dailyStats) return;

    const usagePercentage = (dailyStats.totalBytes / this.maxDailyBytes) * 100;

    if (usagePercentage >= 80) {
      this.logger.warn(
        `⚠️ EGRESS WARNING: ${usagePercentage.toFixed(1)}% of daily limit used (${this.formatBytes(dailyStats.totalBytes)}/${this.formatBytes(this.maxDailyBytes)})`
      );
    }

    if (usagePercentage >= 90) {
      this.logger.error(
        `🚨 EGRESS CRITICAL: ${usagePercentage.toFixed(1)}% of daily limit used!`
      );
      
      // Could send alert here (email, Slack, etc.)
      await this.sendEgressAlert(dailyStats, usagePercentage);
    }
  }

  /**
   * Get current daily egress statistics
   */
  getDailyStats(date?: string): DailyEgressStats | null {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.dailyUsage.get(targetDate) || null;
  }

  /**
   * Get egress usage breakdown
   */
  getEgressBreakdown(date?: string): Record<string, number> | null {
    const dailyStats = this.getDailyStats(date);
    return dailyStats ? dailyStats.breakdown : null;
  }

  /**
   * Get total egress usage for a date
   */
  getTotalEgress(date?: string): number {
    const dailyStats = this.getDailyStats(date);
    return dailyStats ? dailyStats.totalBytes : 0;
  }

  /**
   * Get egress usage by type
   */
  getEgressByType(type: string, date?: string): number {
    const dailyStats = this.getDailyStats(date);
    return dailyStats ? dailyStats.breakdown[type as keyof typeof dailyStats.breakdown] || 0 : 0;
  }

  /**
   * Get egress recommendations
   */
  getEgressRecommendations(): string[] {
    const recommendations: string[] = [];
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = this.getDailyStats(today);

    if (!dailyStats) return recommendations;

    // Database egress recommendations
    if (dailyStats.breakdown.database > 1024 * 1024 * 1024) { // > 1GB
      recommendations.push('🔍 Database: Implement pagination and field selection');
      recommendations.push('🔍 Database: Use query optimization and caching');
    }

    // Storage egress recommendations
    if (dailyStats.breakdown.storage > 2 * 1024 * 1024 * 1024) { // > 2GB
      recommendations.push('🖼️ Storage: Implement image compression and thumbnails');
      recommendations.push('🖼️ Storage: Use CDN for static assets');
    }

    // Realtime egress recommendations
    if (dailyStats.breakdown.realtime > 512 * 1024 * 1024) { // > 512MB
      recommendations.push('⚡ Realtime: Optimize WebSocket payloads');
      recommendations.push('⚡ Realtime: Implement message batching');
    }

    // API egress recommendations
    if (dailyStats.breakdown.api > 512 * 1024 * 1024) { // > 512MB
      recommendations.push('🌐 API: Implement response compression');
      recommendations.push('🌐 API: Use GraphQL for selective data fetching');
    }

    return recommendations;
  }

  /**
   * Reset daily statistics
   */
  resetDailyStats(date?: string): void {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.dailyUsage.delete(targetDate);
    this.logger.log(`Reset egress stats for ${targetDate}`);
  }

  /**
   * Get egress usage history
   */
  getEgressHistory(days: number = 7): DailyEgressStats[] {
    const history: DailyEgressStats[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stats = this.getDailyStats(dateStr);
      if (stats) {
        history.push(stats);
      }
    }

    return history;
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Send egress alert (placeholder for alert implementation)
   */
  private async sendEgressAlert(stats: DailyEgressStats, percentage: number): Promise<void> {
    // TODO: Implement alert mechanism (email, Slack, etc.)
    this.logger.error(
      `EGRESS ALERT: ${percentage.toFixed(1)}% limit reached on ${stats.date}`
    );
  }

  /**
   * Get egress efficiency score (0-100)
   */
  getEgressEfficiencyScore(): number {
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = this.getDailyStats(today);
    
    if (!dailyStats) return 100;

    const usagePercentage = (dailyStats.totalBytes / this.maxDailyBytes) * 100;
    const efficiencyScore = Math.max(0, 100 - usagePercentage);
    
    return Math.round(efficiencyScore);
  }
}
