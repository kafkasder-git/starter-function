// Comprehensive validation utilities for forms and data
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+90|0)?[5][0-9]{9}$/,
  tcKimlik: /^[1-9][0-9]{10}$/,
  iban: /^TR[0-9]{2}[0-9]{4}[0-9]{16}$/,
  postalCode: /^[0-9]{5}$/,
  url: /^https?:\/\/.+/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Sanitization functions
export const sanitizeInput = {
  // Remove HTML tags and dangerous characters
  html: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim();
  },

  // Sanitize for database storage
  database: (input: string): string => {
    return input
      .replace(/['";\\]/g, '') // Remove SQL injection characters
      .replace(/\0/g, '') // Remove null bytes
      .trim();
  },

  // Sanitize phone numbers
  phone: (input: string): string => {
    return input.replace(/[^\d+]/g, '');
  },

  // Sanitize numbers
  number: (input: string): string => {
    return input.replace(/[^\d.,]/g, '');
  },

  // Sanitize email
  email: (input: string): string => {
    return input.toLowerCase().trim();
  },
};

// Field validation functions
export const validateField = {
  required: (
    value: string | number | undefined | null,
    fieldName: string,
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
    fieldName?: string,
  ): FieldValidationResult => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `${fieldName || 'Değer'} geçerli bir sayı olmalıdır`,
      };
    }

    if (min !== undefined && numValue < min) {
      return {
        isValid: false,
        error: `${fieldName || 'Değer'} en az ${min} olmalıdır`,
      };
    }

    if (max !== undefined && numValue > max) {
      return {
        isValid: false,
        error: `${fieldName || 'Değer'} en fazla ${max} olabilir`,
      };
    }

    return { isValid: true };
  },

  positiveNumber: (value: string | number, fieldName?: string): FieldValidationResult => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue) || numValue <= 0) {
      return {
        isValid: false,
        error: `${fieldName || 'Değer'} pozitif bir sayı olmalıdır`,
      };
    }

    return { isValid: true };
  },

  date: (value: string, fieldName?: string): FieldValidationResult => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: `${fieldName || 'Tarih'} geçerli bir tarih olmalıdır`,
      };
    }
    return { isValid: true };
  },

  futureDate: (value: string, fieldName?: string): FieldValidationResult => {
    const date = new Date(value);
    const now = new Date();

    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: `${fieldName || 'Tarih'} geçerli bir tarih olmalıdır`,
      };
    }

    if (date <= now) {
      return {
        isValid: false,
        error: `${fieldName || 'Tarih'} gelecek bir tarih olmalıdır`,
      };
    }

    return { isValid: true };
  },

  pastDate: (value: string, fieldName?: string): FieldValidationResult => {
    const date = new Date(value);
    const now = new Date();

    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: `${fieldName || 'Tarih'} geçerli bir tarih olmalıdır`,
      };
    }

    if (date >= now) {
      return {
        isValid: false,
        error: `${fieldName || 'Tarih'} geçmiş bir tarih olmalıdır`,
      };
    }

    return { isValid: true };
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
        error: `${fieldName || 'Değer'} geçerli seçeneklerden biri olmalıdır`,
      };
    }
    return { isValid: true };
  },
};

// Form validation schemas
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

export const validateForm = (
  data: Record<string, string | number | boolean>,
  schema: ValidationSchema,
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
        fieldName,
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

// Common validation schemas
export const VALIDATION_SCHEMAS = {
  donation: {
    donor_name: {
      required: true,
      minLength: 2,
      maxLength: 255,
      sanitize: sanitizeInput.html,
    },
    donor_email: {
      pattern: VALIDATION_PATTERNS.email,
      sanitize: sanitizeInput.email,
    },
    donor_phone: {
      pattern: VALIDATION_PATTERNS.phone,
      sanitize: sanitizeInput.phone,
    },
    amount: {
      required: true,
      custom: (value: string | number) => validateField.positiveNumber(value, 'Miktar'),
    },
    description: {
      maxLength: 1000,
      sanitize: sanitizeInput.html,
    },
  } as ValidationSchema,

  member: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 255,
      sanitize: sanitizeInput.html,
    },
    email: {
      required: true,
      pattern: VALIDATION_PATTERNS.email,
      sanitize: sanitizeInput.email,
    },
    phone: {
      pattern: VALIDATION_PATTERNS.phone,
      sanitize: sanitizeInput.phone,
    },
    address: {
      maxLength: 500,
      sanitize: sanitizeInput.html,
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
      sanitize: sanitizeInput.html,
    },
    kimlik_no: {
      required: true,
      custom: (value: string) => validateField.tcKimlik(value),
    },
    telefon_no: {
      pattern: VALIDATION_PATTERNS.phone,
      sanitize: sanitizeInput.phone,
    },
    email: {
      pattern: VALIDATION_PATTERNS.email,
      sanitize: sanitizeInput.email,
    },
    adres: {
      maxLength: 500,
      sanitize: sanitizeInput.html,
    },
    toplam_tutar: {
      custom: (value: string | number) => validateField.number(value, 0, undefined, 'Toplam Tutar'),
    },
    iban: {
      custom: (value: string) => validateField.iban(value),
    },
  } as ValidationSchema,
};

// Rate limiting for API calls
export class RateLimiter {
  private readonly requests = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter((time) => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// XSS Protection
export const xssProtection = {
  escape: (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  strip: (input: string): string => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },
};

// CSRF Protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken;
};
