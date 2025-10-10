/**
 * @fileoverview SmartMobileForm Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import {
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  Calendar,
  Phone,
  Mail,
  User,
  Building,
  Hash,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useMobileForm } from '../../hooks/useMobileForm';
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';

import { logger } from '../../lib/logging/logger';
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'password' | 'date' | 'select' | 'textarea' | 'file';
  placeholder?: string;
  required?: boolean;
  validation?: any;
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal';
  autoComplete?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

interface SmartMobileFormProps {
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
  successMessage?: string;
  className?: string;
  showProgress?: boolean;
}

const fieldIcons = {
  text: User,
  email: Mail,
  tel: Phone,
  number: Hash,
  password: Eye,
  date: Calendar,
  select: Building,
  textarea: Building,
  file: Camera,
};

/**
 * SmartMobileForm function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function SmartMobileForm({
  title,
  description,
  fields,
  onSubmit,
  submitLabel = 'Kaydet',
  successMessage = 'Form başarıyla gönderildi!',
  className = '',
  showProgress = true,
}: SmartMobileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    trigger,
  } = useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { triggerHapticFeedback, deviceInfo } = useAdvancedMobile();
  const { adjustViewportForKeyboard, enableFormOptimizations, preventZoom } = useMobileForm({
    enableHapticFeedback: true,
    enableKeyboardDetection: true,
  });

  const formRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<string, HTMLElement>>({});

  // Mobil optimizasyonları
  useEffect(() => {
    enableFormOptimizations();
    preventZoom();
  }, [enableFormOptimizations, preventZoom]);

  // Form alanlarını gruplara böl (mobilde her seferinde 2-3 alan göster)
  const fieldsPerStep = deviceInfo.isMobile ? 2 : fields.length; // Mobilde daha az alan
  const totalSteps = Math.ceil(fields.length / fieldsPerStep);
  const currentFields = fields.slice(
    currentStep * fieldsPerStep,
    (currentStep + 1) * fieldsPerStep,
  );

  // Mobilde daha akıllı alan gruplama
  const smartFieldGrouping = React.useMemo(() => {
    if (!deviceInfo.isMobile) return { fieldsPerStep: fields.length, totalSteps: 1 };

    // İlgili alanları grupla
    const groups = [];
    let currentGroup = [];

    fields.forEach((field, index) => {
      currentGroup.push(field);

      // Grup tamamlandı mı kontrol et
      if (
        currentGroup.length >= 2 ||
        field.type === 'textarea' ||
        field.type === 'file' ||
        index === fields.length - 1
      ) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
    });

    return {
      groups,
      totalSteps: groups.length,
      currentFields: groups[currentStep] || [],
    };
  }, [fields, currentStep, deviceInfo.isMobile]);

  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    if (deviceInfo.isMobile) {
      adjustViewportForKeyboard();
      triggerHapticFeedback('light');
    }
  };

  const handleFieldBlur = async (fieldName: string) => {
    setFocusedField(null);
    // Validate field on blur
    await trigger(fieldName);
  };

  const handleNextStep = async () => {
    // Validate current step fields
    const fieldsToValidate = deviceInfo.isMobile
      ? smartFieldGrouping.currentFields.map((f) => f.name)
      : currentFields.map((f) => f.name);

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      const maxSteps = deviceInfo.isMobile ? smartFieldGrouping.totalSteps : totalSteps;
      if (currentStep < maxSteps - 1) {
        setCurrentStep((prev) => prev + 1);
        triggerHapticFeedback('medium');

        // Mobilde sonraki alanı otomatik focus et
        if (deviceInfo.isMobile && currentStep + 1 < maxSteps) {
          setTimeout(() => {
            const nextFields = deviceInfo.isMobile
              ? smartFieldGrouping.groups[currentStep + 1]
              : fields.slice((currentStep + 1) * fieldsPerStep, (currentStep + 2) * fieldsPerStep);

            if (nextFields.length > 0) {
              const nextFieldElement = fieldRefs.current[nextFields[0].name];
              if (nextFieldElement) {
                nextFieldElement.focus();
              }
            }
          }, 300);
        }
      }
    } else {
      triggerHapticFeedback('error');

      // İlk hatalı alana scroll et
      const firstErrorField = fieldsToValidate.find((fieldName) => errors[fieldName]);
      if (firstErrorField) {
        const errorElement = fieldRefs.current[firstErrorField];
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      triggerHapticFeedback('light');
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      setSubmitSuccess(true);
      triggerHapticFeedback('success');

      // Success animasyonundan sonra formu reset et
      setTimeout(() => {
        reset();
        setCurrentStep(0);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      triggerHapticFeedback('error');
      logger.error('Form submission error:', error);
    }
  };

  const renderField = (field: FormField) => {
    const IconComponent = field.icon ? () => field.icon : fieldIcons[field.type];
    const hasError = errors[field.name];
    const isFocused = focusedField === field.name;
    const fieldValue = watch(field.name);

    return (
      <motion.div
        key={field.name}
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>

        <div className="relative">
          <div
            className={`flex items-center rounded-lg border-2 transition-all duration-200 ${
              hasError
                ? 'border-red-300 bg-red-50'
                : isFocused
                  ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-500/10'
                  : 'border-gray-200 bg-white'
            } `}
          >
            {IconComponent && (
              <div
                className={`pl-3 ${hasError ? 'text-red-400' : isFocused ? 'text-blue-500' : 'text-gray-400'}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
            )}

            {field.type === 'select' ? (
              <select
                {...register(field.name, field.validation)}
                ref={(el) => {
                  if (el) fieldRefs.current[field.name] = el;
                }}
                className="w-full appearance-none border-none bg-transparent p-4 text-base outline-none"
                onFocus={() => {
                  handleFieldFocus(field.name);
                }}
                onBlur={() => handleFieldBlur(field.name)}
              >
                <option value="">{field.placeholder ?? 'Seçiniz...'}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                {...register(field.name, field.validation)}
                ref={(el) => {
                  if (el) fieldRefs.current[field.name] = el;
                }}
                placeholder={field.placeholder}
                className="min-h-[100px] w-full resize-none border-none bg-transparent p-4 text-base outline-none"
                onFocus={() => {
                  handleFieldFocus(field.name);
                }}
                onBlur={() => handleFieldBlur(field.name)}
              />
            ) : field.type === 'file' ? (
              <div className="w-full p-4">
                <input
                  {...register(field.name, field.validation)}
                  ref={(el) => {
                    if (el) fieldRefs.current[field.name] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                  onFocus={() => {
                    handleFieldFocus(field.name);
                  }}
                  onBlur={() => handleFieldBlur(field.name)}
                />
              </div>
            ) : (
              <input
                {...register(field.name, field.validation)}
                ref={(el) => {
                  if (el) fieldRefs.current[field.name] = el;
                }}
                type={field.type === 'password' && showPassword[field.name] ? 'text' : field.type}
                placeholder={field.placeholder}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
                pattern={field.pattern}
                minLength={field.minLength}
                maxLength={field.maxLength}
                className="w-full border-none bg-transparent p-4 text-base outline-none"
                onFocus={() => {
                  handleFieldFocus(field.name);
                }}
                onBlur={() => handleFieldBlur(field.name)}
              />
            )}

            {field.type === 'password' && (
              <button
                type="button"
                className="pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowPassword((prev) => ({
                    ...prev,
                    [field.name]: !prev[field.name],
                  }));
                }}
              >
                {showPassword[field.name] ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}

            {fieldValue && !hasError && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="pr-3 text-green-500"
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
            )}
          </div>

          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 flex items-center gap-2 text-red-600"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{errors[field.name]?.message}</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-4 p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle className="h-8 w-8 text-green-600" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-semibold text-green-800"
        >
          Başarılı!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-600"
        >
          {successMessage}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className={`mx-auto w-full max-w-md ${className}`} ref={formRef}>
      <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-xl font-semibold text-gray-900">{title}</CardTitle>
          {description && <p className="text-center text-sm text-gray-600">{description}</p>}

          {showProgress && totalSteps > 1 && (
            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Adım {currentStep + 1} / {totalSteps}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <motion.div
                  className="h-2 rounded-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {(deviceInfo.isMobile ? smartFieldGrouping.currentFields : currentFields).map(
                  renderField,
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="h-12 flex-1 text-base font-medium"
                >
                  Geri
                </Button>
              )}

              {currentStep <
              (deviceInfo.isMobile ? smartFieldGrouping.totalSteps : totalSteps) - 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="h-12 flex-1 bg-blue-600 text-base font-medium hover:bg-blue-700"
                >
                  İleri
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 flex-1 bg-green-600 text-base font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Gönderiliyor...
                    </div>
                  ) : (
                    submitLabel
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SmartMobileForm;
