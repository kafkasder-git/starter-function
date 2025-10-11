/**
 * @fileoverview Turkish Date Formatting Utilities
 * @description Centralized date/time formatting using date-fns with Turkish locale
 *
 * This module provides consistent date formatting across the application.
 * All functions handle Turkish locale automatically and support various input types.
 *
 * @example
 * import { formatDate, formatTime, formatRelativeTime } from 'lib/utils/dateFormatter';
 *
 * // Format date in Turkish standard format
 * formatDate(new Date()); // '15.01.2024'
 * formatDate('2024-01-15', 'long'); // '15 Ocak 2024'
 *
 * // Format time
 * formatTime(new Date()); // '14:30'
 * formatTime(new Date(), true); // '14:30:45'
 *
 * // Relative time (auto-updates with useRelativeTime hook)
 * formatRelativeTime(new Date(Date.now() - 3600000)); // '1 saat önce'
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

/**
 * MIGRATION GUIDE
 *
 * Replace these patterns:
 * - new Date().toLocaleDateString('tr-TR') → formatDate(new Date())
 * - new Date().toLocaleTimeString('tr-TR') → formatTime(new Date())
 * - new Date().toLocaleString('tr-TR') → formatDateTime(new Date())
 * - formatDistanceToNow(date, { locale: tr }) → formatRelativeTime(date)
 *
 * For auto-updating relative times, use the useRelativeTime hook:
 * - const relativeTime = useRelativeTime(timestamp);
 */

import {
  format,
  formatDistanceToNow,
  formatRelative,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  type Locale,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { logger } from '../logging/logger';

// Type Definitions
export type DateInput = Date | string | number;

export interface DateFormatOptions {
  locale?: Locale;
  addSuffix?: boolean;
  includeSeconds?: boolean;
}

export interface DateRangeValidationResult {
  valid: boolean;
  error?: string;
}

// Constants
export const TURKISH_DATE_FORMAT = 'dd.MM.yyyy';
export const TURKISH_TIME_FORMAT = 'HH:mm';
export const TURKISH_DATETIME_FORMAT = 'dd.MM.yyyy HH:mm';
export const TURKISH_LOCALE = tr;

// Format preset mappings
const FORMAT_PRESETS: Record<string, string> = {
  short: 'dd.MM.yyyy',
  long: 'dd MMMM yyyy',
  full: 'dd MMMM yyyy EEEE',
};

/**
 * Parse date input to Date object
 * @internal
 */
function parseDateInput(date: DateInput): Date | null {
  try {
    if (date instanceof Date) {
      return isValid(date) ? date : null;
    }
    if (typeof date === 'string') {
      const parsed = parseISO(date);
      return isValid(parsed) ? parsed : null;
    }
    if (typeof date === 'number') {
      const parsed = new Date(date);
      return isValid(parsed) ? parsed : null;
    }
    return null;
  } catch (error) {
    logger.warn('Failed to parse date input', { date, error });
    return null;
  }
}

/**
 * Format a date in Turkish locale
 *
 * @param date - Date to format (Date object, ISO string, or timestamp)
 * @param formatString - Format string or preset ('short', 'long', 'full')
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()); // '15.01.2024'
 * formatDate('2024-01-15', 'long'); // '15 Ocak 2024'
 * formatDate(new Date(), 'dd/MM/yyyy'); // '15/01/2024'
 */
export function formatDate(date: DateInput, formatString: string = 'short'): string {
  try {
    const parsedDate = parseDateInput(date);
    if (!parsedDate) {
      return '';
    }

    const formatStr = FORMAT_PRESETS[formatString] ?? formatString;
    return format(parsedDate, formatStr, { locale: tr });
  } catch (error) {
    logger.warn('Failed to format date', { date, formatString, error });
    return '';
  }
}

/**
 * Format time in Turkish 24-hour format
 *
 * @param date - Date to format
 * @param includeSeconds - Include seconds in output
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date()); // '14:30'
 * formatTime(new Date(), true); // '14:30:45'
 */
export function formatTime(date: DateInput, includeSeconds: boolean = false): string {
  try {
    const parsedDate = parseDateInput(date);
    if (!parsedDate) {
      return '';
    }

    const formatStr = includeSeconds ? 'HH:mm:ss' : TURKISH_TIME_FORMAT;
    return format(parsedDate, formatStr, { locale: tr });
  } catch (error) {
    logger.warn('Failed to format time', { date, includeSeconds, error });
    return '';
  }
}

/**
 * Format date and time together
 *
 * @param date - Date to format
 * @param formatString - Custom format string (optional)
 * @returns Formatted date-time string
 *
 * @example
 * formatDateTime(new Date()); // '15.01.2024 14:30'
 * formatDateTime(new Date(), 'dd.MM.yyyy HH:mm:ss'); // '15.01.2024 14:30:45'
 */
export function formatDateTime(date: DateInput, formatString: string = TURKISH_DATETIME_FORMAT): string {
  try {
    const parsedDate = parseDateInput(date);
    if (!parsedDate) {
      return '';
    }

    return format(parsedDate, formatString, { locale: tr });
  } catch (error) {
    logger.warn('Failed to format date-time', { date, formatString, error });
    return '';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 *
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Relative time string in Turkish
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)); // '1 saat önce'
 * formatRelativeTime(new Date(Date.now() + 3600000)); // '1 saat içinde'
 */
export function formatRelativeTime(date: DateInput, options?: DateFormatOptions): string {
  try {
    const parsedDate = parseDateInput(date);
    if (!parsedDate) {
      return '';
    }

    const defaultOptions = { addSuffix: true, locale: tr };
    const mergedOptions = { ...defaultOptions, ...options };

    return formatDistanceToNow(parsedDate, mergedOptions);
  } catch (error) {
    logger.warn('Failed to format relative time', { date, options, error });
    return '';
  }
}

/**
 * Format relative date (e.g., "today at 14:30", "yesterday at 09:15")
 *
 * @param date - Date to format
 * @param baseDate - Base date for comparison (defaults to now)
 * @returns Relative date string in Turkish
 *
 * @example
 * formatRelativeDate(new Date()); // 'bugün saat 14:30'
 * formatRelativeDate(yesterday); // 'dün saat 09:15'
 */
export function formatRelativeDate(date: DateInput, baseDate?: DateInput): string {
  try {
    const parsedDate = parseDateInput(date);
    if (!parsedDate) {
      return '';
    }

    const parsedBaseDate = baseDate ? parseDateInput(baseDate) : new Date();
    if (!parsedBaseDate) {
      return '';
    }

    return formatRelative(parsedDate, parsedBaseDate, { locale: tr });
  } catch (error) {
    logger.warn('Failed to format relative date', { date, baseDate, error });
    return '';
  }
}

/**
 * Format date range
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @param separator - Separator string (default: ' - ')
 * @returns Formatted date range string
 *
 * @example
 * formatDateRange('2024-01-01', '2024-12-31'); // '01.01.2024 - 31.12.2024'
 */
export function formatDateRange(startDate: DateInput, endDate: DateInput, separator: string = ' - '): string {
  try {
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);

    if (!formattedStart || !formattedEnd) {
      return '';
    }

    return `${formattedStart}${separator}${formattedEnd}`;
  } catch (error) {
    logger.warn('Failed to format date range', { startDate, endDate, separator, error });
    return '';
  }
}

/**
 * Parse Turkish date string to Date object
 *
 * @param dateString - Date string to parse
 * @returns Parsed Date object or null if invalid
 *
 * @example
 * parseDate('15.01.2024'); // Date object
 * parseDate('15/01/2024'); // Date object
 * parseDate('2024-01-15'); // Date object
 */
export function parseDate(dateString: string): Date | null {
  try {
    // Try ISO format first
    const isoDate = parseISO(dateString);
    if (isValid(isoDate)) {
      return isoDate;
    }

    // Try Turkish formats: dd.MM.yyyy or dd/MM/yyyy
    const parts = dateString.split(/[./]/);
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);

      if (isValid(date)) {
        return date;
      }
    }

    return null;
  } catch (error) {
    logger.warn('Failed to parse date', { dateString, error });
    return null;
  }
}

/**
 * Parse date string with fallback
 *
 * @param dateString - Date string to parse
 * @param fallback - Fallback date if parsing fails (defaults to current date)
 * @returns Parsed Date object or fallback
 *
 * @example
 * parseDateSafe('15.01.2024'); // Date object
 * parseDateSafe('invalid'); // new Date()
 */
export function parseDateSafe(dateString: string, fallback?: Date): Date {
  const parsed = parseDate(dateString);
  return parsed ?? fallback ?? new Date();
}

/**
 * Check if date input is valid
 *
 * @param date - Date to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidDate(new Date()); // true
 * isValidDate('2024-01-15'); // true
 * isValidDate('invalid'); // false
 */
export function isValidDate(date: DateInput): boolean {
  try {
    const parsed = parseDateInput(date);
    return parsed !== null;
  } catch {
    return false;
  }
}

/**
 * Validate date range
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @param options - Validation options
 * @returns Validation result with error message if invalid
 *
 * @example
 * validateDateRange('2024-01-01', '2024-12-31'); // { valid: true }
 * validateDateRange('2024-12-31', '2024-01-01'); // { valid: false, error: '...' }
 */
export function validateDateRange(
  startDate: DateInput,
  endDate: DateInput,
  options?: { allowSameDay?: boolean; maxDays?: number }
): DateRangeValidationResult {
  try {
    const parsedStart = parseDateInput(startDate);
    const parsedEnd = parseDateInput(endDate);

    if (!parsedStart || !parsedEnd) {
      return {
        valid: false,
        error: 'Geçersiz tarih formatı',
      };
    }

    // Check if start is after end
    if (isAfter(parsedStart, parsedEnd)) {
      return {
        valid: false,
        error: 'Başlangıç tarihi bitiş tarihinden sonra olamaz',
      };
    }

    // Check if same day is allowed
    if (!options?.allowSameDay && parsedStart.getTime() === parsedEnd.getTime()) {
      return {
        valid: false,
        error: 'Başlangıç ve bitiş tarihleri aynı olamaz',
      };
    }

    // Check max days if specified
    if (options?.maxDays) {
      const daysDiff = differenceInDays(parsedEnd, parsedStart);
      if (daysDiff > options.maxDays) {
        return {
          valid: false,
          error: `Tarih aralığı en fazla ${options.maxDays} gün olabilir`,
        };
      }
    }

    return { valid: true };
  } catch (error) {
    logger.warn('Failed to validate date range', { startDate, endDate, options, error });
    return {
      valid: false,
      error: 'Tarih aralığı doğrulanamadı',
    };
  }
}

/**
 * Check if date is within range
 *
 * @param date - Date to check
 * @param startDate - Range start date
 * @param endDate - Range end date
 * @returns True if date is within range (inclusive)
 *
 * @example
 * isDateInRange('2024-06-15', '2024-01-01', '2024-12-31'); // true
 */
export function isDateInRange(date: DateInput, startDate: DateInput, endDate: DateInput): boolean {
  try {
    const parsedDate = parseDateInput(date);
    const parsedStart = parseDateInput(startDate);
    const parsedEnd = parseDateInput(endDate);

    if (!parsedDate || !parsedStart || !parsedEnd) {
      return false;
    }

    return !isBefore(parsedDate, parsedStart) && !isAfter(parsedDate, parsedEnd);
  } catch (error) {
    logger.warn('Failed to check if date is in range', { date, startDate, endDate, error });
    return false;
  }
}

/**
 * Calculate appropriate update interval for relative time
 * Used by useRelativeTime hook to determine refresh frequency
 *
 * @param date - Date to calculate interval for
 * @returns Update interval in milliseconds, or null if no updates needed
 *
 * @example
 * getRelativeTimeUpdateInterval(new Date(Date.now() - 30000)); // 1000 (update every second)
 * getRelativeTimeUpdateInterval(new Date(Date.now() - 3600000)); // 60000 (update every minute)
 */
export function getRelativeTimeUpdateInterval(date: DateInput): number | null {
  try {
    const parsedDate = parseDateInput(date);
    if (!parsedDate) {
      return null;
    }

    const now = new Date();
    const minutesDiff = Math.abs(differenceInMinutes(now, parsedDate));
    const hoursDiff = Math.abs(differenceInHours(now, parsedDate));
    const daysDiff = Math.abs(differenceInDays(now, parsedDate));

    // Less than 1 minute: update every second
    if (minutesDiff < 1) {
      return 1000;
    }

    // Less than 1 hour: update every minute
    if (hoursDiff < 1) {
      return 60000;
    }

    // Less than 1 day: update every hour
    if (daysDiff < 1) {
      return 3600000;
    }

    // Older than 1 day: no auto-update needed
    return null;
  } catch (error) {
    logger.warn('Failed to calculate update interval', { date, error });
    return null;
  }
}

/**
 * Get Turkish day name
 *
 * @param date - Date to get day name for
 * @returns Turkish day name (e.g., 'Pazartesi', 'Salı')
 *
 * @example
 * getTurkishDayName(new Date('2024-01-15')); // 'Pazartesi'
 */
export function getTurkishDayName(date: DateInput): string {
  try {
    const parsedDate = parseDateInput(date);
    if (!parsedDate) {
      return '';
    }

    return format(parsedDate, 'EEEE', { locale: tr });
  } catch (error) {
    logger.warn('Failed to get Turkish day name', { date, error });
    return '';
  }
}

/**
 * Get Turkish month name
 *
 * @param date - Date to get month name for
 * @returns Turkish month name (e.g., 'Ocak', 'Şubat')
 *
 * @example
 * getTurkishMonthName(new Date('2024-01-15')); // 'Ocak'
 */
export function getTurkishMonthName(date: DateInput): string {
  try {
    const parsedDate = parseDateInput(date);
    if (!parsedDate) {
      return '';
    }

    return format(parsedDate, 'MMMM', { locale: tr });
  } catch (error) {
    logger.warn('Failed to get Turkish month name', { date, error });
    return '';
  }
}

