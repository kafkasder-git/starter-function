/**
 * @fileoverview useAIController Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { aiSystemController } from '../services/aiSystemController';

import { logger } from '../lib/logging/logger';
// 🎮 AI Kontrol Hook'u
// AI'ın uygulamayı kontrol edebilmesi için gerekli event handling

interface AIControllerState {
  isAIActive: boolean;
  lastAIAction: string | null;
  aiPermissions: string[];
  executionHistory: AIExecutionRecord[];
}

interface AIExecutionRecord {
  id: string;
  action: string;
  parameters: any;
  result: any;
  timestamp: Date;
  success: boolean;
  executionTime: number;
}

interface UseAIControllerOptions {
  enableNavigation?: boolean;
  enableDataOperations?: boolean;
  enableUIControl?: boolean;
  enableNotifications?: boolean;
  userPermissions?: string[];
  onAIAction?: (action: string, result: any) => void;
}

/**
 * useAIController function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useAIController(options: UseAIControllerOptions = {}) {
  const navigate = useNavigate();
  const [controllerState, setControllerState] = useState<AIControllerState>({
    isAIActive: false,
    lastAIAction: null,
    aiPermissions: options.userPermissions || ['basic'],
    executionHistory: [],
  });

  // 🎯 AI Navigation Handler
  const handleAINavigation = useCallback(
    (event: CustomEvent) => {
      if (!options.enableNavigation) return;

      const { module, page, subPage, params } = event.detail;

      try {
        // Route oluştur
        let route = `/${module}`;
        if (page) route += `/${page}`;
        if (subPage) route += `/${subPage}`;

        // Navigate
        navigate(route, { state: params });

        // Başarı bildirimi
        toast.success('AI Navigasyon', {
          description: `${module} modülüne yönlendiriliyor`,
        });

        // Execution history'e ekle
        const record: AIExecutionRecord = {
          id: Date.now().toString(),
          action: 'navigation',
          parameters: { module, page, subPage, params },
          result: { success: true, route },
          timestamp: new Date(),
          success: true,
          executionTime: 0,
        };

        setControllerState((prev) => ({
          ...prev,
          lastAIAction: 'navigation',
          executionHistory: [...prev.executionHistory.slice(-49), record],
        }));

        options.onAIAction?.('navigation', { module, page, route });
      } catch (error: any) {
        logger.error('AI Navigation hatası:', error);
        toast.error('Navigasyon hatası', {
          description: error.message,
        });
      }
    },
    [navigate, options],
  );

  // 🎮 AI Modal Control Handler
  const handleAIModalControl = useCallback(
    (event: CustomEvent) => {
      if (!options.enableUIControl) return;

      const { modalType, parameters } = event.detail;

      try {
        // Modal kontrolü için custom event dispatch
        const modalEvent = new CustomEvent(`modal-${modalType}`, {
          detail: { action: 'open', parameters },
        });

        window.dispatchEvent(modalEvent);

        toast.info('AI UI Kontrolü', {
          description: `${modalType} modalı açılıyor`,
        });

        options.onAIAction?.('modal_control', { modalType, parameters });
      } catch (error: any) {
        logger.error('AI Modal Control hatası:', error);
        toast.error('UI kontrol hatası');
      }
    },
    [options],
  );

  // 📝 AI Form Update Handler
  const handleAIFormUpdate = useCallback(
    (event: CustomEvent) => {
      if (!options.enableUIControl) return;

      const { formId, data } = event.detail;

      try {
        // Form güncelleme eventi
        const formEvent = new CustomEvent(`form-update-${formId}`, {
          detail: { data, source: 'ai' },
        });

        window.dispatchEvent(formEvent);

        toast.success('AI Form Güncellemesi', {
          description: 'Form AI tarafından güncellendi',
        });

        options.onAIAction?.('form_update', { formId, data });
      } catch (error: any) {
        logger.error('AI Form Update hatası:', error);
        toast.error('Form güncelleme hatası');
      }
    },
    [options],
  );

  // 📥 AI Download Handler
  const handleAIDownload = useCallback(
    (event: CustomEvent) => {
      const { type, parameters } = event.detail;

      try {
        // Download işlemini tetikle
        const downloadEvent = new CustomEvent(`trigger-download-${type}`, {
          detail: parameters,
        });

        window.dispatchEvent(downloadEvent);

        toast.success('AI İndirme', {
          description: `${type} dosyası hazırlanıyor`,
        });

        options.onAIAction?.('download', { type, parameters });
      } catch (error: any) {
        logger.error('AI Download hatası:', error);
        toast.error('İndirme hatası');
      }
    },
    [options],
  );

  // 🚀 AI Data Operation Handler
  const handleAIDataOperation = useCallback(
    async (event: CustomEvent) => {
      if (!options.enableDataOperations) return;

      const { operation, table, data, filters } = event.detail;

      try {
        setControllerState((prev) => ({ ...prev, isAIActive: true }));

        const startTime = Date.now();
        const result = await aiSystemController.executeAICommand(
          'execute_data_operation',
          { table, operation, data, filters },
          controllerState.aiPermissions,
        );

        const executionTime = Date.now() - startTime;

        // Execution history'e ekle
        const record: AIExecutionRecord = {
          id: Date.now().toString(),
          action: 'data_operation',
          parameters: { operation, table, data, filters },
          result,
          timestamp: new Date(),
          success: result.success,
          executionTime,
        };

        setControllerState((prev) => ({
          ...prev,
          isAIActive: false,
          lastAIAction: 'data_operation',
          executionHistory: [...prev.executionHistory.slice(-49), record],
        }));

        if (result.success) {
          toast.success('AI Veri İşlemi', {
            description: `${operation} işlemi başarıyla tamamlandı`,
          });
        }

        options.onAIAction?.('data_operation', result);
      } catch (error: any) {
        logger.error('AI Data Operation hatası:', error);
        setControllerState((prev) => ({ ...prev, isAIActive: false }));
        toast.error('Veri işlemi hatası', {
          description: error.message,
        });
      }
    },
    [controllerState.aiPermissions, options],
  );

  // 📊 AI Analytics Handler
  const handleAIAnalytics = useCallback(
    async (event: CustomEvent) => {
      const { module, analysisType, parameters } = event.detail;

      try {
        setControllerState((prev) => ({ ...prev, isAIActive: true }));

        const result = await aiSystemController.executeAICommand(
          'analyze_data',
          { module, analysisType, ...parameters },
          controllerState.aiPermissions,
        );

        setControllerState((prev) => ({ ...prev, isAIActive: false }));

        // Analiz sonucunu göster
        if (result.success) {
          toast.success('AI Analiz Tamamlandı', {
            description: `${module} modülü analiz edildi`,
          });

          // Analiz sonucunu detaylı göster
          const analysisEvent = new CustomEvent('show-ai-analysis', {
            detail: result.result,
          });
          window.dispatchEvent(analysisEvent);
        }

        options.onAIAction?.('analytics', result);
      } catch (error: any) {
        logger.error('AI Analytics hatası:', error);
        setControllerState((prev) => ({ ...prev, isAIActive: false }));
        toast.error('Analiz hatası', {
          description: error.message,
        });
      }
    },
    [controllerState.aiPermissions, options],
  );

  // 🎯 Event listener'ları kaydet
  useEffect(() => {
    // Navigation callback'i ayarla
    if (options.enableNavigation) {
      aiSystemController.setNavigationCallback((target) => {
        const event = new CustomEvent('ai-navigate', { detail: target });
        handleAINavigation(event as CustomEvent);
      });
    }

    // Event listener'ları ekle
    const eventHandlers = [
      { event: 'ai-navigate', handler: handleAINavigation },
      { event: 'ai-open-modal', handler: handleAIModalControl },
      { event: 'ai-close-modal', handler: handleAIModalControl },
      { event: 'ai-update-form', handler: handleAIFormUpdate },
      { event: 'ai-trigger-download', handler: handleAIDownload },
      { event: 'ai-data-operation', handler: handleAIDataOperation },
      { event: 'ai-analytics', handler: handleAIAnalytics },
    ];

    eventHandlers.forEach(({ event, handler }) => {
      window.addEventListener(event, handler as EventListener);
    });

    return () => {
      eventHandlers.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler as EventListener);
      });
    };
  }, [
    handleAINavigation,
    handleAIModalControl,
    handleAIFormUpdate,
    handleAIDownload,
    handleAIDataOperation,
    handleAIAnalytics,
    options,
  ]);

  // 🎯 AI komut çalıştır
  const executeAICommand = useCallback(
    async (actionId: string, parameters: any) => {
      try {
        setControllerState((prev) => ({ ...prev, isAIActive: true }));

        const startTime = Date.now();
        const result = await aiSystemController.executeAICommand(
          actionId,
          parameters,
          controllerState.aiPermissions,
        );

        const executionTime = Date.now() - startTime;

        // Execution history'e ekle
        const record: AIExecutionRecord = {
          id: Date.now().toString(),
          action: actionId,
          parameters,
          result,
          timestamp: new Date(),
          success: result.success,
          executionTime,
        };

        setControllerState((prev) => ({
          ...prev,
          isAIActive: false,
          lastAIAction: actionId,
          executionHistory: [...prev.executionHistory.slice(-49), record],
        }));

        return result;
      } catch (error: any) {
        setControllerState((prev) => ({ ...prev, isAIActive: false }));
        throw error;
      }
    },
    [controllerState.aiPermissions],
  );

  // 📊 AI istatistikleri al
  const getAIStats = useCallback(() => {
    const { executionHistory } = controllerState;
    const successfulActions = executionHistory.filter((record) => record.success);
    const avgExecutionTime =
      executionHistory.length > 0
        ? executionHistory.reduce((sum, record) => sum + record.executionTime, 0) /
          executionHistory.length
        : 0;

    return {
      totalActions: executionHistory.length,
      successfulActions: successfulActions.length,
      successRate:
        executionHistory.length > 0
          ? (successfulActions.length / executionHistory.length) * 100
          : 0,
      averageExecutionTime: avgExecutionTime,
      lastAction: controllerState.lastAIAction,
      isActive: controllerState.isAIActive,
    };
  }, [controllerState]);

  return {
    // State
    isAIActive: controllerState.isAIActive,
    lastAIAction: controllerState.lastAIAction,
    executionHistory: controllerState.executionHistory,

    // Actions
    executeAICommand,
    getAIStats,

    // Utils
    aiPermissions: controllerState.aiPermissions,
    setAIPermissions: (permissions: string[]) => {
      setControllerState((prev) => ({ ...prev, aiPermissions: permissions }));
    },
  };
}

export default useAIController;
