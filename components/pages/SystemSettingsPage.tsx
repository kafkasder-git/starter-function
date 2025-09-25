/**
 * @fileoverview SystemSettingsPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Activity,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Download,
  HardDrive,
  Mail,
  RefreshCw,
  Save,
  Server,
  Settings,
  Shield,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageLayout } from '../PageLayout';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

/**
 * SystemSettingsPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function SystemSettingsPage() {
  const [systemConfig, setSystemConfig] = useState({
    organizationName: 'Dernek Yönetim Sistemi',
    organizationAddress: 'Atatürk Mahallesi, Cumhuriyet Caddesi No: 123 Şişli/İSTANBUL',
    organizationPhone: '+90 212 555 0123',
    organizationEmail: 'info@dernek.org',
    organizationWebsite: 'www.dernek.org',
    taxNumber: '1234567890',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    currency: 'TRY',
    dateFormat: 'DD/MM/YYYY',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'admin@dernek.org',
    smtpPassword: '••••••••',
    smtpSecurity: 'TLS',
    fromName: 'Dernek Yönetim Sistemi',
    fromEmail: 'noreply@dernek.org',
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '60',
    passwordMinLength: '8',
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    passwordRequireUppercase: true,
    twoFactorEnabled: false,
    loginAttempts: '5',
    lockoutDuration: '15',
    allowMultipleSessions: false,
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionPeriod: '30',
    backupLocation: 'local',
    lastBackup: '2024-01-15 02:00:00',
  });

  // System status data
  const systemStatus = {
    uptime: '15 gün 8 saat 32 dakika',
    version: 'v2.1.3',
    lastUpdate: '2024-01-10',
    dbSize: '245 MB',
    totalUsers: 12,
    activeUsers: 8,
    cpuUsage: 23,
    memoryUsage: 45,
    diskUsage: 67,
    networkStatus: 'online',
  };

  const handleSaveGeneral = () => {
    toast.success('Genel ayarlar kaydedildi', { duration: 2000 });
  };

  const handleSaveEmail = () => {
    toast.success('E-posta ayarları kaydedildi', { duration: 2000 });
  };

  const handleSaveSecurity = () => {
    toast.success('Güvenlik ayarları kaydedildi', { duration: 2000 });
  };

  const handleSaveBackup = () => {
    toast.success('Yedekleme ayarları kaydedildi', { duration: 2000 });
  };

  const handleTestEmail = () => {
    toast.loading('Test e-postası gönderiliyor...', { duration: 2000 });
    setTimeout(() => {
      toast.success('Test e-postası başarıyla gönderildi', { duration: 3000 });
    }, 2000);
  };

  const handleBackupNow = () => {
    toast.loading('Yedekleme başlatılıyor...', { duration: 3000 });
    setTimeout(() => {
      toast.success('Sistem yedeği başarıyla oluşturuldu', { duration: 3000 });
    }, 3000);
  };

  const handleRestoreBackup = () => {
    toast.info('Yedek dosyası seçme özelliği yakında eklenecek', { duration: 3000 });
  };

  return (
    <PageLayout
      title="Sistem Ayarları"
      subtitle="Sistem konfigürasyonu ve güvenlik ayarlarını yönetin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackupNow}>
            <Download className="w-4 h-4 mr-2" />
            Yedek Al
          </Button>
          <Button variant="outline" onClick={handleRestoreBackup}>
            <Upload className="w-4 h-4 mr-2" />
            Yedek Yükle
          </Button>
        </div>
      }
    >
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sistem Durumu</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="font-medium">Çevrimiçi</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Çalışma Süresi</p>
                  <p className="font-medium text-sm">{systemStatus.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aktif Kullanıcı</p>
                  <p className="font-medium">
                    {systemStatus.activeUsers}/{systemStatus.totalUsers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Database className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Veritabanı</p>
                  <p className="font-medium">{systemStatus.dbSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Performance */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Sistem Performansı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    CPU Kullanımı
                  </Label>
                  <span className="text-sm font-medium">{systemStatus.cpuUsage}%</span>
                </div>
                <Progress value={systemStatus.cpuUsage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Bellek Kullanımı
                  </Label>
                  <span className="text-sm font-medium">{systemStatus.memoryUsage}%</span>
                </div>
                <Progress value={systemStatus.memoryUsage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Disk Kullanımı
                  </Label>
                  <span className="text-sm font-medium">{systemStatus.diskUsage}%</span>
                </div>
                <Progress value={systemStatus.diskUsage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="email">E-posta</TabsTrigger>
            <TabsTrigger value="security">Güvenlik</TabsTrigger>
            <TabsTrigger value="backup">Yedekleme</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Organizasyon Bilgileri
                  </CardTitle>
                  <Button onClick={handleSaveGeneral} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organizasyon Adı</Label>
                    <Input
                      id="org-name"
                      value={systemConfig.organizationName}
                      onChange={(e) => {
                        setSystemConfig({ ...systemConfig, organizationName: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-number">Vergi Numarası</Label>
                    <Input
                      id="tax-number"
                      value={systemConfig.taxNumber}
                      onChange={(e) => {
                        setSystemConfig({ ...systemConfig, taxNumber: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-phone">Telefon</Label>
                    <Input
                      id="org-phone"
                      value={systemConfig.organizationPhone}
                      onChange={(e) => {
                        setSystemConfig({ ...systemConfig, organizationPhone: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-email">E-posta</Label>
                    <Input
                      id="org-email"
                      type="email"
                      value={systemConfig.organizationEmail}
                      onChange={(e) => {
                        setSystemConfig({ ...systemConfig, organizationEmail: e.target.value });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-address">Adres</Label>
                  <Textarea
                    id="org-address"
                    value={systemConfig.organizationAddress}
                    onChange={(e) => {
                      setSystemConfig({ ...systemConfig, organizationAddress: e.target.value });
                    }}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Dil</Label>
                    <Select
                      value={systemConfig.language}
                      onValueChange={(value) => {
                        setSystemConfig({ ...systemConfig, language: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tr">Türkçe</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Saat Dilimi</Label>
                    <Select
                      value={systemConfig.timezone}
                      onValueChange={(value) => {
                        setSystemConfig({ ...systemConfig, timezone: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Istanbul">İstanbul (GMT+3)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    SMTP Ayarları
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleTestEmail} size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Test Gönder
                    </Button>
                    <Button onClick={handleSaveEmail} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Sunucusu</Label>
                    <Input
                      id="smtp-host"
                      value={emailSettings.smtpHost}
                      onChange={(e) => {
                        setEmailSettings({ ...emailSettings, smtpHost: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input
                      id="smtp-port"
                      value={emailSettings.smtpPort}
                      onChange={(e) => {
                        setEmailSettings({ ...emailSettings, smtpPort: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">Kullanıcı Adı</Label>
                    <Input
                      id="smtp-username"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => {
                        setEmailSettings({ ...emailSettings, smtpUsername: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Şifre</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => {
                        setEmailSettings({ ...emailSettings, smtpPassword: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-security">Güvenlik</Label>
                    <Select
                      value={emailSettings.smtpSecurity}
                      onValueChange={(value) => {
                        setEmailSettings({ ...emailSettings, smtpSecurity: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TLS">TLS</SelectItem>
                        <SelectItem value="SSL">SSL</SelectItem>
                        <SelectItem value="none">Güvenlik Yok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-email">Gönderen E-posta</Label>
                    <Input
                      id="from-email"
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => {
                        setEmailSettings({ ...emailSettings, fromEmail: e.target.value });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Güvenlik Ayarları
                  </CardTitle>
                  <Button onClick={handleSaveSecurity} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Session Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium">Oturum Ayarları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Oturum Zaman Aşımı (dakika)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => {
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-attempts">Maksimum Giriş Denemesi</Label>
                      <Input
                        id="login-attempts"
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => {
                          setSecuritySettings({
                            ...securitySettings,
                            loginAttempts: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="multiple-sessions">Çoklu Oturum İzni</Label>
                      <p className="text-sm text-muted-foreground">
                        Aynı kullanıcı birden fazla cihazda oturum açabilsin
                      </p>
                    </div>
                    <Switch
                      id="multiple-sessions"
                      checked={securitySettings.allowMultipleSessions}
                      onCheckedChange={(checked) => {
                        setSecuritySettings({
                          ...securitySettings,
                          allowMultipleSessions: checked,
                        });
                      }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Password Policy */}
                <div className="space-y-4">
                  <h3 className="font-medium">Şifre Politikası</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="password-length">Minimum Şifre Uzunluğu</Label>
                      <Input
                        id="password-length"
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => {
                          setSecuritySettings({
                            ...securitySettings,
                            passwordMinLength: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-numbers">Rakam Zorunluluğu</Label>
                      <Switch
                        id="require-numbers"
                        checked={securitySettings.passwordRequireNumbers}
                        onCheckedChange={(checked) => {
                          setSecuritySettings({
                            ...securitySettings,
                            passwordRequireNumbers: checked,
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-symbols">Özel Karakter Zorunluluğu</Label>
                      <Switch
                        id="require-symbols"
                        checked={securitySettings.passwordRequireSymbols}
                        onCheckedChange={(checked) => {
                          setSecuritySettings({
                            ...securitySettings,
                            passwordRequireSymbols: checked,
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-uppercase">Büyük Harf Zorunluluğu</Label>
                      <Switch
                        id="require-uppercase"
                        checked={securitySettings.passwordRequireUppercase}
                        onCheckedChange={(checked) => {
                          setSecuritySettings({
                            ...securitySettings,
                            passwordRequireUppercase: checked,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    Yedekleme Ayarları
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBackupNow} size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Şimdi Yedekle
                    </Button>
                    <Button onClick={handleSaveBackup} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Backup Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-900">Son Yedekleme</h3>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {backupSettings.lastBackup} tarihinde başarıyla tamamlandı
                  </p>
                </div>

                {/* Backup Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-backup">Otomatik Yedekleme</Label>
                      <p className="text-sm text-muted-foreground">
                        Belirli aralıklarla otomatik yedekleme yapılsın
                      </p>
                    </div>
                    <Switch
                      id="auto-backup"
                      checked={backupSettings.autoBackup}
                      onCheckedChange={(checked) => {
                        setBackupSettings({ ...backupSettings, autoBackup: checked });
                      }}
                    />
                  </div>

                  {backupSettings.autoBackup && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div className="space-y-2">
                        <Label htmlFor="backup-frequency">Yedekleme Sıklığı</Label>
                        <Select
                          value={backupSettings.backupFrequency}
                          onValueChange={(value) => {
                            setBackupSettings({ ...backupSettings, backupFrequency: value });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Saatlik</SelectItem>
                            <SelectItem value="daily">Günlük</SelectItem>
                            <SelectItem value="weekly">Haftalık</SelectItem>
                            <SelectItem value="monthly">Aylık</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backup-time">Yedekleme Saati</Label>
                        <Input
                          id="backup-time"
                          type="time"
                          value={backupSettings.backupTime}
                          onChange={(e) => {
                            setBackupSettings({ ...backupSettings, backupTime: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="retention-period">Saklama Süresi (gün)</Label>
                    <Input
                      id="retention-period"
                      type="number"
                      value={backupSettings.retentionPeriod}
                      onChange={(e) => {
                        setBackupSettings({ ...backupSettings, retentionPeriod: e.target.value });
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Bu süreden eski yedekler otomatik olarak silinecektir
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
