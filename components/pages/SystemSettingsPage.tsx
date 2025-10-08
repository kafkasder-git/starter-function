/**
 * @fileoverview System Settings Page - Basic configuration and settings
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { Settings, Save, Bell, Shield, Database, Mail, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import PageLayout from '../PageLayout';

interface SystemSettings {
  general: {
    organizationName: string;
    organizationAddress: string;
    organizationPhone: string;
    organizationEmail: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    auditLogNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordExpiry: number;
    mfaEnabled: boolean;
    ipWhitelist: string;
  };
  database: {
    backupFrequency: string;
    dataRetentionDays: number;
    enableArchiving: boolean;
  };
}

/**
 * SystemSettingsPage Component
 * 
 * Provides a comprehensive settings interface for system administrators
 * to configure various aspects of the application.
 */
export function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      organizationName: 'Dernek Adı',
      organizationAddress: '',
      organizationPhone: '',
      organizationEmail: '',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      auditLogNotifications: true,
    },
    security: {
      sessionTimeout: 30,
      passwordExpiry: 90,
      mfaEnabled: false,
      ipWhitelist: '',
    },
    database: {
      backupFrequency: 'daily',
      dataRetentionDays: 365,
      enableArchiving: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In real implementation, save to Supabase or backend
      // await supabase.from('system_settings').upsert(settings);
      
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken bir hata oluştu');
      console.error('Settings save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateGeneralSettings = (field: keyof SystemSettings['general'], value: string) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  const updateNotificationSettings = (field: keyof SystemSettings['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
  };

  const updateSecuritySettings = (field: keyof SystemSettings['security'], value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, [field]: value },
    }));
  };

  const updateDatabaseSettings = (field: keyof SystemSettings['database'], value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      database: { ...prev.database, [field]: value },
    }));
  };

  return (
    <PageLayout
      title="Sistem Ayarları"
      subtitle="Sistem genelinde uygulanacak ayarları yapılandırın"
      actions={
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      }
    >
      <div className="p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="general">
              <Globe className="w-4 h-4 mr-2" />
              Genel
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Güvenlik
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="w-4 h-4 mr-2" />
              Veritabanı
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Kurum Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgName">Kurum Adı</Label>
                      <Input
                        id="orgName"
                        value={settings.general.organizationName}
                        onChange={(e) => updateGeneralSettings('organizationName', e.target.value)}
                        placeholder="Dernek adını giriniz"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orgEmail">E-posta</Label>
                      <Input
                        id="orgEmail"
                        type="email"
                        value={settings.general.organizationEmail}
                        onChange={(e) => updateGeneralSettings('organizationEmail', e.target.value)}
                        placeholder="info@dernek.org"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orgPhone">Telefon</Label>
                      <Input
                        id="orgPhone"
                        value={settings.general.organizationPhone}
                        onChange={(e) => updateGeneralSettings('organizationPhone', e.target.value)}
                        placeholder="+90 XXX XXX XX XX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orgAddress">Adres</Label>
                      <Input
                        id="orgAddress"
                        value={settings.general.organizationAddress}
                        onChange={(e) => updateGeneralSettings('organizationAddress', e.target.value)}
                        placeholder="Kurum adresi"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bildirim Tercihleri</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotif">E-posta Bildirimleri</Label>
                        <p className="text-sm text-gray-500">Önemli olaylar için e-posta gönderin</p>
                      </div>
                      <Switch
                        id="emailNotif"
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateNotificationSettings('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotif">SMS Bildirimleri</Label>
                        <p className="text-sm text-gray-500">Kritik işlemler için SMS gönderin</p>
                      </div>
                      <Switch
                        id="smsNotif"
                        checked={settings.notifications.smsNotifications}
                        onCheckedChange={(checked) => updateNotificationSettings('smsNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotif">Push Bildirimleri</Label>
                        <p className="text-sm text-gray-500">Tarayıcı push bildirimleri</p>
                      </div>
                      <Switch
                        id="pushNotif"
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(checked) => updateNotificationSettings('pushNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auditNotif">Audit Log Bildirimleri</Label>
                        <p className="text-sm text-gray-500">Güvenlik olayları için bildirim</p>
                      </div>
                      <Switch
                        id="auditNotif"
                        checked={settings.notifications.auditLogNotifications}
                        onCheckedChange={(checked) => updateNotificationSettings('auditLogNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Güvenlik Ayarları</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="mfa">İki Faktörlü Doğrulama (2FA)</Label>
                        <p className="text-sm text-gray-500">Tüm kullanıcılar için 2FA zorunluluğu</p>
                      </div>
                      <Switch
                        id="mfa"
                        checked={settings.security.mfaEnabled}
                        onCheckedChange={(checked) => updateSecuritySettings('mfaEnabled', checked)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sessionTimeout">Oturum Zaman Aşımı (dakika)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSecuritySettings('sessionTimeout', parseInt(e.target.value))}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="passwordExpiry">Şifre Geçerlilik Süresi (gün)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={settings.security.passwordExpiry}
                        onChange={(e) => updateSecuritySettings('passwordExpiry', parseInt(e.target.value))}
                        placeholder="90"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                      <Input
                        id="ipWhitelist"
                        value={settings.security.ipWhitelist}
                        onChange={(e) => updateSecuritySettings('ipWhitelist', e.target.value)}
                        placeholder="192.168.1.1, 10.0.0.1"
                      />
                      <p className="text-sm text-gray-500 mt-1">Virgülle ayrılmış IP adresleri</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Veritabanı Yönetimi</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="backupFreq">Yedekleme Sıklığı</Label>
                      <select
                        id="backupFreq"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={settings.database.backupFrequency}
                        onChange={(e) => updateDatabaseSettings('backupFrequency', e.target.value)}
                      >
                        <option value="hourly">Saatlik</option>
                        <option value="daily">Günlük</option>
                        <option value="weekly">Haftalık</option>
                        <option value="monthly">Aylık</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="retention">Veri Saklama Süresi (gün)</Label>
                      <Input
                        id="retention"
                        type="number"
                        value={settings.database.dataRetentionDays}
                        onChange={(e) => updateDatabaseSettings('dataRetentionDays', parseInt(e.target.value))}
                        placeholder="365"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="archiving">Otomatik Arşivleme</Label>
                        <p className="text-sm text-gray-500">Eski kayıtları otomatik arşivle</p>
                      </div>
                      <Switch
                        id="archiving"
                        checked={settings.database.enableArchiving}
                        onCheckedChange={(checked) => updateDatabaseSettings('enableArchiving', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

export default SystemSettingsPage;

