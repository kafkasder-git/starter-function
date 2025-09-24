import { Phone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface BeneficiaryPersonalInfoProps {
  beneficiary: any;
  editMode: boolean;
  onUpdate: (field: string, value: any) => void;
}

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

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Ad Soyad *</Label>
              {editMode ? (
                <Input
                  id="name"
                  value={beneficiary?.name || ''}
                  onChange={(e) => {
                    onUpdate('name', e.target.value);
                  }}
                  placeholder="Ad soyad giriniz"
                />
              ) : (
                <p className="p-2 text-sm">{beneficiary?.name || '-'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tcNo">TC Kimlik No *</Label>
              {editMode ? (
                <Input
                  id="tcNo"
                  value={beneficiary?.tcNo || ''}
                  onChange={(e) => {
                    onUpdate('tcNo', e.target.value);
                  }}
                  placeholder="TC Kimlik No"
                  maxLength={11}
                />
              ) : (
                <p className="p-2 text-sm">{beneficiary?.tcNo || '-'}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthDate">Doğum Tarihi</Label>
              {editMode ? (
                <Input
                  id="birthDate"
                  type="date"
                  value={beneficiary?.birthDate || ''}
                  onChange={(e) => {
                    onUpdate('birthDate', e.target.value);
                  }}
                />
              ) : (
                <p className="p-2 text-sm">
                  {beneficiary?.birthDate
                    ? new Date(beneficiary.birthDate).toLocaleDateString('tr-TR')
                    : '-'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Cinsiyet</Label>
              {editMode ? (
                <Select
                  value={beneficiary?.gender || ''}
                  onValueChange={(value: string) => {
                    onUpdate('gender', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Erkek">Erkek</SelectItem>
                    <SelectItem value="Kadın">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 text-sm">{beneficiary?.gender || '-'}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maritalStatus">Medeni Durum</Label>
              {editMode ? (
                <Select
                  value={beneficiary?.maritalStatus || ''}
                  onValueChange={(value: string) => {
                    onUpdate('maritalStatus', value);
                  }}
                >
                  <SelectTrigger>
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
                <p className="p-2 text-sm">{beneficiary?.maritalStatus || '-'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="education">Eğitim Durumu</Label>
              {editMode ? (
                <Select
                  value={beneficiary?.education || ''}
                  onValueChange={(value: string) => {
                    onUpdate('education', value);
                  }}
                >
                  <SelectTrigger>
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
                <p className="p-2 text-sm">{beneficiary?.education || '-'}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="occupation">Meslek</Label>
            {editMode ? (
              <Select
                value={beneficiary?.occupation || ''}
                onValueChange={(value: string) => {
                  onUpdate('occupation', value);
                }}
              >
                <SelectTrigger>
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
              <p className="p-2 text-sm">{beneficiary?.occupation || '-'}</p>
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

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Telefon *</Label>
            {editMode ? (
              <Input
                id="phone"
                value={beneficiary?.phone || ''}
                onChange={(e) => {
                  onUpdate('phone', e.target.value);
                }}
                placeholder="Telefon numarası"
              />
            ) : (
              <p className="p-2 text-sm">{beneficiary?.phone || '-'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            {editMode ? (
              <Input
                id="email"
                type="email"
                value={beneficiary?.email || ''}
                onChange={(e) => {
                  onUpdate('email', e.target.value);
                }}
                placeholder="E-mail adresi"
              />
            ) : (
              <p className="p-2 text-sm">{beneficiary?.email || '-'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Adres</Label>
            {editMode ? (
              <Textarea
                id="address"
                value={beneficiary?.address || ''}
                onChange={(e) => {
                  onUpdate('address', e.target.value);
                }}
                placeholder="Tam adres bilgisi"
                rows={3}
              />
            ) : (
              <p className="p-2 text-sm">{beneficiary?.address || '-'}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">İl</Label>
              {editMode ? (
                <Input
                  id="city"
                  value={beneficiary?.city || ''}
                  onChange={(e) => {
                    onUpdate('city', e.target.value);
                  }}
                  placeholder="İl"
                />
              ) : (
                <p className="p-2 text-sm">{beneficiary?.city || '-'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="district">İlçe</Label>
              {editMode ? (
                <Input
                  id="district"
                  value={beneficiary?.district || ''}
                  onChange={(e) => {
                    onUpdate('district', e.target.value);
                  }}
                  placeholder="İlçe"
                />
              ) : (
                <p className="p-2 text-sm">{beneficiary?.district || '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
