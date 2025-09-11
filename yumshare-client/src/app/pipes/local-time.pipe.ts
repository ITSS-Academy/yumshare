import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localTime',
  standalone: true
})
export class LocalTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: 'shortTime' | 'shortDate' | 'full' = 'shortTime'): string {
    if (!value) return '';
    
    try {
      // Convert to Date object if it's a string
      let date: Date;
      
      if (typeof value === 'string') {
        // Handle ISO string format
        date = new Date(value);
        
        // If the string doesn't have timezone info, assume it's UTC
        if (value.includes('T') && !value.includes('Z') && !value.includes('+')) {
          // Add UTC timezone if missing
          date = new Date(value + 'Z');
        }
        
        // If it's a PostgreSQL timestamp without timezone, treat as UTC
        if (value.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/)) {
          date = new Date(value + 'Z');
        }
      } else {
        date = value;
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
      
        return '';
      }
      
      
      
      // Format based on type - no timezone conversion since database already stores Vietnam time
      switch (format) {
        case 'shortTime':
          return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
            hour12: false
          });
        case 'shortDate':
          return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        case 'full':
          return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        default:
          return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
      }
    } catch (error) {
      // console.error('Error formatting date:', error); 
      return '';
    }
  }
}
