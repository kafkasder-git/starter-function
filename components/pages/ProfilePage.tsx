import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Bell, 
  Lock, 
  Save,
  ArrowLeft,
  Edit,
  Camera
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

/**
 * ProfilePage Component
 * 
 * @description Kullanıcı profil sayfası - kişisel bilgiler, güvenlik ayarları ve bildirim tercihleri
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword } = useAuthStore();
  
  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    donationAlerts: true,
    aidRequestAlerts: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(personalInfo);
      toast.success('Profil bilgileri güncellendi');
      setIsEditing(false);
    } catch (error) {
      toast.error('Profil güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Şifre başarıyla değiştirildi');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Şifre değiştirilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    const roleColors = {
      super_admin: 'destructive',
      admin: 'default',
      manager: 'secondary',
      operator: 'outline',
      viewer: 'outline',
      volunteer: 'outline',
    } as const;

    const roleLabels = {
      super_admin: 'Süper Admin',
      admin: 'Admin',
      manager: 'Yönetici',
      operator: 'Operatör',
      viewer: 'Görüntüleyici',
      volunteer: 'Gönüllü',
    };

    return (
      <Badge variant={roleColors[role as keyof typeof roleColors] || 'outline'}>
        {roleLabels[role as keyof typeof roleLabels] || role}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Geri</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Profil Ayarları</h1>
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => { setIsEditing(!isEditing); }}
          className="flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>{isEditing ? 'İptal' : 'Düzenle'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-primary-600" />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {user?.name || 'Kullanıcı'}
              </h3>
              <p className="text-gray-600 mb-3">{user?.email}</p>
              {getRoleBadge(user?.role)}
              <div className="mt-4 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Üyelik: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Kişisel Bilgiler</h2>
            </div>

            <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={personalInfo.name}
                    onChange={(e) => { setPersonalInfo({ ...personalInfo, name: e.target.value }); }}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => { setPersonalInfo({ ...personalInfo, email: e.target.value }); }}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => { setPersonalInfo({ ...personalInfo, phone: e.target.value }); }}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={personalInfo.address}
                    onChange={(e) => { setPersonalInfo({ ...personalInfo, address: e.target.value }); }}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Hakkında</Label>
                <Textarea
                  id="bio"
                  value={personalInfo.bio}
                  onChange={(e) => { setPersonalInfo({ ...personalInfo, bio: e.target.value }); }}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                />
              </div>
              {isEditing && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Bell className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Bildirim Ayarları</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-posta Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Önemli güncellemeler için e-posta alın</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    { setNotificationSettings({ ...notificationSettings, emailNotifications: checked }); }
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Tarayıcı bildirimleri alın</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    { setNotificationSettings({ ...notificationSettings, pushNotifications: checked }); }
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Acil durumlar için SMS alın</p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => 
                    { setNotificationSettings({ ...notificationSettings, smsNotifications: checked }); }
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Haftalık Raporlar</Label>
                  <p className="text-sm text-gray-500">Haftalık aktivite raporları alın</p>
                </div>
                <Switch
                  checked={notificationSettings.weeklyReports}
                  onCheckedChange={(checked) => 
                    { setNotificationSettings({ ...notificationSettings, weeklyReports: checked }); }
                  }
                />
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Lock className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Güvenlik</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => { setPasswordForm({ ...passwordForm, currentPassword: e.target.value }); }}
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => { setPasswordForm({ ...passwordForm, newPassword: e.target.value }); }}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Şifre Onayı</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => { setPasswordForm({ ...passwordForm, confirmPassword: e.target.value }); }}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                Şifre Değiştir
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
