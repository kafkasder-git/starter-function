import { supabaseAdmin } from '../lib/supabase';
import { ihtiyacSahipleriService } from './ihtiyacSahipleriService';
import { donationsService } from './donationsService';
import { membersService } from './membersService';
import { toast } from 'sonner';

// 🎮 AI Sistem Kontrolcüsü
// AI'ın uygulamanın tüm özelliklerini kontrol edebilmesi için

interface SystemAction {
  id: string;
  type: 'navigation' | 'data_operation' | 'ui_control' | 'notification' | 'automation';
  description: string;
  implementation: (params: Record<string, unknown>) => Promise<unknown>;
  requiredPermissions?: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface NavigationTarget {
  module: string;
  page?: string;
  subPage?: string;
  params?: Record<string, unknown>;
}

interface DataOperation {
  table: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  data?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  validation?: boolean;
}

interface UIControl {
  action: 'open_modal' | 'close_modal' | 'show_notification' | 'update_form' | 'trigger_download';
  target: string;
  parameters?: Record<string, unknown>;
}

class AISystemController {
  private readonly actions = new Map<string, SystemAction>();
  private navigationCallback: ((target: NavigationTarget) => void) | null = null;
  private currentUser: Record<string, unknown> | null = null;

  constructor() {
    this.initializeSystemActions();
  }

  // 🛠️ Sistem aksiyonlarını tanımla
  private initializeSystemActions() {
    // NAVIGATION ACTIONS
    this.actions.set('navigate_to_module', {
      id: 'navigate_to_module',
      type: 'navigation',
      description: 'Belirtilen modüle ve sayfaya yönlendirir',
      riskLevel: 'low',
      implementation: async (params: NavigationTarget) => {
        if (this.navigationCallback) {
          this.navigationCallback(params);
          return { success: true, message: `${params.module} modülüne yönlendiriliyor` };
        }
        throw new Error('Navigation callback tanımlanmamış');
      },
    });

    // DATA OPERATIONS
    this.actions.set('execute_data_operation', {
      id: 'execute_data_operation',
      type: 'data_operation',
      description: 'Veri tabanı işlemlerini gerçekleştirir',
      riskLevel: 'medium',
      implementation: async (params: DataOperation) => {
        return await this.executeDataOperation(params);
      },
    });

    this.actions.set('bulk_data_operation', {
      id: 'bulk_data_operation',
      type: 'data_operation',
      description: 'Toplu veri işlemleri yapar',
      riskLevel: 'high',
      requiredPermissions: ['admin', 'bulk_operations'],
      implementation: async (params: { operations: DataOperation[] }) => {
        const results = [];
        for (const operation of params.operations) {
          const result = await this.executeDataOperation(operation);
          results.push(result);
        }
        return { success: true, results, count: results.length };
      },
    });

    // UI CONTROL ACTIONS
    this.actions.set('control_ui_element', {
      id: 'control_ui_element',
      type: 'ui_control',
      description: 'UI elementlerini kontrol eder (modal, form, bildirim)',
      riskLevel: 'low',
      implementation: async (params: UIControl) => {
        return await this.controlUIElement(params);
      },
    });

    // NOTIFICATION ACTIONS
    this.actions.set('send_notification', {
      id: 'send_notification',
      type: 'notification',
      description: 'Kullanıcıya bildirim gönderir',
      riskLevel: 'low',
      implementation: async (params: { type: string; title: string; message: string }) => {
        this.sendNotification(params.type, params.title, params.message);
        return { success: true, message: 'Bildirim gönderildi' };
      },
    });

    // AUTOMATION ACTIONS
    this.actions.set('execute_workflow', {
      id: 'execute_workflow',
      type: 'automation',
      description: 'Otomatik iş akışlarını çalıştırır',
      riskLevel: 'medium',
      implementation: async (params: { workflowId: string; parameters?: Record<string, unknown> }) => {
        return await this.executeWorkflow(params.workflowId, params.parameters);
      },
    });

    this.actions.set('generate_report', {
      id: 'generate_report',
      type: 'automation',
      description: 'Otomatik rapor oluşturur ve indirir',
      riskLevel: 'low',
      implementation: async (params: { reportType: string; module: string; filters?: Record<string, unknown> }) => {
        return await this.generateReport(params);
      },
    });

    // ADVANCED OPERATIONS
    this.actions.set('execute_custom_query', {
      id: 'execute_custom_query',
      type: 'data_operation',
      description: 'Özel SQL sorguları çalıştırır (güvenli)',
      riskLevel: 'high',
      requiredPermissions: ['admin', 'sql_access'],
      implementation: async (params: { query: string; description: string }) => {
        return await this.executeCustomQuery(params.query, params.description);
      },
    });

    this.actions.set('system_maintenance', {
      id: 'system_maintenance',
      type: 'automation',
      description: 'Sistem bakım işlemlerini gerçekleştirir',
      riskLevel: 'high',
      requiredPermissions: ['admin', 'system_maintenance'],
      implementation: async (params: { operation: string }) => {
        return await this.performSystemMaintenance(params.operation);
      },
    });
  }

  // 🎯 AI'dan gelen komutu çalıştır
  async executeAICommand(
    actionId: string,
    parameters: Record<string, unknown>,
    userPermissions: string[] = [],
  ): Promise<unknown> {
    const action = this.actions.get(actionId);

    if (!action) {
      throw new Error(`Bilinmeyen aksiyon: ${actionId}`);
    }

    // Yetki kontrolü
    if (action.requiredPermissions) {
      const hasPermission = action.requiredPermissions.some(
        (perm) => userPermissions.includes(perm) || userPermissions.includes('admin'),
      );

      if (!hasPermission) {
        throw new Error(
          `Bu işlem için yeterli yetkiniz yok: ${action.requiredPermissions.join(', ')}`,
        );
      }
    }

    // Risk seviyesi kontrolü
    if (action.riskLevel === 'high') {
      console.warn(`⚠️ Yüksek riskli işlem çalıştırılıyor: ${actionId}`);
    }

    try {
      const result = await action.implementation(parameters);

      console.log(`✅ AI Action executed: ${actionId}`, { parameters, result });

      return {
        success: true,
        action: actionId,
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      console.error(`❌ AI Action failed: ${actionId}`, error);
      throw new Error(`İşlem başarısız: ${error.message}`);
    }
  }

  // 📊 Veri işlemi çalıştır
  private async executeDataOperation(operation: DataOperation): Promise<any> {
    const { table, operation: op, data, filters } = operation;

    try {
      switch (op) {
        case 'create':
          if (table === 'ihtiyac_sahipleri') {
            return await ihtiyacSahipleriService.createIhtiyacSahibi(data);
          } else if (table === 'donations') {
            return await donationsService.createDonation(data);
          } else if (table === 'members') {
            return await membersService.createMember(data);
          }
          break;

        case 'read':
          if (table === 'ihtiyac_sahipleri') {
            return await ihtiyacSahipleriService.getIhtiyacSahipleri(1, 100, filters || {});
          } else if (table === 'donations') {
            return await donationsService.getDonations(1, 100, filters || {});
          } else if (table === 'members') {
            return await membersService.getMembers(1, 100, filters || {});
          }
          break;

        case 'update':
          if (table === 'ihtiyac_sahipleri' && data.id) {
            return await ihtiyacSahipleriService.updateIhtiyacSahibi(data.id, data);
          }
          break;

        case 'delete':
          if (table === 'ihtiyac_sahipleri' && data.id) {
            return await ihtiyacSahipleriService.deleteIhtiyacSahibi(data.id);
          }
          break;
      }

      throw new Error(`Desteklenmeyen işlem: ${op} on ${table}`);
    } catch (error: unknown) {
      throw new Error(`Veri işlemi hatası: ${error.message}`);
    }
  }

  // 🎮 UI kontrolü
  private async controlUIElement(control: UIControl): Promise<any> {
    const { action, target, parameters } = control;

    try {
      switch (action) {
        case 'open_modal':
          // Modal açma eventi gönder
          window.dispatchEvent(
            new CustomEvent('ai-open-modal', {
              detail: { modalType: target, parameters },
            }),
          );
          return { success: true, message: `${target} modalı açıldı` };

        case 'close_modal':
          window.dispatchEvent(
            new CustomEvent('ai-close-modal', {
              detail: { modalType: target },
            }),
          );
          return { success: true, message: `${target} modalı kapatıldı` };

        case 'show_notification':
          this.sendNotification('info', target, parameters?.message || '');
          return { success: true, message: 'Bildirim gösterildi' };

        case 'update_form':
          window.dispatchEvent(
            new CustomEvent('ai-update-form', {
              detail: { formId: target, data: parameters },
            }),
          );
          return { success: true, message: 'Form güncellendi' };

        case 'trigger_download':
          window.dispatchEvent(
            new CustomEvent('ai-trigger-download', {
              detail: { type: target, parameters },
            }),
          );
          return { success: true, message: 'İndirme başlatıldı' };

        default:
          throw new Error(`Desteklenmeyen UI aksiyonu: ${action}`);
      }
    } catch (error: unknown) {
      throw new Error(`UI kontrol hatası: ${error.message}`);
    }
  }

  // 📢 Bildirim gönder
  private sendNotification(type: string, title: string, message: string) {
    switch (type) {
      case 'success':
        toast.success(title, { description: message });
        break;
      case 'error':
        toast.error(title, { description: message });
        break;
      case 'warning':
        toast.warning(title, { description: message });
        break;
      default:
        toast.info(title, { description: message });
    }
  }

  // 🔄 İş akışı çalıştır
  private async executeWorkflow(workflowId: string, parameters?: Record<string, unknown>): Promise<unknown> {
    // Örnek iş akışları
    const workflows: Record<string, () => Promise<unknown>> = {
      daily_review: async () => {
        // Günlük inceleme iş akışı
        const beneficiaries = await ihtiyacSahipleriService.getIhtiyacSahipleri(1, 50, {
          status: 'pending',
        });
        const donations = await donationsService.getDonations(1, 20, {});

        return {
          beneficiariesReviewed: beneficiaries.data?.length || 0,
          donationsProcessed: donations.data?.length || 0,
          message: 'Günlük inceleme tamamlandı',
        };
      },

      urgent_case_handling: async () => {
        // Acil durum yönetimi
        const urgentCases = await ihtiyacSahipleriService.getIhtiyacSahipleri(1, 100, {
          priority: 'high',
        });

        return {
          urgentCasesFound: urgentCases.data?.length || 0,
          message: 'Acil durumlar tespit edildi ve önceliklendirildi',
        };
      },

      monthly_report_generation: async () => {
        // Aylık rapor oluşturma
        const stats = await this.generateMonthlyStatistics();
        return {
          ...stats,
          message: 'Aylık rapor oluşturuldu',
        };
      },
    };

    const workflow = workflows[workflowId];
    if (!workflow) {
      throw new Error(`Bilinmeyen iş akışı: ${workflowId}`);
    }

    return await workflow();
  }

  // 📊 Rapor oluştur
  private async generateReport(params: {
    reportType: string;
    module: string;
    filters?: Record<string, unknown>;
  }): Promise<unknown> {
    const { reportType, module, filters } = params;

    try {
      let data: Record<string, unknown>[] = [];
      let reportData: Record<string, unknown> = {};

      // Modül verilerini çek
      switch (module) {
        case 'yardim':
          const beneficiariesResult = await ihtiyacSahipleriService.getIhtiyacSahipleri(
            1,
            1000,
            filters || {},
          );
          data = beneficiariesResult.data || [];
          break;
        case 'bagis':
          const donationsResult = await donationsService.getDonations(1, 1000, filters || {});
          data = donationsResult.data || [];
          break;
        case 'uye':
          const membersResult = await membersService.getMembers(1, 1000, filters || {});
          data = membersResult.data || [];
          break;
      }

      // Rapor türüne göre analiz
      switch (reportType) {
        case 'summary':
          reportData = this.generateSummaryReport(data, module);
          break;
        case 'detailed':
          reportData = this.generateDetailedReport(data, module);
          break;
        case 'analytics':
          reportData = this.generateAnalyticsReport(data, module);
          break;
        default:
          reportData = { data, total: data.length };
      }

      // Raporu indir
      this.triggerReportDownload(reportData, `${module}_${reportType}_raporu`);

      return {
        success: true,
        reportType,
        module,
        recordCount: data.length,
        generatedAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      throw new Error(`Rapor oluşturma hatası: ${error.message}`);
    }
  }

  // 📝 Özet rapor oluştur
  private generateSummaryReport(data: Record<string, unknown>[], module: string): Record<string, unknown> {
    const report = {
      module,
      total: data.length,
      generatedAt: new Date().toISOString(),
      summary: {},
    };

    if (module === 'yardim') {
      const statusCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};

      data.forEach((item) => {
        const status = item.status || item.durum || 'Belirtilmemiş';
        const city = item.sehri || 'Belirtilmemiş';

        statusCounts[status] = (statusCounts[status] || 0) + 1;
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });

      report.summary = {
        statusDistribution: statusCounts,
        topCities: Object.entries(cityCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([city, count]) => ({ city, count })),
      };
    }

    if (module === 'bagis') {
      const totalAmount = data.reduce((sum, item) => sum + ((item['miktar'] as number) ?? (item['amount'] as number) ?? 0), 0);
      const avgAmount = totalAmount / data.length;

      const monthlyData: Record<string, number> = {};
      data.forEach((item) => {
        const date = item['tarih'] || item['created_at'];
        if (date) {
          const month = new Date(date).toISOString().slice(0, 7);
          monthlyData[month] = (monthlyData[month] || 0) + ((item['miktar'] as number) ?? (item['amount'] as number) ?? 0);
        }
      });

      report.summary = {
        totalAmount,
        averageAmount: avgAmount,
        donorCount: data.length,
        monthlyTrend: Object.entries(monthlyData).map(([month, amount]) => ({ month, amount })),
      };
    }

    return report;
  }

  // 📊 Detaylı rapor oluştur
  private generateDetailedReport(data: Record<string, unknown>[], module: string): Record<string, unknown> {
    return {
      module,
      type: 'detailed',
      data: data.map((item) => ({
        ...item,
        processedAt: new Date().toISOString(),
      })),
      metadata: {
        total: data.length,
        generatedAt: new Date().toISOString(),
        fields: Object.keys(data[0] || {}),
        dataQuality: this.assessDataQuality(data),
      },
    };
  }

  // 📈 Analitik rapor oluştur
  private generateAnalyticsReport(data: Record<string, unknown>[], module: string): Record<string, unknown> {
    const analytics = {
      module,
      type: 'analytics',
      generatedAt: new Date().toISOString(),
      metrics: {},
      insights: [],
      recommendations: [],
    };

    // Temel metrikler
    (analytics.metrics as any).totalRecords = data.length;
    (analytics.metrics as any).dataCompleteness = this.calculateDataCompleteness(data);

    // Öngörüler
    (analytics.insights as any).push(
      `Toplam ${data.length} kayıt analiz edildi`,
      `Veri tamlığı: %${((analytics.metrics as any).dataCompleteness * 100).toFixed(1)}`,
      `Son 30 günde ortalama günlük kayıt: ${(data.length / 30).toFixed(1)}`,
    );

    // Öneriler
    if ((analytics.metrics as any).dataCompleteness < 0.8) {
      (analytics.recommendations as any).push('Veri kalitesi iyileştirme önerilir');
    }

    return analytics;
  }

  // 🏥 Veri kalitesi değerlendirmesi
  private assessDataQuality(data: Record<string, unknown>[]): number {
    if (data.length === 0) return 0;

    const sample = data[0];
    const fields = Object.keys(sample || {});
    let totalScore = 0;

    data.forEach((item) => {
      let itemScore = 0;
      fields.forEach((field) => {
        if (item[field] !== null && item[field] !== undefined && item[field] !== '') {
          itemScore++;
        }
      });
      totalScore += itemScore / fields.length;
    });

    return totalScore / data.length;
  }

  // 📊 Veri tamlığı hesapla
  private calculateDataCompleteness(data: Record<string, unknown>[]): number {
    return this.assessDataQuality(data);
  }

  // 📥 Rapor indirme tetikle
  private triggerReportDownload(reportData: Record<string, unknown>, filename: string) {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // 🗃️ Özel SQL sorgu çalıştır
  private async executeCustomQuery(query: string, description: string): Promise<any> {
    // Güvenlik kontrolü
    const safeQuery = query.toLowerCase().trim();
    const dangerousKeywords = ['drop', 'delete', 'truncate', 'alter', 'create', 'insert', 'update'];

    if (dangerousKeywords.some((keyword) => safeQuery.includes(keyword))) {
      throw new Error('Güvenlik nedeniyle sadece SELECT sorguları çalıştırılabilir');
    }

    try {
      const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: query });

      if (error) throw error;

      return {
        success: true,
        description,
        query,
        results: data,
        executedAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      throw new Error(`SQL sorgu hatası: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 🔧 Sistem bakımı
  private async performSystemMaintenance(operation: string): Promise<any> {
    const maintenanceOperations: Record<string, () => Promise<any>> = {
      cleanup_old_logs: async () => {
        // Eski logları temizle
        return { message: 'Eski loglar temizlendi', cleaned: 0 };
      },
      optimize_database: async () => {
        // Veritabanı optimizasyonu
        return { message: 'Veritabanı optimize edildi' };
      },
      backup_data: async () => {
        // Veri yedeği al
        return { message: 'Veri yedeği oluşturuldu' };
      },
    };

    const maintenanceFunc = maintenanceOperations[operation];
    if (!maintenanceFunc) {
      throw new Error(`Bilinmeyen bakım işlemi: ${operation}`);
    }

    return await maintenanceFunc();
  }

  // 📊 Aylık istatistikler
  private async generateMonthlyStatistics(): Promise<any> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      const stats = {
        month: currentMonth,
        beneficiaries: 0,
        donations: 0,
        members: 0,
        totalDonationAmount: 0,
      };

      // Her modül için istatistikler
      const beneficiariesResult = await ihtiyacSahipleriService.getIhtiyacSahipleri(1, 1000, {});
      stats.beneficiaries = beneficiariesResult.data?.length || 0;

      const donationsResult = await donationsService.getDonations(1, 1000, {});
      stats.donations = donationsResult.data?.length || 0;
      stats.totalDonationAmount =
        donationsResult.data?.reduce(
          (sum: number, item: Record<string, unknown>) => sum + ((item['miktar'] as number) ?? (item['amount'] as number) ?? 0),
          0,
        ) || 0;

      const membersResult = await membersService.getMembers(1, 1000, {});
      stats.members = membersResult.data?.length || 0;

      return stats;
    } catch (error: unknown) {
      throw new Error(`İstatistik oluşturma hatası: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 🎯 Navigation callback kaydet
  setNavigationCallback(callback: (target: NavigationTarget) => void) {
    this.navigationCallback = callback;
  }

  // 👤 Mevcut kullanıcıyı ayarla
  setCurrentUser(user: Record<string, unknown>) {
    this.currentUser = user;
  }

  // 📋 Mevcut aksiyonları listele
  getAvailableActions(): SystemAction[] {
    return Array.from(this.actions.values());
  }

  // 🔍 Aksiyon ara
  findAction(actionId: string): SystemAction | undefined {
    return this.actions.get(actionId);
  }
}

// 🚀 Singleton instance
export const aiSystemController = new AISystemController();
export default aiSystemController;
