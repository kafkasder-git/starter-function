/**
 * @fileoverview QRCodeManager Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// 🔳📷 QR CODE MANAGER COMPONENT
// Comprehensive QR code management with generation and scanning

import { Camera, Download, Eye, Plus, Printer, QrCode, Search, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { QRScanResult } from '../../services/qrScannerService';
import type { Kumbara, KumbaraQRData } from '../../types/kumbara';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import QRCodeGenerator from './QRCodeGenerator';
import QRCodeScanner from './QRCodeScanner';

interface QRCodeManagerProps {
  kumbara?: Kumbara;
  onKumbaraFound?: (kumbaraData: KumbaraQRData) => void;
  onQRGenerated?: (qrData: KumbaraQRData) => void;
  onClose?: () => void;
  className?: string;
}

interface QRActivity {
  id: string;
  type: 'generated' | 'scanned' | 'printed' | 'downloaded';
  kumbara_code: string;
  kumbara_name: string;
  timestamp: string;
  details?: any;
}

/**
 * QRCodeManager function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function QRCodeManager({
  kumbara,
  onKumbaraFound,
  onQRGenerated,
  onClose,
  className = '',
}: QRCodeManagerProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan' | 'history'>('generate');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrHistory, setQrHistory] = useState<QRActivity[]>([]);
  const [selectedKumbara, setSelectedKumbara] = useState<Kumbara | null>(kumbara ?? null);

  // Handle successful scan
  const handleScanSuccess = useCallback(
    (result: QRScanResult, kumbaraData?: KumbaraQRData) => {
      // Add to history
      const activity: QRActivity = {
        id: Date.now().toString(),
        type: 'scanned',
        kumbara_code: kumbaraData?.code ?? 'Unknown',
        kumbara_name: kumbaraData?.name ?? 'Unknown',
        timestamp: new Date().toISOString(),
        details: result,
      };

      setQrHistory((prev) => [activity, ...prev.slice(0, 9)]); // Keep last 10

      // Notify parent
      if (kumbaraData && onKumbaraFound) {
        onKumbaraFound(kumbaraData);
      }

      // Close scanner
      setIsScannerOpen(false);
    },
    [onKumbaraFound],
  );

  // Handle scan error
  const handleScanError = useCallback((error: string) => {
    toast.error(`Tarama hatası: ${error}`);
  }, []);

  // Handle QR generation
  const handleQRGenerated = useCallback(
    (kumbaraData: Kumbara) => {
      const activity: QRActivity = {
        id: Date.now().toString(),
        type: 'generated',
        kumbara_code: kumbaraData.code,
        kumbara_name: kumbaraData.name,
        timestamp: new Date().toISOString(),
        details: kumbaraData,
      };

      setQrHistory((prev) => [activity, ...prev.slice(0, 9)]);

      if (onQRGenerated) {
        const qrData: KumbaraQRData = {
          kumbaraId: kumbaraData.id,
          code: kumbaraData.code,
          name: kumbaraData.name,
          location: kumbaraData.location,
          url: `https://bagis.dernek.org/kumbara/${kumbaraData.code}`,
          donationUrl: `https://bagis.dernek.org/donate/kumbara/${kumbaraData.code}`,
          contactInfo: {
            phone: kumbaraData.phone,
            person: kumbaraData.contactPerson,
          },
          metadata: {
            installDate: kumbaraData.installDate,
            lastUpdated: kumbaraData.updated_at,
            version: '2.0',
          },
        };
        onQRGenerated(qrData);
      }
    },
    [onQRGenerated],
  );

  // Get activity icon
  const getActivityIcon = (type: QRActivity['type']) => {
    switch (type) {
      case 'generated':
        return <QrCode className="w-4 h-4 text-blue-600" />;
      case 'scanned':
        return <Camera className="w-4 h-4 text-green-600" />;
      case 'printed':
        return <Printer className="w-4 h-4 text-purple-600" />;
      case 'downloaded':
        return <Download className="w-4 h-4 text-orange-600" />;
      default:
        return <QrCode className="w-4 h-4 text-slate-600" />;
    }
  };

  // Get activity label
  const getActivityLabel = (type: QRActivity['type']) => {
    switch (type) {
      case 'generated':
        return 'QR Kod Oluşturuldu';
      case 'scanned':
        return 'QR Kod Tarandı';
      case 'printed':
        return 'QR Kod Yazdırıldı';
      case 'downloaded':
        return 'QR Kod İndirildi';
      default:
        return 'Bilinmeyen İşlem';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">QR Kod Yöneticisi</h1>
          <p className="text-slate-600">Kumbara QR kodlarını oluşturun, tarayın ve yönetin</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
            onClick={() => {
              setIsGeneratorOpen(true);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">QR Kod Oluştur</div>
                  <div className="text-sm text-slate-600">Yeni QR kod üret</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
            onClick={() => {
              setIsScannerOpen(true);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">QR Kod Tara</div>
                  <div className="text-sm text-slate-600">Kamera ile tara</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">QR Kod Ara</div>
                  <div className="text-sm text-slate-600">Mevcut kodları bul</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Toplu İşlemler</div>
                  <div className="text-sm text-slate-600">Batch operations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={(value: any) => {
          setActiveTab(value);
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Oluştur
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Tara
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Geçmiş
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>QR Kod Oluşturma</CardTitle>
              <CardDescription>
                Seçili kumbara için QR kod oluşturun ve özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedKumbara ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <QrCode className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-semibold text-blue-800">{selectedKumbara.name}</div>
                        <div className="text-sm text-blue-600">{selectedKumbara.location}</div>
                        <div className="text-xs font-mono text-blue-500">
                          {selectedKumbara.code}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setIsGeneratorOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Kod Oluştur
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">Kumbara Seçilmedi</h3>
                  <p className="text-slate-500 mb-4">
                    QR kod oluşturmak için önce bir kumbara seçin
                  </p>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Kumbara Seç
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan" className="space-y-4">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>QR Kod Tarama</CardTitle>
              <CardDescription>Kumbara QR kodlarını kamera veya dosya ile tarayın</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  setIsScannerOpen(true);
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                QR Kod Tarayıcıyı Aç
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>QR Kod Geçmişi</CardTitle>
              <CardDescription>Son QR kod aktivitelerinizi görüntüleyin</CardDescription>
            </CardHeader>
            <CardContent>
              {qrHistory.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {qrHistory.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-800">
                              {getActivityLabel(activity.type)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {activity.kumbara_code}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 truncate">
                            {activity.kumbara_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(activity.timestamp).toLocaleString('tr-TR')}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="flex-shrink-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">Henüz Aktivite Yok</h3>
                  <p className="text-slate-500">
                    QR kod oluşturduğunuzda veya taradığınızda burada görünecek
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Generator Dialog */}
      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">QR Kod Üretici</DialogTitle>
          </DialogHeader>
          {selectedKumbara && (
            <QRCodeGenerator
              kumbara={selectedKumbara}
              onClose={() => {
                setIsGeneratorOpen(false);
                handleQRGenerated(selectedKumbara);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">QR Kod Tarayıcı</DialogTitle>
          </DialogHeader>
          <QRCodeScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onClose={() => {
              setIsScannerOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QRCodeManager;
