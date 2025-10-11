/**
 * @fileoverview utils Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// Frontend Utilities
import { formatDate as formatDateNew } from './utils/dateFormatter';

/**
 * Generate a unique ID
 */
/**
 * generateId function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Format date for display
 * @deprecated Use formatDate from lib/utils/dateFormatter.ts instead
 * This function is kept for backward compatibility
 */
/**
 * formatDate function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function formatDate(date: string | Date): string {
  // Deprecated: Use formatDate from lib/utils/dateFormatter.ts
  return formatDateNew(date, 'long');
}

/**
 * Format currency for display
 */
/**
 * formatCurrency function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

/**
 * Simulate network delay
 */
/**
 * delay function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get Turkish month name
 */
/**
 * getTurkishMonthName function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function getTurkishMonthName(month: number): string {
  const months = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];
  return months[month - 1] || 'Bilinmiyor';
}

/**
 * Validate Turkish National ID
 */
/**
 * validateTurkishNationalId function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function validateTurkishNationalId(id: string): boolean {
  if (!/^\d{11}$/.test(id)) return false;

  const digits = id.split('').map(Number);
  const checksum = digits[10];

  // First 10 digits sum
  const sum = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0);

  return sum % 10 === checksum;
}

/**
 * Generate receipt number
 */
/**
 * generateReceiptNumber function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function generateReceiptNumber(prefix = 'REC'): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, '0');
  return `${prefix}-${year}-${random}`;
}

/**
 * Safe JSON parse with fallback
 */
/**
 * safeJsonParse function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Debounce function for search inputs
 */
/**
 * debounce function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as unknown as number;
  };
}

/**
 * Check if string contains search term (case insensitive, Turkish chars)
 */
/**
 * searchIncludes function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function searchIncludes(text: string, searchTerm: string): boolean {
  const normalizeText = (str: string) =>
    str
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');

  return normalizeText(text).includes(normalizeText(searchTerm));
}
