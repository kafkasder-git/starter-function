/**
 * @fileoverview AppwriteConnectionStatus Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useAppwriteConnection, isAppwriteConfigured } from '../hooks/useAppwriteConnection';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * AppwriteConnectionStatus function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AppwriteConnectionStatus() {
  const { isConnected, isLoading, error, projectUrl } = useAppwriteConnection();
  const isConfigured = isAppwriteConfigured();

  if (!isConfigured) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>
              <strong>Appwrite Konfigürasyonu Eksik</strong>
            </p>
            <p>Lütfen aşağıdaki adımları takip edin:</p>
            <ol className="list-inside list-decimal space-y-1 text-sm">
              <li>Appwrite Console&apos;dan proje endpoint&apos;inizi alın</li>
              <li>Appwrite Project ID&apos;nizi alın</li>
              <li>Proje root&apos;unda .env dosyası oluşturun</li>
              <li>VITE_APPWRITE_ENDPOINT ve VITE_APPWRITE_PROJECT_ID değerlerini ekleyin</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Alert className="m-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Appwrite bağlantısı test ediliyor...</AlertDescription>
      </Alert>
    );
  }

  if (isConnected) {
    return (
      <Alert variant="default" className="m-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-1">
            <p>
              <strong>✅ Appwrite Bağlantısı Başarılı</strong>
            </p>
            <p className="text-sm">Proje URL: {projectUrl}</p>
            {error && <p className="text-xs text-amber-600">{error}</p>}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="m-4">
      <XCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p>
            <strong>❌ Appwrite Bağlantısı Başarısız</strong>
          </p>
          <p className="text-sm">{error}</p>
          <div className="space-y-1 text-xs">
            <p>Kontrol edilecekler:</p>
            <ul className="list-inside list-disc">
              <li>Appwrite proje endpoint&apos;i doğru mu?</li>
              <li>Project ID doğru mu?</li>
              <li>Proje aktif mi?</li>
              <li>İnternet bağlantısı var mı?</li>
            </ul>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default AppwriteConnectionStatus;
