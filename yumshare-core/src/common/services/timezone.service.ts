import { Injectable } from '@nestjs/common';

@Injectable()
export class TimezoneService {
  private readonly VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

  /**
   * Convert a date to Vietnam timezone string for display
   */
  toVietnamTimeString(date: Date | string): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleString('vi-VN', {
      timeZone: this.VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Get current time in Vietnam timezone (for database storage)
   */
  getCurrentVietnamTime(): Date {
    // Return Vietnam time for database storage
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: this.VIETNAM_TIMEZONE }));
  }

  /**
   * Format date for display in Vietnam timezone
   */
  formatVietnamTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = new Date(date);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: this.VIETNAM_TIMEZONE,
      ...options
    };
    
    return dateObj.toLocaleString('vi-VN', defaultOptions);
  }

  /**
   * Get time difference in seconds between two dates
   */
  getTimeDifferenceInSeconds(date1: Date | string, date2: Date | string = new Date()): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2.getTime() - d1.getTime()) / 1000);
  }

  /**
   * Check if a date is in the future (considering timezone)
   */
  isFutureDate(date: Date | string): boolean {
    return this.getTimeDifferenceInSeconds(date) < 0;
  }

  /**
   * Get relative time string in Vietnamese
   */
  getRelativeTimeString(date: Date | string): string {
    const diffInSeconds = this.getTimeDifferenceInSeconds(date);
    
    if (diffInSeconds < 0) {
      return 'Trong tương lai';
    }
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  }
}
