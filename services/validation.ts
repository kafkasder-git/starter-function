/**
 * @fileoverview validation Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { z } from 'zod';
import { ServiceError, ServiceErrorCode } from './config';

// Common validation schemas
export const commonSchemas = {
  id: z.string().min(1, 'ID gereklidir'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z.string().regex(/^05\d{9}$/, 'Geçerli bir telefon numarası giriniz'),
  nationalId: z.string().regex(/^\d{11}$/, 'TC kimlik numarası 11 haneli olmalıdır'),
  amount: z.number().min(0, 'Tutar negatif olamaz'),
  dateString: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Geçerli bir tarih formatı giriniz'),
  pagination: z.object({
    page: z.number().min(1, "Sayfa numarası 1'den küçük olamaz"),
    pageSize: z.number().min(1).max(100, 'Sayfa boyutu 1-100 arasında olmalıdır'),
  }),
};

// Donation validation schemas
export const donationSchemas = {
  create: z.object({
    donor_name: z.string().min(2, 'Bağışçı adı en az 2 karakter olmalıdır'),
    donor_email: commonSchemas.email.optional(),
    donor_phone: commonSchemas.phone.optional(),
    amount: commonSchemas.amount.optional(),
    donation_type: z.enum(['cash', 'in_kind', 'service', 'recurring', 'campaign']),
    currency: z.string().default('TRY'),
    donation_date: commonSchemas.dateString.optional(),
    is_anonymous: z.boolean().default(false),
    is_recurring: z.boolean().default(false),
  }),

  update: z.object({
    donor_name: z.string().min(2).optional(),
    donor_email: commonSchemas.email.optional(),
    donor_phone: commonSchemas.phone.optional(),
    amount: commonSchemas.amount.optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'refunded']).optional(),
  }),
};

// Member validation schemas
export const memberSchemas = {
  create: z.object({
    national_id: commonSchemas.nationalId,
    full_name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional(),
    birth_date: commonSchemas.dateString.optional(),
    membership_type: z.string().default('standard'),
  }),

  update: z.object({
    full_name: z.string().min(2).optional(),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'honorary']).optional(),
  }),
};

// Beneficiary validation schemas
export const beneficiarySchemas = {
  create: z.object({
    national_id: commonSchemas.nationalId,
    full_name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
    phone: commonSchemas.phone.optional(),
    email: commonSchemas.email.optional(),
    city: z.string().min(2, 'Şehir adı en az 2 karakter olmalıdır').optional(),
  }),

  update: z.object({
    full_name: z.string().min(2).optional(),
    phone: commonSchemas.phone.optional(),
    email: commonSchemas.email.optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'archived']).optional(),
  }),
};

/**
 * ValidationService Service
 * 
 * Service class for handling validationservice operations
 * 
 * @class ValidationService
 */
export class ValidationService {
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
        throw new ServiceError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Validation failed: ${messages.join(', ')}`,
          { validationErrors: error.issues },
        );
      }
      throw error;
    }
  }

  static validateAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
    return Promise.resolve(this.validate(schema, data));
  }

  static safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = this.validate(schema, data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof ServiceError) {
        return { success: false, errors: [error.message] };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  static validateField<T>(
    schema: z.ZodSchema<T>,
    fieldName: string,
    value: unknown,
  ): { isValid: boolean; error?: string } {
    try {
      schema.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues[0]?.message ?? 'Invalid value';
        return { isValid: false, error: `${fieldName}: ${message}` };
      }
      return { isValid: false, error: `${fieldName}: Validation failed` };
    }
  }
}

// Helper functions for backward compatibility
/**
 * validateWithSchema function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { isValid: boolean; errors: string[] } {
  try {
    ValidationService.validate(schema, data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { isValid: false, errors: [error.message] };
    }
    return { isValid: false, errors: ['Validation failed'] };
  }
}

// Specific validation functions
/**
 * isValidBeneficiary function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function isValidBeneficiary(data: unknown): boolean {
  return validateWithSchema(beneficiarySchemas.create, data).isValid;
}

/**
 * isValidMember function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function isValidMember(data: unknown): boolean {
  return validateWithSchema(memberSchemas.create, data).isValid;
}

/**
 * isValidDonation function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function isValidDonation(data: unknown): boolean {
  return validateWithSchema(donationSchemas.create, data).isValid;
}

// Export schemas for external use
export const BeneficiarySchema = beneficiarySchemas.create;
export const MemberSchema = memberSchemas.create;
export const DonationSchema = donationSchemas.create;
