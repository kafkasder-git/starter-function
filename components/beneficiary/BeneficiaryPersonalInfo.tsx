/**
 * @fileoverview BeneficiaryPersonalInfo Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Phone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { formatDate } from '../../lib/utils/dateFormatter';

interface BeneficiaryPersonalInfoProps {
  beneficiary: any;
  editMode: boolean;
  onUpdate: (field: string, value: any) => void;
}

/**
 * BeneficiaryPersonalInfo function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BeneficiaryPersonalInfo({
  beneficiary,
  editMode,
  onUpdate,
}: BeneficiaryPersonalInfoProps) {
  const maritalStatuses = ['Bekar', 'Evli', 'Dul', 'Boşanmış'];
  const educationLevels = ['İlkokul', 'Ortaokul', 'Lise', 'Üniversite', 'Yüksek Lisans', 'Doktora'];
  const occupations = [
    'İşsiz',
    'Emekli',
    'Memur',
    'İşçi',
    'Serbest Meslek',
    'Öğrenci',
    'Ev Hanımı',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Kişisel Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Kişisel Bilgiler
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="form-label required">
                Ad Soyad
              </Label>
              {editMode ? (
                <Input
                  id="name"
                  value={beneficiary?.name ?? ''}
                  onChange={(e) => {
                    onUpdate('name', e.target.value);
                  }}
                  placeholder="Kimlikte yazıldığı gibi tam ad ve soyad"
                  className="form-input"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{beneficiary?.name ?? '-'}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tcNo" className="form-label required">
                TC Kimlik No
              </Label>
              {editMode ? (
                <Input
                  id="tcNo"
                  value={beneficiary?.tcNo ?? ''}
                  onChange={(e) => {
                    onUpdate('tcNo', e.target.value);
                  }}
                  placeholder="11 haneli TC kimlik numarası"
                  maxLength={11}
                  className="form-input"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{beneficiary?.tcNo ?? '-'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="form-label">
                Doğum Tarihi
              </Label>
              {editMode ? (
                <Input
                  id="birthDate"
                  type="date"
                  value={beneficiary?.birthDate ?? ''}
                  onChange={(e) => {
                    onUpdate('birthDate', e.target.value);
                  }}
                  className="form-input"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {beneficiary?.birthDate
                      ? formatDate(beneficiary.birthDate, 'long')
                      : '-'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="form-label">
                Cinsiyet
              </Label>
              {editMode ? (
                <Select
                  value={beneficiary?.gender ?? ''}
                  onValueChange={(value: string) => {
                    onUpdate('gender', value);
                  }}
                >
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Erkek">Erkek</SelectItem>
                    <SelectItem value="Kadın">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{beneficiary?.gender ?? '-'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maritalStatus" className="form-label">
                Medeni Durum
              </Label>
              {editMode ? (
                <Select
                  value={beneficiary?.maritalStatus ?? ''}
                  onValueChange={(value: string) => {
                    onUpdate('maritalStatus', value);
                  }}
                >
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Medeni durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {maritalStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{beneficiary?.maritalStatus ?? '-'}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="education" className="form-label">
                Eğitim Durumu
              </Label>
              {editMode ? (
                <Select
                  value={beneficiary?.education ?? ''}
                  onValueChange={(value: string) => {
                    onUpdate('education', value);
                  }}
                >
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Eğitim durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{beneficiary?.education ?? '-'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation" className="form-label">
              Meslek
            </Label>
            {editMode ? (
              <Select
                value={beneficiary?.occupation ?? ''}
                onValueChange={(value: string) => {
                  onUpdate('occupation', value);
                }}
              >
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Meslek seçin" />
                </SelectTrigger>
                <SelectContent>
                  {occupations.map((occupation) => (
                    <SelectItem key={occupation} value={occupation}>
                      {occupation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{beneficiary?.occupation ?? '-'}</p>
              </div>
            )}
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

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="form-label required">
              Telefon
            </Label>
            {editMode ? (
              <Input
                id="phone"
                value={beneficiary?.phone ?? ''}
                onChange={(e) => {
                  onUpdate('phone', e.target.value);
                }}
                placeholder="05XX XXX XX XX"
                className="form-input"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{beneficiary?.phone ?? '-'}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="form-label">
              E-mail
            </Label>
            {editMode ? (
              <Input
                id="email"
                type="email"
                value={beneficiary?.email ?? ''}
                onChange={(e) => {
                  onUpdate('email', e.target.value);
                }}
                placeholder="ornek@email.com"
                className="form-input"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{beneficiary?.email ?? '-'}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="form-label">
              Adres
            </Label>
            {editMode ? (
              <Textarea
                id="address"
                value={beneficiary?.address ?? ''}
                onChange={(e) => {
                  onUpdate('address', e.target.value);
                }}
                placeholder="Mahalle, sokak, bina no, daire no"
                rows={3}
                className="form-input"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{beneficiary?.address ?? '-'}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city" className="form-label">
                İl
              </Label>
              {editMode ? (
                <Input
                  id="city"
                  value={beneficiary?.city ?? ''}
                  onChange={(e) => {
                    onUpdate('city', e.target.value);
                  }}
                  placeholder="İl adı"
                  className="form-input"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{beneficiary?.city ?? '-'}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district" className="form-label">
                İlçe
              </Label>
              {editMode ? (
                <Input
                  id="district"
                  value={beneficiary?.district ?? ''}
                  onChange={(e) => {
                    onUpdate('district', e.target.value);
                  }}
                  placeholder="İlçe adı"
                  className="form-input"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{beneficiary?.district ?? '-'}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
