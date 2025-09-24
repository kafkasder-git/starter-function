import { Save, Upload, UserPlus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

export function NewMemberPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    district: '',
    profession: '',
    birthDate: '',
    membershipType: 'regular',
    monthlyFee: 50,
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    agreements: {
      membershipAgreement: false,
      privacyPolicy: false,
      communications: false,
    },
    address: '',
    city: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.startsWith('agreements.')) {
      const agreementField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        agreements: {
          ...prev.agreements,
          [agreementField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleMembershipTypeChange = (type: string) => {
    const feeMap = {
      student: 25,
      regular: 50,
      premium: 100,
    };
    setFormData((prev) => ({
      ...prev,
      membershipType: type,
      monthlyFee: feeMap[type as keyof typeof feeMap] || 50,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Profil fotoğrafı yüklendi');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName) {
      toast.error('Üyenin ad ve soyad alanları zorunludur');
      return;
    }

    if (!formData.email || !formData.phone) {
      toast.error('Üyenin e-posta ve telefon alanları zorunludur');
      return;
    }

    if (!formData.agreements.membershipAgreement || !formData.agreements.privacyPolicy) {
      toast.error('Zorunlu sözleşmeleri onaylamanız gerekiyor');
      return;
    }

    toast.success('Yeni üye başarıyla kaydedildi!');
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      profession: '',
      birthDate: '',
      membershipType: 'regular',
      monthlyFee: 50,
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
      agreements: {
        membershipAgreement: false,
        privacyPolicy: false,
        communications: false,
      },
    });
    setProfileImage(null);
    toast.success('Form sıfırlandı');
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 bg-slate-50/50 min-h-full safe-area">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Yeni Üye Kaydı
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Dernek adına yeni üye bilgilerini girin ve kaydedin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" />
            Sıfırla
          </Button>
          <Button onClick={handleSubmit} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profil Fotoğrafı</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserPlus className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('profile-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Fotoğraf Yükle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kişisel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ad *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => {
                    handleInputChange('firstName', e.target.value);
                  }}
                  placeholder="Üyenin adını girin"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Soyad *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => {
                    handleInputChange('lastName', e.target.value);
                  }}
                  placeholder="Üyenin soyadını girin"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange('email', e.target.value);
                  }}
                  placeholder="ornek@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    handleInputChange('phone', e.target.value);
                  }}
                  placeholder="0532 123 4567"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="birthDate">Doğum Tarihi</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => {
                  handleInputChange('birthDate', e.target.value);
                }}
              />
            </div>

            <div>
              <Label htmlFor="profession">Meslek</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => {
                  handleInputChange('profession', e.target.value);
                }}
                placeholder="Üyenin mesleğini girin"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adres Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => {
                  handleInputChange('address', e.target.value);
                }}
                placeholder="Üyenin tam adresini girin"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">İl</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => {
                    handleInputChange('city', e.target.value);
                  }}
                  placeholder="İl"
                />
              </div>
              <div>
                <Label htmlFor="district">İlçe</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => {
                    handleInputChange('district', e.target.value);
                  }}
                  placeholder="İlçe"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Üyelik Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="membershipType">Üyelik Tipi</Label>
              <Select value={formData.membershipType} onValueChange={handleMembershipTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Üyelik tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Öğrenci Üye - ₺25/ay</SelectItem>
                  <SelectItem value="regular">Normal Üye - ₺50/ay</SelectItem>
                  <SelectItem value="premium">Premium Üye - ₺100/ay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Aylık Aidat</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-lg px-3 py-2">
                  ₺{formData.monthlyFee}/ay
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acil Durum İletişim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Acil Durum Kişisi</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => {
                    handleInputChange('emergencyContact', e.target.value);
                  }}
                  placeholder="Acil durum kişisinin adı soyadı"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Acil Durum Telefonu</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => {
                    handleInputChange('emergencyPhone', e.target.value);
                  }}
                  placeholder="0532 123 4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => {
                handleInputChange('notes', e.target.value);
              }}
              placeholder="Üye hakkında ek notlar..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Agreements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sözleşmeler ve Onaylar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="membershipAgreement"
                checked={formData.agreements.membershipAgreement}
                onCheckedChange={(checked) => {
                  handleInputChange('agreements.membershipAgreement', checked);
                }}
              />
              <Label htmlFor="membershipAgreement" className="text-sm">
                Üyelik sözleşmesini okudum ve kabul ediyorum *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacyPolicy"
                checked={formData.agreements.privacyPolicy}
                onCheckedChange={(checked) => {
                  handleInputChange('agreements.privacyPolicy', checked);
                }}
              />
              <Label htmlFor="privacyPolicy" className="text-sm">
                Kişisel verilerin korunması politikasını kabul ediyorum *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="communications"
                checked={formData.agreements.communications}
                onCheckedChange={(checked) => {
                  handleInputChange('agreements.communications', checked);
                }}
              />
              <Label htmlFor="communications" className="text-sm">
                SMS ve e-posta ile bilgilendirilmek istiyorum
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 pt-4"
        >
          <Button type="submit" className="flex-1" size="lg">
            <Save className="w-4 h-4 mr-2" />
            Üye Kaydını Tamamla
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} size="lg">
            <X className="w-4 h-4 mr-2" />
            Formu Sıfırla
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
