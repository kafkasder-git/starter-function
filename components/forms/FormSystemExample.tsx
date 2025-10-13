/**
 * @fileoverview FormSystemExample Component - Demonstrates the enhanced form system
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, FileText, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  FormSection,
  FormStepper,
  FormStepperProgress,
  FormField,
  DependentFormField,
  DependencyConditions,
  FormProvider,
} from './index';
import type { ValidationError } from '../../types/validation';

// Mock async validation function
const validateEmailAvailability = async (email: string): Promise<ValidationError[] | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock validation logic
  if (email === 'taken@example.com') {
    return [
      {
        field: 'email',
        message: 'This email is already taken',
        code: 'EMAIL_TAKEN',
        severity: 'error' as const,
      },
    ];
  }

  if (email.includes('invalid')) {
    return [
      {
        field: 'email',
        message: 'This email domain is not allowed',
        code: 'INVALID_DOMAIN',
        severity: 'error' as const,
      },
    ];
  }

  return null;
};

const validatePhoneNumber = async (phone: string): Promise<ValidationError[] | null> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Turkish phone number validation
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return [
      {
        field: 'phone',
        message: 'Please enter a valid Turkish phone number',
        code: 'INVALID_PHONE',
        severity: 'error' as const,
      },
    ];
  }

  return null;
};

export const FormSystemExample: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',

    // Address Information
    hasAddress: false,
    street: '',
    city: '',
    postalCode: '',

    // Additional Information
    contactMethod: '',
    otherContactMethod: '',
    hasSpecialNeeds: false,
    specialNeeds: '',

    // Payment Information
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const steps = [
    {
      label: 'Kişisel Bilgiler',
      description: 'Temel bilgilerinizi girin',
      icon: <User className="w-4 h-4" />,
    },
    {
      label: 'İletişim',
      description: 'İletişim bilgilerinizi girin',
      icon: <Mail className="w-4 h-4" />,
    },
    {
      label: 'Adres',
      description: 'Adres bilgilerinizi girin',
      icon: <MapPin className="w-4 h-4" />,
      optional: true,
    },
    {
      label: 'Ödeme',
      description: 'Ödeme bilgilerinizi girin',
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async () => {
    // console.log('Form submitted:', values);
    // Handle form submission
  };

  const formSchema = {
    firstName: { required: true, minLength: 2 },
    lastName: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { required: true },
    street: { required: true },
    city: { required: true },
    postalCode: { required: true },
    otherContactMethod: { required: true },
    specialNeeds: { required: true },
    cardNumber: { required: true },
    expiryDate: { required: true },
    cvv: { required: true },
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Enhanced Form System Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating FormSection, FormStepper, async validation, and field dependencies
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="p-6">
        <div className="space-y-4">
          <FormStepperProgress totalSteps={steps.length} currentStep={currentStep} />
          <FormStepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            orientation="horizontal"
            showStepNumbers={true}
            clickable={true}
          />
        </div>
      </Card>

      {/* Form */}
      <FormProvider
        schema={formSchema}
        initialValues={formData}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        <div className="space-y-6">
          {/* Step 0: Personal Information */}
          {currentStep === 0 && (
            <FormSection
              title="Kişisel Bilgiler"
              description="Temel kişisel bilgilerinizi girin"
              icon={<User className="w-5 h-5" />}
              required={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="firstName"
                  name="firstName"
                  label="Ad"
                  placeholder="Adınızı girin"
                  value={formData.firstName}
                  onChange={(value) => {
                    handleFieldChange('firstName', value);
                  }}
                  required={true}
                />

                <FormField
                  id="lastName"
                  name="lastName"
                  label="Soyad"
                  placeholder="Soyadınızı girin"
                  value={formData.lastName}
                  onChange={(value) => {
                    handleFieldChange('lastName', value);
                  }}
                  required={true}
                />
              </div>
            </FormSection>
          )}

          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <FormSection
                title="İletişim Bilgileri"
                description="E-posta ve telefon bilgilerinizi girin"
                icon={<Mail className="w-5 h-5" />}
                collapsible={true}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  <FormField
                    id="email"
                    name="email"
                    label="E-posta"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(value) => {
                      handleFieldChange('email', value);
                    }}
                    required={true}
                    asyncValidator={validateEmailAvailability}
                    validationDelay={500}
                    description="E-posta adresiniz doğrulanacaktır"
                  />

                  <FormField
                    id="phone"
                    name="phone"
                    label="Telefon"
                    type="tel"
                    placeholder="0555 123 45 67"
                    value={formData.phone}
                    onChange={(value) => {
                      handleFieldChange('phone', value);
                    }}
                    required={true}
                    asyncValidator={validatePhoneNumber}
                    validationDelay={800}
                    prefix={<Phone className="w-4 h-4" />}
                  />
                </div>
              </FormSection>

              <FormSection
                title="İletişim Tercihi"
                description="Nasıl iletişim kurmamızı tercih edersiniz?"
                icon={<Phone className="w-5 h-5" />}
                collapsible={true}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  <FormField
                    id="contactMethod"
                    name="contactMethod"
                    label="İletişim Yöntemi"
                    variant="select"
                    value={formData.contactMethod}
                    onChange={(value) => {
                      handleFieldChange('contactMethod', value);
                    }}
                    options={[
                      { value: 'email', label: 'E-posta' },
                      { value: 'phone', label: 'Telefon' },
                      { value: 'sms', label: 'SMS' },
                      { value: 'other', label: 'Diğer' },
                    ]}
                    required={true}
                  />

                  <DependentFormField
                    id="otherContactMethod"
                    name="otherContactMethod"
                    label="Diğer İletişim Yöntemi"
                    placeholder="Lütfen belirtin..."
                    value={formData.otherContactMethod}
                    onChange={(value) => {
                      handleFieldChange('otherContactMethod', value);
                    }}
                    dependsOn="contactMethod"
                    showWhen={DependencyConditions.equals('other')}
                    required={true}
                  />
                </div>
              </FormSection>
            </div>
          )}

          {/* Step 2: Address Information */}
          {currentStep === 2 && (
            <FormSection
              title="Adres Bilgileri"
              description="Adres bilgilerinizi girin (isteğe bağlı)"
              icon={<MapPin className="w-5 h-5" />}
              collapsible={true}
              defaultOpen={true}
            >
              <div className="space-y-4">
                <FormField
                  id="hasAddress"
                  name="hasAddress"
                  label="Adres bilgilerimi eklemek istiyorum"
                  variant="checkbox"
                  value={formData.hasAddress}
                  onChange={(value) => {
                    handleFieldChange('hasAddress', value);
                  }}
                />

                <DependentFormField
                  id="street"
                  name="street"
                  label="Sokak/Cadde"
                  placeholder="Sokak adı ve numarası"
                  value={formData.street}
                  onChange={(value) => {
                    handleFieldChange('street', value);
                  }}
                  dependsOn="hasAddress"
                  showWhen={DependencyConditions.equals(true)}
                  required={true}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DependentFormField
                    id="city"
                    name="city"
                    label="Şehir"
                    placeholder="Şehir seçin"
                    variant="select"
                    value={formData.city}
                    onChange={(value) => {
                      handleFieldChange('city', value);
                    }}
                    dependsOn="hasAddress"
                    showWhen={DependencyConditions.equals(true)}
                    options={[
                      { value: 'istanbul', label: 'İstanbul' },
                      { value: 'ankara', label: 'Ankara' },
                      { value: 'izmir', label: 'İzmir' },
                      { value: 'bursa', label: 'Bursa' },
                    ]}
                    required={true}
                  />

                  <DependentFormField
                    id="postalCode"
                    name="postalCode"
                    label="Posta Kodu"
                    placeholder="34000"
                    value={formData.postalCode}
                    onChange={(value) => {
                      handleFieldChange('postalCode', value);
                    }}
                    dependsOn="hasAddress"
                    showWhen={DependencyConditions.equals(true)}
                    required={true}
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Step 3: Payment Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <FormSection
                title="Ödeme Bilgileri"
                description="Ödeme yönteminizi seçin"
                icon={<CreditCard className="w-5 h-5" />}
              >
                <div className="space-y-4">
                  <FormField
                    id="paymentMethod"
                    name="paymentMethod"
                    label="Ödeme Yöntemi"
                    variant="radio"
                    value={formData.paymentMethod}
                    onChange={(value) => {
                      handleFieldChange('paymentMethod', value);
                    }}
                    options={[
                      { value: 'credit', label: 'Kredi Kartı' },
                      { value: 'debit', label: 'Banka Kartı' },
                      { value: 'transfer', label: 'Banka Havalesi' },
                    ]}
                    required={true}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Kart Bilgileri"
                description="Kart bilgilerinizi güvenli bir şekilde girin"
                icon={<CreditCard className="w-5 h-5" />}
                collapsible={true}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  <DependentFormField
                    id="cardNumber"
                    name="cardNumber"
                    label="Kart Numarası"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(value) => {
                      handleFieldChange('cardNumber', value);
                    }}
                    dependsOn="paymentMethod"
                    showWhen={DependencyConditions.oneOf(['credit', 'debit'])}
                    required={true}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <DependentFormField
                      id="expiryDate"
                      name="expiryDate"
                      label="Son Kullanma"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(value) => {
                        handleFieldChange('expiryDate', value);
                      }}
                      dependsOn="paymentMethod"
                      showWhen={DependencyConditions.oneOf(['credit', 'debit'])}
                      required={true}
                    />

                    <DependentFormField
                      id="cvv"
                      name="cvv"
                      label="CVV"
                      placeholder="123"
                      type="password"
                      value={formData.cvv}
                      onChange={(value) => {
                        handleFieldChange('cvv', value);
                      }}
                      dependsOn="paymentMethod"
                      showWhen={DependencyConditions.oneOf(['credit', 'debit'])}
                      required={true}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Özel İhtiyaçlar"
                description="Herhangi bir özel ihtiyacınız var mı?"
                icon={<FileText className="w-5 h-5" />}
                collapsible={true}
                defaultOpen={false}
              >
                <div className="space-y-4">
                  <FormField
                    id="hasSpecialNeeds"
                    name="hasSpecialNeeds"
                    label="Özel ihtiyaçlarım var"
                    variant="switch"
                    value={formData.hasSpecialNeeds}
                    onChange={(value) => {
                      handleFieldChange('hasSpecialNeeds', value);
                    }}
                  />

                  <DependentFormField
                    id="specialNeeds"
                    name="specialNeeds"
                    label="Özel İhtiyaçlar"
                    variant="textarea"
                    placeholder="Lütfen özel ihtiyaçlarınızı belirtin..."
                    rows={4}
                    value={formData.specialNeeds}
                    onChange={(value) => {
                      handleFieldChange('specialNeeds', value);
                    }}
                    dependsOn="hasSpecialNeeds"
                    showWhen={DependencyConditions.equals(true)}
                    required={true}
                  />
                </div>
              </FormSection>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(Math.max(0, currentStep - 1));
              }}
              disabled={currentStep === 0}
            >
              Önceki
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => {
                    setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                  }}
                >
                  Sonraki
                </Button>
              ) : (
                <Button type="submit">Gönder</Button>
              )}
            </div>
          </div>
        </div>
      </FormProvider>
    </div>
  );
};
