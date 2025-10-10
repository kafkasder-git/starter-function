/**
 * @fileoverview useAppwriteConnection Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { db, collections } from '../lib/database';
import { environment } from '../lib/environment';

import { logger } from '../lib/logging/logger';
interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  projectUrl: string | null;
}

/**
 * useAppwriteConnection function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useAppwriteConnection(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    projectUrl: null,
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection by listing user profiles
        const { data, error } = await db.list(collections.USER_PROFILES, []);

        if (error) {
          // If collection doesn't exist, that's still a valid connection
          if (error.message.includes('collection') || error.message.includes('not found')) {
            setStatus({
              isConnected: true,
              isLoading: false,
              error: 'Bağlantı başarılı - User profiles koleksiyonu henüz oluşturulmamış',
              projectUrl: environment.appwrite.endpoint,
            });
          } else {
            throw error;
          }
        } else {
          setStatus({
            isConnected: true,
            isLoading: false,
            error: null,
            projectUrl: environment.appwrite.endpoint,
          });
        }
      } catch (error: any) {
        logger.error('Appwrite connection test failed:', error);
        setStatus({
          isConnected: false,
          isLoading: false,
          error: error.message ?? 'Appwrite bağlantısı kurulamadı',
          projectUrl: null,
        });
      }
    };

    // Only test if we have valid config
    if (!isAppwriteConfigured()) {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: 'Appwrite konfigürasyonu eksik - .env dosyasını kontrol edin',
        projectUrl: null,
      });
      return;
    }

    testConnection();
  }, []);

  return status;
}

// Utility function to check if Appwrite is properly configured
/**
 * isAppwriteConfigured function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function isAppwriteConfigured(): boolean {
  const {endpoint, projectId} = environment.appwrite;

  return Boolean(endpoint &&
    projectId &&
    !endpoint.includes('your-endpoint') &&
    !projectId.includes('your-project-id') &&
    endpoint.startsWith('https://') &&
    endpoint.includes('.appwrite.io'));
}
