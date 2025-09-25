// 📊 BULK DATA IMPORT PAGE
// Main page for bulk data import operations

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Database,
  Users,
  UserPlus,
  Heart,
  GraduationCap,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';

import BulkPersonImport from '../data/BulkPersonImport';

interface ImportStats {
  readonly totalImports: number;
  readonly successfulRecords: number;
  readonly failedRecords: number;
  readonly lastImportDate?: Date;
}

const IMPORT_TYPES = [
  {
    id: 'members',
    title: 'Üye Kaydı',
    description: 'Dernek üyelerinin toplu kaydı',
    icon: Users,
    color: 'blue',
    maxRecords: 2000,
    fields: ['Ad Soyad', 'Email', 'Telefon', 'TC No', 'Adres', 'Meslek'],
    sampleData: 'Ahmet Yılmaz, ahmet@email.com, 05551234567, 12345678901, İstanbul, Mühendis',
  },
  {
    id: 'beneficiaries',
    title: 'Yardım Alıcı Kaydı',
    description: 'Yardım alıcılarının toplu kaydı',
    icon: Heart,
    color: 'red',
    maxRecords: 1500,
    fields: ['Ad Soyad', 'Email', 'Telefon', 'TC No', 'Adres', 'Aile Bilgileri'],
    sampleData: 'Fatma Demir, fatma@email.com, 05552345678, 23456789012, Ankara, 4 kişi',
  },
  {
    id: 'volunteers',
    title: 'Gönüllü Kaydı',
    description: 'Gönüllülerin toplu kaydı',
    icon: UserPlus,
    color: 'green',
    maxRecords: 1000,
    fields: ['Ad Soyad', 'Email', 'Telefon', 'Uzmanlık Alanı', 'Müsaitlik'],
    sampleData: 'Mehmet Kaya, mehmet@email.com, 05553456789, Eğitim, Hafta sonu',
  },
  {
    id: 'students',
    title: 'Burs Öğrenci Kaydı',
    description: 'Burs öğrencilerinin toplu kaydı',
    icon: GraduationCap,
    color: 'purple',
    maxRecords: 800,
    fields: ['Ad Soyad', 'Email', 'Telefon', 'Okul', 'Sınıf', 'Not Ortalaması'],
    sampleData: 'Ayşe Öztürk, ayse@email.com, 05554567890, İTÜ, 3. Sınıf, 3.5',
  },
] as const;

export function BulkDataImportPage() {
  const [selectedImportType, setSelectedImportType] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<ImportStats>({
    totalImports: 0,
    successfulRecords: 0,
    failedRecords: 0,
  });

  const handleImportComplete = (data: any[]) => {
    setImportStats((prev) => ({
      totalImports: prev.totalImports + 1,
      successfulRecords: prev.successfulRecords + data.length,
      failedRecords: prev.failedRecords,
      lastImportDate: new Date(),
    }));
  };

  const downloadAllTemplates = () => {
    // Create a comprehensive template with all import types
    const templates = IMPORT_TYPES.map((type) => ({
      type: type.id,
      title: type.title,
      fields: type.fields,
      sampleData: type.sampleData,
    }));

    const csvContent = [
      '# TOPLU VERİ İÇE AKTARMA ŞABLONLARİ',
      '# Her import türü için ayrı CSV dosyası oluşturun',
      '',
      ...templates.flatMap((template) => [
        `# ${template.title.toUpperCase()} (${template.type}.csv)`,
        template.fields.join(','),
        template.sampleData,
        '',
      ]),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bulk-import-templates.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedImportType) {
    const importType = IMPORT_TYPES.find((t) => t.id === selectedImportType);
    if (!importType) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedImportType(null);
            }}
          >
            ← Geri Dön
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <importType.icon className={`h-6 w-6 text-${importType.color}-600`} />
              {importType.title}
            </h1>
            <p className="text-gray-600">{importType.description}</p>
          </div>
        </div>

        <BulkPersonImport
          onImportComplete={handleImportComplete}
          onClose={() => {
            setSelectedImportType(null);
          }}
          maxRecords={importType.maxRecords}
          allowedTypes={[selectedImportType as any]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            Toplu Veri İçe Aktarma
          </h1>
          <p className="text-gray-600 mt-2">
            CSV dosyalarından toplu olarak veri içe aktarın. Binlerce kaydı hızlı ve güvenli şekilde
            işleyin.
          </p>
        </div>
        <Button variant="outline" onClick={downloadAllTemplates}>
          <Download className="h-4 w-4 mr-2" />
          Tüm Şablonları İndir
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam İçe Aktarma</p>
                <p className="text-2xl font-bold">{importStats.totalImports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Başarılı Kayıt</p>
                <p className="text-2xl font-bold text-green-600">{importStats.successfulRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Başarısız Kayıt</p>
                <p className="text-2xl font-bold text-red-600">{importStats.failedRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Son İçe Aktarma</p>
                <p className="text-sm font-medium">
                  {importStats.lastImportDate
                    ? importStats.lastImportDate.toLocaleDateString('tr-TR')
                    : 'Henüz yok'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Types */}
      <Card>
        <CardHeader>
          <CardTitle>İçe Aktarma Türleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {IMPORT_TYPES.map((importType) => {
              const Icon = importType.icon;
              return (
                <motion.div
                  key={importType.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
                    <CardContent
                      className="p-6"
                      onClick={() => {
                        setSelectedImportType(importType.id);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-${importType.color}-100 rounded-lg`}>
                          <Icon className={`h-6 w-6 text-${importType.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{importType.title}</h3>
                            <Badge variant="outline">Max {importType.maxRecords}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{importType.description}</p>
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500">Gerekli Alanlar:</p>
                            <div className="flex flex-wrap gap-1">
                              {importType.fields.map((field) => (
                                <Badge key={field} variant="secondary" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Kullanım Talimatları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              <strong>CSV Formatı:</strong> Dosyanız UTF-8 encoding ile kaydedilmelidir. Excel'den
              "CSV UTF-8 (Comma delimited)" formatında kaydedin.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-semibold">Adım Adım İçe Aktarma:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Yukarıdan içe aktarmak istediğiniz veri türünü seçin</li>
              <li>Örnek CSV şablonunu indirin ve kendi verilerinizle doldurun</li>
              <li>CSV dosyanızı yükleyin (maksimum 10MB)</li>
              <li>İçe aktarma ayarlarını kontrol edin</li>
              <li>İçe aktarmayı başlatın ve ilerlemeyi takip edin</li>
              <li>Sonuçları kontrol edin ve gerekirse hataları düzeltin</li>
            </ol>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">✅ Desteklenen Özellikler</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Batch processing (50 kayıt/batch)</li>
                <li>• Gerçek zamanlı ilerleme takibi</li>
                <li>• Otomatik doğrulama</li>
                <li>• Hata raporlama</li>
                <li>• Tekrar deneme mekanizması</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📋 Veri Gereksinimleri</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Ad Soyad: Zorunlu, 2-100 karakter</li>
                <li>• Email: Geçerli email formatı</li>
                <li>• Telefon: 05XXXXXXXXX formatı</li>
                <li>• TC No: 11 haneli sayı</li>
                <li>• Tarih: YYYY-MM-DD formatı</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">⚠️ Önemli Notlar</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Maksimum dosya boyutu: 10MB</li>
                <li>• Tekrarlayan kayıtlar otomatik atlanır</li>
                <li>• İşlem iptal edilebilir</li>
                <li>• Hatalar CSV olarak indirilebilir</li>
                <li>• Büyük dosyalar batch'ler halinde işlenir</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BulkDataImportPage;
