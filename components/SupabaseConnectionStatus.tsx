import React from 'react';
import { useSupabaseConnection, isSupabaseConfigured } from '../hooks/useSupabaseConnection';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function SupabaseConnectionStatus() {
  const { isConnected, isLoading, error, projectUrl } = useSupabaseConnection();
  const isConfigured = isSupabaseConfigured();

  if (!isConfigured) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>
              <strong>Supabase Konfigürasyonu Eksik</strong>
            </p>
            <p>Lütfen aşağıdaki adımları takip edin:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Supabase Dashboard'dan proje URL'nizi alın</li>
              <li>Supabase Anon Key'inizi alın</li>
              <li>Proje root'unda .env dosyası oluşturun</li>
              <li>VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini ekleyin</li>
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
        <AlertDescription>Supabase bağlantısı test ediliyor...</AlertDescription>
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
              <strong>✅ Supabase Bağlantısı Başarılı</strong>
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
            <strong>❌ Supabase Bağlantısı Başarısız</strong>
          </p>
          <p className="text-sm">{error}</p>
          <div className="text-xs space-y-1">
            <p>Kontrol edilecekler:</p>
            <ul className="list-disc list-inside">
              <li>Supabase proje URL'si doğru mu?</li>
              <li>Anon key doğru mu?</li>
              <li>Proje aktif mi?</li>
              <li>İnternet bağlantısı var mı?</li>
            </ul>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default SupabaseConnectionStatus;
