import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  projectUrl: string | null;
}

export function useSupabaseConnection(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    projectUrl: null,
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('users').select('count(*)').limit(1);

        if (error) {
          // If users table doesn't exist, that's still a valid connection
          if (error.message.includes('relation "public.users" does not exist')) {
            setStatus({
              isConnected: true,
              isLoading: false,
              error: 'Bağlantı başarılı - Users tablosu henüz oluşturulmamış',
              projectUrl: import.meta.env.VITE_SUPABASE_URL,
            });
          } else {
            throw error;
          }
        } else {
          setStatus({
            isConnected: true,
            isLoading: false,
            error: null,
            projectUrl: import.meta.env.VITE_SUPABASE_URL,
          });
        }
      } catch (error: any) {
        console.error('Supabase connection test failed:', error);
        setStatus({
          isConnected: false,
          isLoading: false,
          error: error.message || 'Supabase bağlantısı kurulamadı',
          projectUrl: null,
        });
      }
    };

    // Only test if we have valid config
    if (!isSupabaseConfigured()) {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: 'Supabase konfigürasyonu eksik - .env dosyasını kontrol edin',
        projectUrl: null,
      });
      return;
    }

    testConnection();
  }, []);

  return status;
}

// Utility function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return !!(
    url &&
    key &&
    !url.includes('your-project') &&
    !key.includes('your-anon-key') &&
    url.startsWith('https://') &&
    url.includes('.supabase.co')
  );
}
