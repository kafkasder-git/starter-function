/**
 * @fileoverview KumbaraForm Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// 🏦 KUMBARA FORM COMPONENT
// Enhanced form with React Hook Form + Zod validation

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2, MapPin, Phone, Save, User, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { KumbaraInsert, KumbaraStatus, KumbaraUpdate } from '../../types/kumbara';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

import { logger } from '../../lib/logging/logger';
// Enhanced Zod validation schemas with TypeScript best practices
const TURKISH_NAME_REGEX = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
const TURKISH_PHONE_REGEX = /^(\+90|0)?[5][0-9]{9}$/;

const coordinatesSchema = z
  .object({
    lat: z
      .number()
      .min(-90, 'Enlem -90 ile 90 arasında olmalıdır')
      .max(90, 'Enlem -90 ile 90 arasında olmalıdır'),
    lng: z
      .number()
      .min(-180, 'Boylam -180 ile 180 arasında olmalıdır')
      .max(180, 'Boylam -180 ile 180 arasında olmalıdır'),
  })
  .strict();

const kumbaraSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Kumbara adı en az 3 karakter olmalıdır')
      .max(100, 'Kumbara adı en fazla 100 karakter olabilir')
      .regex(TURKISH_NAME_REGEX, 'Kumbara adı sadece harf ve boşluk içerebilir'),

    location: z
      .string()
      .trim()
      .min(3, 'Lokasyon en az 3 karakter olmalıdır')
      .max(100, 'Lokasyon en fazla 100 karakter olabilir'),

    address: z
      .string()
      .trim()
      .min(10, 'Adres en az 10 karakter olmalıdır')
      .max(250, 'Adres en fazla 250 karakter olabilir'),

    contactPerson: z
      .string()
      .trim()
      .min(2, 'İletişim kişisi adı en az 2 karakter olmalıdır')
      .max(50, 'İletişim kişisi adı en fazla 50 karakter olabilir')
      .regex(TURKISH_NAME_REGEX, 'İletişim kişisi adı sadece harf ve boşluk içerebilir')
      .optional()
      .or(z.literal('')),

    phone: z
      .string()
      .trim()
      .regex(TURKISH_PHONE_REGEX, 'Geçerli bir telefon numarası giriniz (05xxxxxxxxx)')
      .optional()
      .or(z.literal('')),

    notes: z
      .string()
      .trim()
      .max(500, 'Notlar en fazla 500 karakter olabilir')
      .optional()
      .or(z.literal('')),

    status: z
      .enum(['active', 'inactive', 'maintenance', 'damaged', 'removed'] as const)
      .optional()
      .default('active'),

    coordinates: coordinatesSchema.optional(),
  })
  .strict();

const collectionSchema = z.object({
  amount: z
    .number()
    .min(0.01, 'Tutar en az 0.01 TL olmalıdır')
    .max(50000, 'Tutar en fazla 50.000 TL olabilir'),

  collector_name: z
    .string()
    .min(2, 'Toplayıcı adı en az 2 karakter olmalıdır')
    .max(50, 'Toplayıcı adı en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Toplayıcı adı sadece harf ve boşluk içerebilir'),

  collection_date: z.string().min(1, 'Toplama tarihi seçilmelidir'),

  witness_name: z
    .string()
    .min(2, 'Tanık adı en az 2 karakter olmalıdır')
    .max(50, 'Tanık adı en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Tanık adı sadece harf ve boşluk içerebilir')
    .optional()
    .or(z.literal('')),

  witness_phone: z
    .string()
    .regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası giriniz')
    .optional()
    .or(z.literal('')),

  notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional().or(z.literal('')),

  weather_condition: z
    .string()
    .max(50, 'Hava durumu en fazla 50 karakter olabilir')
    .optional()
    .or(z.literal('')),

  collection_method: z.enum(['scheduled', 'emergency', 'maintenance'] as const).optional(),
});

// Type-safe form data types derived from Zod schemas
type KumbaraFormData = z.infer<typeof kumbaraSchema>;
type CollectionFormData = z.infer<typeof collectionSchema>;

// Enhanced component props with strict TypeScript typing
export type KumbaraFormMode = 'create' | 'edit';

/**
 * KumbaraFormProps Interface
 * 
 * @interface KumbaraFormProps
 */
export interface KumbaraFormProps {
  readonly mode: KumbaraFormMode;
  readonly initialData?: Partial<KumbaraFormData>;
  readonly onSubmit: (data: KumbaraInsert | KumbaraUpdate) => Promise<void>;
  readonly onCancel?: () => void;
  readonly loading?: boolean;
  readonly className?: string;
}

/**
 * CollectionFormProps Interface
 * 
 * @interface CollectionFormProps
 */
export interface CollectionFormProps {
  readonly kumbaraId: string;
  readonly kumbaraName: string;
  readonly onSubmit: (data: CollectionFormData) => Promise<void>;
  readonly onCancel?: () => void;
  readonly loading?: boolean;
  readonly className?: string;
}

/**
 * Kumbara Create/Edit Form Component
 */
/**
 * KumbaraForm function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function KumbaraForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  className = '',
}: KumbaraFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSuggestions] = useState<string[]>([
    'Merkez Camii',
    'Esnaf Lokantası',
    'Market',
    'Okul',
    'Hastane',
    'Belediye Binası',
    'AVM',
    'Kafe',
  ]);

  const form = useForm<KumbaraFormData>({
    resolver: zodResolver(kumbaraSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      location: initialData?.location ?? '',
      address: initialData?.address ?? '',
      contactPerson: initialData?.contactPerson ?? '',
      phone: initialData?.phone ?? '',
      notes: initialData?.notes ?? '',
      status: initialData?.status ?? 'active',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch: _watch,
  } = form;

  const handleFormSubmit = async (data: KumbaraFormData) => {
    try {
      setIsSubmitting(true);

      // Clean empty optional fields
      const cleanData = {
        ...data,
        contactPerson: data.contactPerson ?? undefined,
        phone: data.phone ?? undefined,
        notes: data.notes ?? undefined,
        created_by: 'current-user', // Replace with actual user ID
      };

      await onSubmit(cleanData);

      if (mode === 'create') {
        form.reset();
        toast.success('Kumbara başarıyla oluşturuldu');
      } else {
        toast.success('Kumbara başarıyla güncellendi');
      }
    } catch (error) {
      toast.error('İşlem sırasında bir hata oluştu');
      logger.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading ?? isSubmitting;

  return (
    <Card className={`border-0 shadow-xl bg-white/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {mode === 'create' ? 'Yeni Kumbara Ekle' : 'Kumbara Düzenle'}
        </CardTitle>
        <CardDescription className="text-slate-600 leading-relaxed">
          {mode === 'create'
            ? 'Yeni kumbara konumu ekleyin ve otomatik QR kod üretimi için gerekli bilgileri doldurun.'
            : 'Kumbara bilgilerini güncelleyin. Tüm alanlar isteğe bağlıdır.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-slate-700 font-semibold flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Kumbara Adı *
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Merkez Camii Kumbarası"
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                disabled={isLoading}
              />
              {errors.name && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">
                    {errors.name.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="location"
                className="text-slate-700 font-semibold flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Lokasyon *
              </Label>
              <Select
                onValueChange={(value: string) => {
                  setValue('location', value);
                }}
              >
                <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                  <SelectValue placeholder="Lokasyon seçin" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  {locationSuggestions.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                {...register('location')}
                placeholder="Veya manuel girin..."
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                disabled={isLoading}
              />
              {errors.location && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">
                    {errors.location.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <Label htmlFor="address" className="text-slate-700 font-semibold">
              Tam Adres *
            </Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Fatih Mah. Camii Sok. No:15 Fatih/İSTANBUL"
              rows={3}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl resize-none"
              disabled={isLoading}
            />
            {errors.address && (
              <Alert className="py-2 border-red-200 bg-red-50">
                <AlertDescription className="text-red-600 text-sm">
                  {errors.address.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="contactPerson"
                className="text-slate-700 font-semibold flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                İletişim Kişisi
              </Label>
              <Input
                id="contactPerson"
                {...register('contactPerson')}
                placeholder="Ahmet Öztürk"
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                disabled={isLoading}
              />
              {errors.contactPerson && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">
                    {errors.contactPerson.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="phone"
                className="text-slate-700 font-semibold flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Telefon
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="0532 123 45 67"
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                disabled={isLoading}
              />
              {errors.phone && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">
                    {errors.phone.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Status (for edit mode) */}
          {mode === 'edit' && (
            <div className="space-y-3">
              <Label className="text-slate-700 font-semibold">Durum</Label>
              <Select
                onValueChange={(value) => {
                  setValue('status', value as KumbaraStatus);
                }}
              >
                <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                  <SelectItem value="maintenance">Bakımda</SelectItem>
                  <SelectItem value="damaged">Hasarlı</SelectItem>
                  <SelectItem value="removed">Kaldırıldı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-slate-700 font-semibold">
              Notlar
            </Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Özel notlar, konumlandırma detayları..."
              rows={3}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl resize-none"
              disabled={isLoading}
            />
            {errors.notes && (
              <Alert className="py-2 border-red-200 bg-red-50">
                <AlertDescription className="text-red-600 text-sm">
                  {errors.notes.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-100">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-slate-200 hover:bg-slate-50 rounded-xl"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="w-5 h-5 mr-2" />
                İptal
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {mode === 'create' ? 'Kumbara Oluştur' : 'Değişiklikleri Kaydet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Collection Recording Form Component
 */
/**
 * CollectionForm function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function CollectionForm({
  kumbaraId,
  kumbaraName,
  onSubmit,
  onCancel,
  loading = false,
  className = '',
}: CollectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      amount: 0,
      collector_name: '',
      collection_date: new Date().toISOString().split('T')[0],
      witness_name: '',
      witness_phone: '',
      notes: '',
      weather_condition: '',
      collection_method: 'scheduled',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  const handleFormSubmit = async (data: CollectionFormData) => {
    try {
      setIsSubmitting(true);

      const submitData = {
        ...data,
        kumbara_id: kumbaraId,
        witness_name: data.witness_name ?? undefined,
        witness_phone: data.witness_phone ?? undefined,
        notes: data.notes ?? undefined,
        weather_condition: data.weather_condition ?? undefined,
        created_by: 'current-user', // Replace with actual user ID
      };

      await onSubmit(submitData);

      form.reset();
      toast.success('Toplama kaydı başarıyla oluşturuldu');
    } catch (error) {
      toast.error('Toplama kaydı oluşturulamadı');
      logger.error('Collection form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading ?? isSubmitting;

  return (
    <Card className={`border-0 shadow-xl bg-white/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          Kumbara Toplama Kaydı
        </CardTitle>
        <CardDescription className="text-slate-600 leading-relaxed">
          <strong>{kumbaraName}</strong> kumbarası için toplama kaydı oluşturun.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-slate-700 font-semibold">
                Toplanan Tutar (TL) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { valueAsNumber: true })}
                placeholder="125.50"
                className="h-11 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                disabled={isLoading}
              />
              {errors.amount && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">
                    {errors.amount.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="collection_date" className="text-slate-700 font-semibold">
                Toplama Tarihi *
              </Label>
              <Input
                id="collection_date"
                type="date"
                {...register('collection_date')}
                className="h-11 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                disabled={isLoading}
              />
              {errors.collection_date && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">
                    {errors.collection_date.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Collector Information */}
          <div className="space-y-3">
            <Label htmlFor="collector_name" className="text-slate-700 font-semibold">
              Toplayıcı Adı *
            </Label>
            <Input
              id="collector_name"
              {...register('collector_name')}
              placeholder="Ahmet Yılmaz"
              className="h-11 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
              disabled={isLoading}
            />
            {errors.collector_name && (
              <Alert className="py-2 border-red-200 bg-red-50">
                <AlertDescription className="text-red-600 text-sm">
                  {errors.collector_name.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Collection Method */}
          <div className="space-y-3">
            <Label className="text-slate-700 font-semibold">Toplama Türü</Label>
            <Select
              onValueChange={(value) => {
                setValue('collection_method', value as any);
              }}
            >
              <SelectTrigger className="h-11 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl">
                <SelectValue placeholder="Toplama türü seçin" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="scheduled">Planlı Toplama</SelectItem>
                <SelectItem value="emergency">Acil Toplama</SelectItem>
                <SelectItem value="maintenance">Bakım Toplama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Witness Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="witness_name" className="text-slate-700 font-semibold">
                Tanık Adı
              </Label>
              <Input
                id="witness_name"
                {...register('witness_name')}
                placeholder="Mehmet Demir"
                className="h-11 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                disabled={isLoading}
              />
              {errors.witness_name && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">
                    {errors.witness_name.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="witness_phone" className="text-slate-700 font-semibold">
                Tanık Telefon
              </Label>
              <Input
                id="witness_phone"
                {...register('witness_phone')}
                placeholder="0532 123 45 67"
                className="h-11 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                disabled={isLoading}
              />
              {errors.witness_phone && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-sm">
                    {errors.witness_phone.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Weather and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="weather_condition" className="text-slate-700 font-semibold">
                Hava Durumu
              </Label>
              <Input
                id="weather_condition"
                {...register('weather_condition')}
                placeholder="Güneşli, Yağmurlu, Karlı..."
                className="h-11 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-slate-700 font-semibold">
                Notlar
              </Label>
              <Input
                id="notes"
                {...register('notes')}
                placeholder="Ek bilgiler..."
                className="h-11 border-slate-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-100">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-slate-200 hover:bg-slate-50 rounded-xl"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="w-5 h-5 mr-2" />
                İptal
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Toplama Kaydı Oluştur
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default KumbaraForm;
