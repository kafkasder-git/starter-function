/**
 * @fileoverview BeneficiaryForm Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Building, CreditCard, Heart, MapPin, Phone, Save, User, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { AidType, BeneficiaryCategory, BeneficiaryFormData } from '../../types/beneficiary';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

// Form validation schema
const beneficiarySchema = z.object({
  // Temel bilgiler
  full_name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  identity_no: z.string().regex(/^[0-9]{11}$/, 'Kimlik numarası 11 haneli olmalıdır'),
  nationality: z.string().min(2, 'Uyruk belirtilmelidir'),
  country: z.string().length(2, 'Ülke kodu 2 karakter olmalıdır'),

  // İletişim
  phone: z.string().regex(/^(\+90|0)?5[0-9]{9}$/, 'Geçerli telefon numarası giriniz'),
  email: z.string().email('Geçerli e-posta adresi giriniz').optional().or(z.literal('')),

  // Adres
  city: z.string().min(2, 'Şehir belirtilmelidir'),
  settlement: z.string().min(2, 'Yerleşim yeri belirtilmelidir'),
  neighborhood: z.string().optional(),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),

  // Demografik
  household_size: z
    .number()
    .min(1, 'Hane büyüklüğü en az 1 olmalıdır')
    .max(20, 'Hane büyüklüğü en fazla 20 olabilir'),
  birth_date: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),

  // Yardım
  category: z.enum(['gıda', 'nakdi', 'eğitim', 'sağlık', 'barınma', 'giyim', 'diğer']),
  aid_type: z.enum(['tek seferlik', 'aylık paket', 'acil yardım', 'sürekli destek', 'proje bazlı']),
  fund_region: z.string().min(2, 'Fon bölgesi belirtilmelidir'),

  // Kart ve bağlantılar
  linked_orphan: z.boolean(),
  linked_card: z.boolean(),
  card_no: z.string().optional(),

  // Sistem
  opened_by_unit: z.string().min(2, 'Açan birim belirtilmelidir'),
  iban: z
    .string()
    .regex(/^TR[0-9]{2}[0-9]{4}[0-9]{1}[0-9]{16}$/, 'Geçerli IBAN giriniz')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
});

interface BeneficiaryFormProps {
  initialData?: Partial<BeneficiaryFormData>;
  onSubmit: (data: BeneficiaryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

/**
 * BeneficiaryForm function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BeneficiaryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
}: BeneficiaryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      nationality: 'TR',
      country: 'TR',
      household_size: 1,
      linked_orphan: false,
      linked_card: false,
      category: 'gıda',
      aid_type: 'aylık paket',
      opened_by_unit: 'Sosyal Yardım Birimi',
      ...initialData,
    },
  });

  const handleSubmit = async (data: BeneficiaryFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(
        mode === 'create' ? 'İhtiyaç sahibi başarıyla eklendi' : 'Bilgiler başarıyla güncellendi',
      );
    } catch (error) {
      toast.error(`Bir hata oluştu: ${  (error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedLinkedCard = form.watch('linked_card');

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Temel Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Temel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Ad Soyad *</Label>
              <Input
                id="full_name"
                {...form.register('full_name')}
                placeholder="Örn: Ahmet Yılmaz"
                className={form.formState.errors.full_name ? 'border-red-500' : ''}
              />
              {form.formState.errors.full_name && (
                <p className="text-red-500 text-sm">{form.formState.errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="identity_no">Kimlik Numarası *</Label>
              <Input
                id="identity_no"
                {...form.register('identity_no')}
                placeholder="12345678901"
                maxLength={11}
                className={form.formState.errors.identity_no ? 'border-red-500' : ''}
              />
              {form.formState.errors.identity_no && (
                <p className="text-red-500 text-sm">{form.formState.errors.identity_no.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Uyruk *</Label>
              <Select
                value={form.watch('nationality')}
                onValueChange={(value) => {
                  form.setValue('nationality', value);
                }}
              >
                <SelectTrigger
                  className={form.formState.errors.nationality ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Uyruk seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TR">Türkiye</SelectItem>
                  <SelectItem value="SY">Suriye</SelectItem>
                  <SelectItem value="AF">Afganistan</SelectItem>
                  <SelectItem value="IQ">Irak</SelectItem>
                  <SelectItem value="IR">İran</SelectItem>
                  <SelectItem value="Other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="household_size">Hane Büyüklüğü *</Label>
              <Input
                id="household_size"
                type="number"
                min="1"
                max="20"
                {...form.register('household_size', { valueAsNumber: true })}
                className={form.formState.errors.household_size ? 'border-red-500' : ''}
              />
              {form.formState.errors.household_size && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.household_size.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İletişim Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            İletişim Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="+90 5xx xxx xx xx"
                className={form.formState.errors.phone ? 'border-red-500' : ''}
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="ornek@email.com"
                className={form.formState.errors.email ? 'border-red-500' : ''}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adres Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Adres Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Şehir *</Label>
              <Input
                id="city"
                {...form.register('city')}
                placeholder="İstanbul"
                className={form.formState.errors.city ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settlement">Yerleşim Yeri *</Label>
              <Input
                id="settlement"
                {...form.register('settlement')}
                placeholder="Fatih"
                className={form.formState.errors.settlement ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Mahalle</Label>
              <Input
                id="neighborhood"
                {...form.register('neighborhood')}
                placeholder="Akşemsettin"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Tam Adres *</Label>
            <Textarea
              id="address"
              {...form.register('address')}
              placeholder="Akşemsettin Mah., Örnek Sk. No:12"
              rows={3}
              className={form.formState.errors.address ? 'border-red-500' : ''}
            />
            {form.formState.errors.address && (
              <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Yardım Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Yardım Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) => {
                  form.setValue('category', value as BeneficiaryCategory);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gıda">🍽️ Gıda Yardımı</SelectItem>
                  <SelectItem value="nakdi">💰 Nakdi Yardım</SelectItem>
                  <SelectItem value="eğitim">📚 Eğitim Desteği</SelectItem>
                  <SelectItem value="sağlık">🏥 Sağlık Yardımı</SelectItem>
                  <SelectItem value="barınma">🏠 Barınma Desteği</SelectItem>
                  <SelectItem value="giyim">👕 Giyim Yardımı</SelectItem>
                  <SelectItem value="diğer">📦 Diğer Yardım</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aid_type">Yardım Türü *</Label>
              <Select
                value={form.watch('aid_type')}
                onValueChange={(value) => {
                  form.setValue('aid_type', value as AidType);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Yardım türü seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tek seferlik">⚡ Tek Seferlik</SelectItem>
                  <SelectItem value="aylık paket">📦 Aylık Paket</SelectItem>
                  <SelectItem value="acil yardım">🚨 Acil Yardım</SelectItem>
                  <SelectItem value="sürekli destek">🔄 Sürekli Destek</SelectItem>
                  <SelectItem value="proje bazlı">📋 Proje Bazlı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fund_region">Fon Bölgesi *</Label>
              <Input
                id="fund_region"
                {...form.register('fund_region')}
                placeholder="İstanbul-Avrupa"
                className={form.formState.errors.fund_region ? 'border-red-500' : ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kart ve Bağlantı Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Kart ve Bağlantı Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="linked_orphan"
                checked={form.watch('linked_orphan')}
                onCheckedChange={(checked) => {
                  form.setValue('linked_orphan', checked as boolean);
                }}
              />
              <Label htmlFor="linked_orphan">Yetim ile bağlantılı</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="linked_card"
                checked={form.watch('linked_card')}
                onCheckedChange={(checked) => {
                  form.setValue('linked_card', checked as boolean);
                }}
              />
              <Label htmlFor="linked_card">Kart ile bağlantılı</Label>
            </div>
          </div>

          {watchedLinkedCard && (
            <div className="space-y-2">
              <Label htmlFor="card_no">Kart Numarası</Label>
              <Input id="card_no" {...form.register('card_no')} placeholder="KART-00123" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sistem Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Sistem Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opened_by_unit">Açan Birim *</Label>
              <Select
                value={form.watch('opened_by_unit')}
                onValueChange={(value) => {
                  form.setValue('opened_by_unit', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Birim seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sosyal Yardım Birimi">Sosyal Yardım Birimi</SelectItem>
                  <SelectItem value="Eğitim Birimi">Eğitim Birimi</SelectItem>
                  <SelectItem value="Sağlık Birimi">Sağlık Birimi</SelectItem>
                  <SelectItem value="Genel Koordinasyon">Genel Koordinasyon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                {...form.register('iban')}
                placeholder="TR120006200119000006672315"
                className={form.formState.errors.iban ? 'border-red-500' : ''}
              />
              {form.formState.errors.iban && (
                <p className="text-red-500 text-sm">{form.formState.errors.iban.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Ek bilgiler ve notlar..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting ?? isLoading}
        >
          <X className="w-4 h-4 mr-2" />
          İptal
        </Button>
        <Button type="submit" disabled={isSubmitting ?? isLoading} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Kaydet' : 'Güncelle'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
