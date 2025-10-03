export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  tcKimlik?: boolean;
  numeric?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => ValidationResult | boolean | string;
  dependencies?: string[]; // Other fields this field depends on
}

export type FormValidationSchema = Record<string, FieldValidationRule>;

export interface FormFieldState {
  value: any;
  touched: boolean;
  dirty: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  isValidating: boolean;
  lastValidated: Date | null;
}

export interface FormState {
  fields: Record<string, FormFieldState>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  isDirty: boolean;
  isValidated: boolean;
}

// Validation rules presets for common Turkish data
export const ValidationRules = {
  required: (message = 'Bu alan zorunludur'): FieldValidationRule => ({
    required: true,
    custom: (value) => (!value || value.toString().trim() === '' ? message : true),
  }),

  email: (message = 'Geçerli bir e-posta adresi girin'): FieldValidationRule => ({
    email: true,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    custom: (value) => {
      if (!value) return true;
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) || message;
    },
  }),

  phone: (message = 'Geçerli bir telefon numarası girin'): FieldValidationRule => ({
    phone: true,
    pattern: /^(\+90|0)?5[0-9]{9}$/,
    custom: (value) => {
      if (!value) return true;
      const cleaned = value.replace(/\D/g, '');
      const phoneRegex = /^(90)?5[0-9]{9}$/;
      return phoneRegex.test(cleaned) || message;
    },
  }),

  tcKimlik: (message = 'Geçerli bir T.C. Kimlik numarası girin'): FieldValidationRule => ({
    tcKimlik: true,
    pattern: /^[1-9][0-9]{10}$/,
    custom: (value) => {
      if (!value) return true;
      if (!/^[1-9][0-9]{10}$/.test(value)) return message;

      // T.C. Kimlik algorithm validation
      const digits = value.split('').map(Number);
      const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
      const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
      const check1 = (sum1 * 7 - sum2) % 10;
      const check2 = (sum1 + sum2 + check1) % 10;

      return (check1 === digits[9] && check2 === digits[10]) || message;
    },
  }),

  minLength: (min: number, message?: string): FieldValidationRule => ({
    minLength: min,
    custom: (value) => {
      if (!value) return true;
      return value.toString().length >= min || message || `En az ${min} karakter olmalıdır`;
    },
  }),

  maxLength: (max: number, message?: string): FieldValidationRule => ({
    maxLength: max,
    custom: (value) => {
      if (!value) return true;
      return value.toString().length <= max || message || `En fazla ${max} karakter olabilir`;
    },
  }),

  numeric: (message = 'Sadece sayı girebilirsiniz'): FieldValidationRule => ({
    numeric: true,
    pattern: /^\d+$/,
    custom: (value) => {
      if (!value) return true;
      return /^\d+$/.test(value.toString()) ?? message;
    },
  }),

  decimal: (message = 'Geçerli bir sayı girin'): FieldValidationRule => ({
    pattern: /^[0-9]{1,15}(?:\.[0-9]{1,2})?$/,
    custom: (value) => {
      if (!value) return true;
      const decimalRegex = /^[0-9]{1,15}(?:\.[0-9]{1,2})?$/;
      return decimalRegex.test(value.toString()) ?? message;
    },
  }),

  money: (message = 'Geçerli bir tutar girin'): FieldValidationRule => ({
    pattern: /^[0-9]{1,15}(?:\.[0-9]{1,2})?$/,
    custom: (value) => {
      if (!value) return true;
      const moneyRegex = /^[0-9]{1,15}(?:\.[0-9]{1,2})?$/;
      const numValue = parseFloat(value.toString());
      return (moneyRegex.test(value.toString()) && !isNaN(numValue) && numValue >= 0) ?? message;
    },
  }),

  range: (min: number, max: number, message?: string): FieldValidationRule => ({
    min,
    max,
    custom: (value) => {
      if (!value) return true;
      const numValue = parseFloat(value.toString());
      if (isNaN(numValue)) return 'Geçerli bir sayı girin';
      return (
        (numValue >= min && numValue <= max) ??
        message ??
        `${min} ile ${max} arasında bir değer girin`
      );
    },
  }),

  dateAfter: (afterDate: Date, message?: string): FieldValidationRule => ({
    custom: (value) => {
      if (!value) return true;
      const inputDate = new Date(value);
      return (
        inputDate > afterDate ??
        message ??
        `${afterDate.toLocaleDateString('tr-TR')} tarihinden sonra olmalıdır`
      );
    },
  }),

  dateBefore: (beforeDate: Date, message?: string): FieldValidationRule => ({
    custom: (value) => {
      if (!value) return true;
      const inputDate = new Date(value);
      return (
        inputDate < beforeDate ??
        message ??
        `${beforeDate.toLocaleDateString('tr-TR')} tarihinden önce olmalıdır`
      );
    },
  }),

  matchField: (fieldName: string, message?: string): FieldValidationRule => ({
    dependencies: [fieldName],
    custom: (value: any, formData?: Record<string, any>) => {
      if (!value) return true;
      return value === formData?.[fieldName] || message || 'Alanlar eşleşmiyor';
    },
  }),

  // Turkish specific validations
  iban: (message = 'Geçerli bir IBAN numarası girin'): FieldValidationRule => ({
    pattern: /^TR\d{2}\d{4}\d{4}\d{4}\d{4}\d{4}\d{2}$/,
    custom: (value) => {
      if (!value) return true;
      const cleaned = value.replace(/\s/g, '').toUpperCase();
      return /^TR\d{24}$/.test(cleaned) || message;
    },
  }),

  vergiNo: (message = 'Geçerli bir vergi numarası girin'): FieldValidationRule => ({
    pattern: /^\d{10}$/,
    custom: (value) => {
      if (!value) return true;
      return /^\d{10}$/.test(value) || message;
    },
  }),
};

// Form schemas for different entities
export const FormSchemas = {
  member: {
    firstName: ValidationRules.required('Ad alanı zorunludur'),
    lastName: ValidationRules.required('Soyad alanı zorunludur'),
    email: ValidationRules.email(),
    phone: ValidationRules.phone(),
    tcKimlik: ValidationRules.tcKimlik(),
    address: ValidationRules.required('Adres alanı zorunludur'),
  },

  donation: {
    donorName: ValidationRules.required('Bağışçı adı zorunludur'),
    amount: ValidationRules.money('Geçerli bir tutar girin'),
    donationType: ValidationRules.required('Bağış türü seçin'),
    date: ValidationRules.required('Tarih seçin'),
  },

  aidApplication: {
    applicantName: ValidationRules.required('Başvuru sahibi adı zorunludur'),
    tcKimlik: ValidationRules.tcKimlik(),
    phone: ValidationRules.phone(),
    aidType: ValidationRules.required('Yardım türü seçin'),
    description: ValidationRules.required('Açıklama yazın'),
    requestedAmount: ValidationRules.money('Geçerli bir tutar girin'),
  },

  login: {
    email: ValidationRules.email('Geçerli bir e-posta adresi girin'),
    password: ValidationRules.required('Şifre zorunludur'),
  },

  profile: {
    name: ValidationRules.required('Ad zorunludur'),
    email: ValidationRules.email(),
    currentPassword: ValidationRules.required('Mevcut şifre zorunludur'),
    newPassword: ValidationRules.minLength(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: ValidationRules.matchField('newPassword', 'Şifreler eşleşmiyor'),
  },
};
