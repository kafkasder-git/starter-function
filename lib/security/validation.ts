/**
 * @fileoverview Validation Module - Comprehensive form and data validation
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

/**
 * ValidationResult Interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * FieldValidationResult Interface
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+90|0)?[5][0-9]{9}$/,
  tcKimlik: /^[1-9][0-9]{10}$/,
  iban: /^TR[0-9]{2}[0-9]{4}[0-9]{16}$/,
  postalCode: /^[0-9]{5}$/,
  url: /^https?:\/\/.+/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

/**
 * Field validation functions
 */
export const validateField = {
  required: (
    value: string | number | undefined | null,
    fieldName: string
  ): FieldValidationResult => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return {
        isValid: false,
        error: `${fieldName} alanı zorunludur`,
      };
    }
    return { isValid: true };
  },

  minLength: (value: string, min: number, fieldName: string): FieldValidationResult => {
    if (value.length < min) {
      return {
        isValid: false,
        error: `${fieldName} en az ${min} karakter olmalıdır`,
      };
    }
    return { isValid: true };
  },

  maxLength: (value: string, max: number, fieldName: string): FieldValidationResult => {
    if (value.length > max) {
      return {
        isValid: false,
        error: `${fieldName} en fazla ${max} karakter olabilir`,
      };
    }
    return { isValid: true };
  },

  email: (value: string): FieldValidationResult => {
    if (!VALIDATION_PATTERNS.email.test(value)) {
      return {
        isValid: false,
        error: 'Geçerli bir e-posta adresi giriniz',
      };
    }
    return { isValid: true };
  },

  phone: (value: string): FieldValidationResult => {
    if (!VALIDATION_PATTERNS.phone.test(value)) {
      return {
        isValid: false,
        error: 'Geçerli bir telefon numarası giriniz (5XXXXXXXXX)',
      };
    }
    return { isValid: true };
  },

  tcKimlik: (value: string): FieldValidationResult => {
    if (!VALIDATION_PATTERNS.tcKimlik.test(value)) {
      return {
        isValid: false,
        error: 'Geçerli bir TC Kimlik numarası giriniz',
      };
    }

    // TC Kimlik validation algorithm
    const digits = value.split('').map(Number);
    const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const sum2 = digits[1] + digits[3] + digits[5] + digits[7];

    if ((sum1 * 7 - sum2) % 10 !== digits[9]) {
      return {
        isValid: false,
        error: 'Geçersiz TC Kimlik numarası',
      };
    }

    return { isValid: true };
  },

  iban: (value: string): FieldValidationResult => {
    const cleanValue = value.replace(/\s/g, '').toUpperCase();
    if (!VALIDATION_PATTERNS.iban.test(cleanValue)) {
      return {
        isValid: false,
        error: 'Geçerli bir IBAN numarası giriniz',
      };
    }
    return { isValid: true };
  },

  number: (
    value: string | number,
    min?: number,
    max?: number,
    fieldName?: string
  ): FieldValidationResult => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `${fieldName ?? 'Değer'} geçerli bir sayı olmalıdır`,
      };
    }

    if (min !== undefined && numValue < min) {
      return {
        isValid: false,
        error: `${fieldName ?? 'Değer'} en az ${min} olmalıdır`,
      };
    }

    if (max !== undefined && numValue > max) {
      return {
        isValid: false,
        error: `${fieldName ?? 'Değer'} en fazla ${max} olabilir`,
      };
    }

    return { isValid: true };
  },

  positiveNumber: (value: string | number, fieldName?: string): FieldValidationResult => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue) || numValue <= 0) {
      return {
        isValid: false,
        error: `${fieldName ?? 'Değer'} pozitif bir sayı olmalıdır`,
      };
    }

    return { isValid: true };
  },

  date: (value: string, fieldName?: string): FieldValidationResult => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: `${fieldName ?? 'Tarih'} geçerli bir tarih olmalıdır`,
      };
    }
    return { isValid: true };
  },

  // Common date validation helper
  private validateDate(value: string, fieldName?: string, comparison?: 'future' | 'past'): FieldValidationResult => {
    const date = new Date(value);
    const now = new Date();

    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: `${fieldName ?? 'Tarih'} geçerli bir tarih olmalıdır`,
      };
    }

    if (comparison === 'future' && date <= now) {
      return {
        isValid: false,
        error: `${fieldName ?? 'Tarih'} gelecek bir tarih olmalıdır`,
      };
    }

    if (comparison === 'past' && date >= now) {
      return {
        isValid: false,
        error: `${fieldName ?? 'Tarih'} geçmiş bir tarih olmalıdır`,
      };
    }

    return { isValid: true };
  },

  futureDate: (value: string, fieldName?: string): FieldValidationResult => {
    return this.validateDate(value, fieldName, 'future');
  },

  pastDate: (value: string, fieldName?: string): FieldValidationResult => {
    return this.validateDate(value, fieldName, 'past');
  },

  url: (value: string): FieldValidationResult => {
    if (!VALIDATION_PATTERNS.url.test(value)) {
      return {
        isValid: false,
        error: 'Geçerli bir URL giriniz',
      };
    }
    return { isValid: true };
  },

  oneOf: (value: string, options: string[], fieldName?: string): FieldValidationResult => {
    if (!options.includes(value)) {
      return {
        isValid: false,
        error: `${fieldName ?? 'Değer'} geçerli seçeneklerden biri olmalıdır`,
      };
    }
    return { isValid: true };
  },
};

/**
 * Form validation schemas
 */
export type ValidationSchema = Record<
  string,
  {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string | number | boolean) => FieldValidationResult;
    sanitize?: (value: string) => string;
  }
>;

/**
 * Validate a form against a schema
 */
export const validateForm = (
  data: Record<string, string | number | boolean>,
  schema: ValidationSchema
): ValidationResult => {
  const errors: string[] = [];

  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName];

    // Sanitize input if specified
    let sanitizedValue = value;
    if (rules.sanitize && typeof value === 'string') {
      sanitizedValue = rules.sanitize(value);
    }

    // Required validation
    if (rules.required) {
      const result = validateField.required(
        typeof sanitizedValue === 'boolean' ? sanitizedValue.toString() : sanitizedValue,
        fieldName
      );
      if (!result.isValid) {
        errors.push(result.error!);
        continue;
      }
    }

    // Skip other validations if value is empty and not required
    if (!sanitizedValue && !rules.required) {
      continue;
    }

    // Min length validation
    if (rules.minLength && typeof sanitizedValue === 'string') {
      const result = validateField.minLength(sanitizedValue, rules.minLength, fieldName);
      if (!result.isValid) {
        errors.push(result.error!);
      }
    }

    // Max length validation
    if (rules.maxLength && typeof sanitizedValue === 'string') {
      const result = validateField.maxLength(sanitizedValue, rules.maxLength, fieldName);
      if (!result.isValid) {
        errors.push(result.error!);
      }
    }

    // Pattern validation
    if (rules.pattern && typeof sanitizedValue === 'string') {
      if (!rules.pattern.test(sanitizedValue)) {
        errors.push(`${fieldName} formatı geçersiz`);
      }
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(sanitizedValue);
      if (!result.isValid) {
        errors.push(result.error!);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Common validation schemas
 */
export const VALIDATION_SCHEMAS = {
  donation: {
    donor_name: {
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    donor_email: {
      pattern: VALIDATION_PATTERNS.email,
    },
    donor_phone: {
      pattern: VALIDATION_PATTERNS.phone,
    },
    amount: {
      required: true,
      custom: (value: string | number) => validateField.positiveNumber(value, 'Miktar'),
    },
    description: {
      maxLength: 1000,
    },
  } as ValidationSchema,

  member: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    email: {
      required: true,
      pattern: VALIDATION_PATTERNS.email,
    },
    phone: {
      pattern: VALIDATION_PATTERNS.phone,
    },
    address: {
      maxLength: 500,
    },
    annual_fee: {
      custom: (value: string | number) => validateField.number(value, 0, undefined, 'Yıllık Aidat'),
    },
  } as ValidationSchema,

  beneficiary: {
    ad_soyad: {
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    kimlik_no: {
      required: true,
      custom: (value: string) => validateField.tcKimlik(value),
    },
    telefon_no: {
      pattern: VALIDATION_PATTERNS.phone,
    },
    email: {
      pattern: VALIDATION_PATTERNS.email,
    },
    adres: {
      maxLength: 500,
    },
    toplam_tutar: {
      custom: (value: string | number) => validateField.number(value, 0, undefined, 'Toplam Tutar'),
    },
    iban: {
      custom: (value: string) => validateField.iban(value),
    },
  } as ValidationSchema,
};

/**
 * Simple email validation (for backward compatibility)
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate Turkish phone number (for backward compatibility)
 */
export function validateTurkishPhone(phone: string): boolean {
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate TC Kimlik No (for backward compatibility)
 */
export function validateTCKimlik(tcNo: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(tcNo)) return false;

  const digits = tcNo.split('').map(Number);
  const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];

  return (sum1 * 7 - sum2) % 10 === digits[9];
}

/**
 * File upload validation (for backward compatibility)
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'Dosya boyutu çok büyük' };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Desteklenmeyen dosya türü' };
  }

  return { isValid: true };
}
