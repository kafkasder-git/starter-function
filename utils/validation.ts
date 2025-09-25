/**
 * @fileoverview Comprehensive Validation Utilities
 * @description Centralized validation functions for forms, data, and business logic
 */

import { z } from 'zod';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationOptions {
  strict?: boolean;
  sanitize?: boolean;
  trim?: boolean;
  allowEmpty?: boolean;
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

// Common validation schemas
export const commonSchemas = {
  // Email validation
  email: z
    .string()
    .email('Geçersiz email formatı')
    .min(5, 'Email en az 5 karakter olmalı')
    .max(254, 'Email çok uzun'),

  // Phone validation (Turkish)
  phone: z
    .string()
    .regex(/^(\+90|90|0)?\s*([0-9]\s*){10}$/, 'Geçersiz telefon numarası formatı')
    .transform((val) => val.replace(/\s/g, '')),

  // TC Kimlik No validation
  tcKimlik: z
    .string()
    .regex(/^[1-9][0-9]{10}$/, 'TC Kimlik No 11 haneli olmalı ve 0 ile başlamamalı')
    .refine((val) => {
      if (val.length !== 11) return false;
      const digits = val.split('').map(Number);

      // Check if all digits are the same
      if (digits.every((d) => d === digits[0])) return false;

      // Checksum validation
      const checksum1 = ((digits[0] ?? 0) + (digits[2] ?? 0) + (digits[4] ?? 0) + (digits[6] ?? 0) + (digits[8] ?? 0)) * 7;
      const checksum2 = (digits[1] ?? 0) + (digits[3] ?? 0) + (digits[5] ?? 0) + (digits[7] ?? 0);
      const digit10 = (checksum1 - checksum2) % 10;
      const digit11 =
        ((digits[0] ?? 0) +
          (digits[1] ?? 0) +
          (digits[2] ?? 0) +
          (digits[3] ?? 0) +
          (digits[4] ?? 0) +
          (digits[5] ?? 0) +
          (digits[6] ?? 0) +
          (digits[7] ?? 0) +
          (digits[8] ?? 0) +
          (digits[9] ?? 0)) %
        10;

      return digit10 === (digits[9] ?? 0) && digit11 === (digits[10] ?? 0);
    }, 'Geçersiz TC Kimlik No'),

  // IBAN validation (Turkish)
  iban: z
    .string()
    .regex(/^TR[0-9]{24}$/, 'Geçersiz IBAN formatı (TR ile başlamalı ve 26 karakter olmalı)')
    .transform((val) => val.toUpperCase()),

  // Password validation
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermeli',
    ),

  // Name validation
  name: z
    .string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(50, 'İsim çok uzun')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harf ve boşluk içerebilir'),

  // Amount validation
  amount: z.number().min(0.01, "Tutar 0.01'den küçük olamaz").max(1000000, 'Tutar çok büyük'),

  // Date validation
  date: z
    .date()
    .refine((date) => date <= new Date(), 'Geçmiş bir tarih seçin')
    .refine((date) => date >= new Date('1900-01-01'), 'Geçersiz tarih'),

  // URL validation
  url: z.string().url('Geçersiz URL formatı'),

  // File size validation (in bytes)
  fileSize: z.number().max(10 * 1024 * 1024, "Dosya boyutu 10MB'dan büyük olamaz"),

  // File type validation
  fileType: z
    .string()
    .refine(
      (type) => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(type),
      'Desteklenmeyen dosya türü',
    ),
};

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

export class ValidationService {
  /**
   * Validate email address
   */
  static validateEmail(email: string, options?: ValidationOptions): ValidationResult<string> {
    try {
      const result = commonSchemas.email.parse(ValidationService.preprocess(email, options));
      return { success: true, data: result };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            field: 'email',
            message: err.message,
            code: err.code,
            value: email,
          })),
        };
      }
      return {
        success: false,
        errors: [
          { field: 'email', message: 'Email validation failed', code: 'UNKNOWN', value: email },
        ],
      };
    }
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone: string, options?: ValidationOptions): ValidationResult<string> {
    try {
      const result = commonSchemas.phone.parse(ValidationService.preprocess(phone, options));
      return { success: true, data: result };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            field: 'phone',
            message: err.message,
            code: err.code,
            value: phone,
          })),
        };
      }
      return {
        success: false,
        errors: [
          { field: 'phone', message: 'Phone validation failed', code: 'UNKNOWN', value: phone },
        ],
      };
    }
  }

  /**
   * Validate TC Kimlik No
   */
  static validateTcKimlik(tcKimlik: string, options?: ValidationOptions): ValidationResult<string> {
    try {
      const result = commonSchemas.tcKimlik.parse(ValidationService.preprocess(tcKimlik, options));
      return { success: true, data: result };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            field: 'tcKimlik',
            message: err.message,
            code: err.code,
            value: tcKimlik,
          })),
        };
      }
      return {
        success: false,
        errors: [
          {
            field: 'tcKimlik',
            message: 'TC Kimlik validation failed',
            code: 'UNKNOWN',
            value: tcKimlik,
          },
        ],
      };
    }
  }

  /**
   * Validate IBAN
   */
  static validateIban(iban: string, options?: ValidationOptions): ValidationResult<string> {
    try {
      const result = commonSchemas.iban.parse(ValidationService.preprocess(iban, options));
      return { success: true, data: result };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            field: 'iban',
            message: err.message,
            code: err.code,
            value: iban,
          })),
        };
      }
      return {
        success: false,
        errors: [
          { field: 'iban', message: 'IBAN validation failed', code: 'UNKNOWN', value: iban },
        ],
      };
    }
  }

  /**
   * Validate password
   */
  static validatePassword(password: string, options?: ValidationOptions): ValidationResult<string> {
    try {
      const result = commonSchemas.password.parse(ValidationService.preprocess(password, options));
      return { success: true, data: result };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            field: 'password',
            message: err.message,
            code: err.code,
            value: password,
          })),
        };
      }
      return {
        success: false,
        errors: [
          {
            field: 'password',
            message: 'Password validation failed',
            code: 'UNKNOWN',
            value: password,
          },
        ],
      };
    }
  }

  /**
   * Validate amount
   */
  static validateAmount(amount: number): ValidationResult<number> {
    try {
      const result = commonSchemas.amount.parse(amount);
      return { success: true, data: result };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            field: 'amount',
            message: err.message,
            code: err.code,
            value: amount,
          })),
        };
      }
      return {
        success: false,
        errors: [
          { field: 'amount', message: 'Amount validation failed', code: 'UNKNOWN', value: amount },
        ],
      };
    }
  }

  /**
   * Validate file
   */
  static validateFile(file: File, maxSize: number = 10 * 1024 * 1024): ValidationResult<File> {
    const errors: ValidationError[] = [];

    // Size validation
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: `Dosya boyutu ${String(maxSize / (1024 * 1024))}MB'dan büyük olamaz`,
        code: 'FILE_TOO_LARGE',
        value: file.size,
      });
    }

    // Type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        message: 'Desteklenmeyen dosya türü',
        code: 'INVALID_FILE_TYPE',
        value: file.type,
      });
    }

    return errors.length > 0 ? { success: false, errors } : { success: true, data: file };
  }

  /**
   * Validate form data
   */
  static validateForm<T>(data: T, schema: z.ZodSchema<T>): ValidationResult<T> {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            value: err.path.reduce(
              (obj: unknown, key: unknown) => (obj as Record<string, unknown>)[String(key)],
              data,
            ),
          })),
        };
      }
      return {
        success: false,
        errors: [
          { field: 'form', message: 'Form validation failed', code: 'UNKNOWN', value: data },
        ],
      };
    }
  }

  /**
   * Sanitize string input
   */
  static sanitize(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .slice(0, 1000); // Limit length
  }

  /**
   * Preprocess string for validation
   */
  private static preprocess(input: string, options?: ValidationOptions): string {
    let processed = input;

    if (options?.trim !== false) {
      processed = processed.trim();
    }

    if (options?.sanitize) {
      processed = ValidationService.sanitize(processed);
    }

    return processed;
  }

  /**
   * Validate multiple fields at once
   */
  static validateMultiple(
    validations: {
      value: unknown;
      validator: (value: unknown) => ValidationResult;
      field: string;
    }[],
  ): ValidationResult {
    const allErrors: ValidationError[] = [];

    for (const validation of validations) {
      const result = validation.validator(validation.value);
      if (!result.success && result.errors) {
        allErrors.push(
          ...result.errors.map((error) => ({
            ...error,
            field: `${validation.field}.${(error as { field?: string }).field ?? 'unknown'}`,
          })),
        );
      }
    }

    return allErrors.length > 0 ? { success: false, errors: allErrors } : { success: true };
  }
}

// =============================================================================
// BUSINESS LOGIC VALIDATION SCHEMAS
// =============================================================================

// Member validation schema
export const memberSchema = z.object({
  adSoyad: commonSchemas.name,
  email: commonSchemas.email.optional(),
  telefon: commonSchemas.phone.optional(),
  tcKimlik: commonSchemas.tcKimlik.optional(),
  dogumTarihi: commonSchemas.date.optional(),
  adres: z.string().min(10, 'Adres en az 10 karakter olmalı').optional(),
  uyeTuru: z.enum(['bireysel', 'kurumsal', 'onur']),
  aktif: z.boolean().default(true),
});

// Aid request validation schema
export const aidRequestSchema = z.object({
  baslik: z.string().min(5, 'Başlık en az 5 karakter olmalı').max(100, 'Başlık çok uzun'),
  aciklama: z.string().min(20, 'Açıklama en az 20 karakter olmalı').max(1000, 'Açıklama çok uzun'),
  kategori: z.enum(['gida', 'barinma', 'saglik', 'egitim', 'diger']),
  oncelik: z.enum(['dusuk', 'orta', 'yuksek', 'acil']).default('orta'),
  tahminiMaliyet: commonSchemas.amount.optional(),
  durum: z
    .enum(['beklemede', 'degerlendiriliyor', 'onaylandi', 'reddedildi', 'tamamlandi'])
    .default('beklemede'),
  basvuranId: z.string().min(1, 'Başvuran ID gerekli'),
  iban: commonSchemas.iban.optional(),
});

// Donation validation schema
export const donationSchema = z.object({
  miktar: commonSchemas.amount,
  bagisTuru: z.enum(['nakdi', 'ayni']),
  kategori: z.enum(['genel', 'yardim', 'proje', 'zekat', 'fitre']),
  aciklama: z.string().max(500, 'Açıklama çok uzun').optional(),
  bagisciId: z.string().min(1, 'Bağışçı ID gerekli'),
  anonim: z.boolean().default(false),
  vergiIndirimi: z.boolean().default(false),
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const validateMember = (data: unknown) => ValidationService.validateForm(data, memberSchema);
export const validateAidRequest = (data: unknown) =>
  ValidationService.validateForm(data, aidRequestSchema);
export const validateDonation = (data: unknown) =>
  ValidationService.validateForm(data, donationSchema);

// Helper function to get validation error messages
export const getValidationErrors = (result: ValidationResult): string[] => {
  if (result.success || !result.errors) return [];
  return result.errors.map((error) => `${error.field}: ${error.message}`);
};

// Helper function to check if validation passed
export const isValid = (result: ValidationResult): boolean => result.success;

// Helper function to get first error message
export const getFirstError = (result: ValidationResult): string | null => {
  if ((result.success || !result.errors) ?? result.errors.length === 0) return null;
  return result.errors[0]?.message ?? 'Validation error';
};

export default ValidationService;
