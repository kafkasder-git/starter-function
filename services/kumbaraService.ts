// 🏦 KUMBARA SERVICE
// Comprehensive service layer for Kumbara (Piggy Bank) management

import type {
  Kumbara,
  KumbaraAlert,
  KumbaraAnalytics,
  KumbaraCollection,
  KumbaraCollectionInsert,
  KumbaraDashboardStats,
  KumbaraFilters,
  KumbaraInsert,
  KumbaraQRData,
  KumbaraSearchResult,
  KumbaraUpdate,
} from '../types/kumbara';

/**
 * Enhanced Kumbara Service with modern TypeScript patterns
 * Implements comprehensive error handling and type safety
 */
class KumbaraService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = (import.meta?.env?.['VITE_API_URL']) || process.env['VITE_API_URL'] || 'http://localhost:3000/api';
    this.apiKey = (import.meta?.env?.['VITE_API_KEY']) || process.env['VITE_API_KEY'] || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
    };
  }

  /**
   * Enhanced error handling with proper typing
   */
  private handleError(error: unknown, operation: string): never {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

    console.error(`KumbaraService.${operation} error:`, error);
    throw new Error(`${operation} işlemi başarısız: ${errorMessage}`);
  }

  /**
   * Type-safe API request helper
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.defaultHeaders,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      this.handleError(error, 'API Request');
    }
  }

  // ==========================================
  // KUMBARA CRUD OPERATIONS
  // ==========================================

  /**
   * Get all kumbaras with filtering and pagination
   * Enhanced with proper error handling and type safety
   */
  async getKumbaras(filters: KumbaraFilters = {}): Promise<KumbaraSearchResult> {
    try {
      // Return empty data structure for clean start
      const emptyKumbaras: Kumbara[] = [];

      // Apply filters to empty data structure
      let filteredKumbaras = emptyKumbaras;

      if (filters.status && filters.status.length > 0) {
        filteredKumbaras = filteredKumbaras.filter((k) => filters.status!.includes(k.status));
      }

      if (filters.search_term) {
        const searchLower = filters.search_term.toLowerCase();
        filteredKumbaras = filteredKumbaras.filter(
          (k) =>
            k.name.toLowerCase().includes(searchLower) ||
            k.location.toLowerCase().includes(searchLower) ||
            k.code.toLowerCase().includes(searchLower),
        );
      }

      // Apply sorting
      if (filters.sort_by) {
        filteredKumbaras.sort((a, b) => {
          let aVal: any, bVal: any;

          switch (filters.sort_by) {
            case 'name':
              aVal = a.name;
              bVal = b.name;
              break;
            case 'location':
              aVal = a.location;
              bVal = b.location;
              break;
            case 'amount':
              aVal = a.totalAmount;
              bVal = b.totalAmount;
              break;
            case 'last_collection':
              aVal = new Date(a.lastCollection || 0);
              bVal = new Date(b.lastCollection || 0);
              break;
            default:
              aVal = a.created_at;
              bVal = b.created_at;
          }

          if (filters.sort_order === 'desc') {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
          }
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        });
      }

      return {
        kumbaras: filteredKumbaras,
        total_count: filteredKumbaras.length,
        page: 1,
        page_size: filteredKumbaras.length,
        total_pages: 1,
        filters_applied: filters,
      };
    } catch (error) {
      console.error('Error fetching kumbaras:', error);
      throw new Error('Kumbara listesi alınamadı');
    }
  }

  /**
   * Get single kumbara by ID
   */
  async getKumbara(id: string): Promise<Kumbara> {
    try {
      // Mock implementation - replace with real API call
      const kumbaras = await this.getKumbaras();
      const kumbara = kumbaras.kumbaras.find((k) => k.id === id);

      if (!kumbara) {
        throw new Error('Kumbara bulunamadı');
      }

      return kumbara;
    } catch (error) {
      console.error('Error fetching kumbara:', error);
      throw new Error('Kumbara bilgileri alınamadı');
    }
  }

  /**
   * Create new kumbara
   */
  async createKumbara(data: KumbaraInsert): Promise<Kumbara> {
    try {
      // Generate unique code if not provided
      const code = data.code || this.generateKumbaraCode();

      const newKumbara: Kumbara = {
        id: this.generateId(),
        code,
        name: data.name,
        location: data.location,
        address: data.address,
        status: data.status || 'active',
        installDate: data.installDate || new Date().toISOString().split('T')[0],
        lastCollection: null,
        totalAmount: 0,
        monthlyAverage: 0,
        qrCode: this.generateQRCode(code),
        contactPerson: data.contactPerson,
        phone: data.phone,
        notes: data.notes,
        coordinates: data.coordinates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: data.created_by,
      };

      // Mock API call - replace with real implementation
      return newKumbara;
    } catch (error) {
      console.error('Error creating kumbara:', error);
      throw new Error('Kumbara oluşturulamadı');
    }
  }

  /**
   * Update existing kumbara
   */
  async updateKumbara(id: string, data: KumbaraUpdate): Promise<Kumbara> {
    try {
      const existingKumbara = await this.getKumbara(id);

      const updatedKumbara: Kumbara = {
        ...existingKumbara,
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Mock API call - replace with real implementation
      return updatedKumbara;
    } catch (error) {
      console.error('Error updating kumbara:', error);
      throw new Error('Kumbara güncellenemedi');
    }
  }

  /**
   * Delete kumbara (soft delete)
   */
  async deleteKumbara(id: string, deletedBy: string): Promise<boolean> {
    try {
      // Mock API call - replace with real implementation
      return true;
    } catch (error) {
      console.error('Error deleting kumbara:', error);
      throw new Error('Kumbara silinemedi');
    }
  }

  // ==========================================
  // COLLECTION OPERATIONS
  // ==========================================

  /**
   * Record new collection
   */
  async recordCollection(data: KumbaraCollectionInsert): Promise<KumbaraCollection> {
    try {
      const newCollection: KumbaraCollection = {
        id: this.generateId(),
        kumbara_id: data.kumbara_id,
        collection_date: data.collection_date || new Date().toISOString(),
        amount: data.amount,
        currency: data.currency || 'TRY',
        collector_name: data.collector_name,
        collector_id: data.collector_id || '',
        notes: data.notes || '',
        witness_name: data.witness_name || '',
        witness_phone: data.witness_phone || '',
        verification_photos: data.verification_photos || [],
        weather_condition: data.weather_condition || '',
        collection_method: data.collection_method || 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: data.created_by,
      };

      // Mock API call - replace with real implementation
      return newCollection;
    } catch (error) {
      console.error('Error recording collection:', error);
      throw new Error('Toplama kaydı oluşturulamadı');
    }
  }

  /**
   * Get collections for a kumbara
   */
  async getCollections(kumbaraId: string, limit = 10): Promise<KumbaraCollection[]> {
    try {
      // 🔗 Gerçek API'den toplama kayıtları alınacak
      return [];
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw new Error('Toplama kayıtları alınamadı');
    }
  }

  // ==========================================
  // DASHBOARD AND ANALYTICS
  // ==========================================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<KumbaraDashboardStats> {
    try {
      const kumbaras = await this.getKumbaras();

      const stats: KumbaraDashboardStats = {
        total_kumbaras: kumbaras.kumbaras.length,
        active_kumbaras: kumbaras.kumbaras.filter((k) => k.status === 'active').length,
        inactive_kumbaras: kumbaras.kumbaras.filter((k) => k.status === 'inactive').length,
        maintenance_kumbaras: kumbaras.kumbaras.filter((k) => k.status === 'maintenance').length,
        total_collections_today: 5,
        total_amount_today: 450.75,
        total_collections_month: 45,
        total_amount_month: 12500.25,
        top_performing_kumbaras: kumbaras.kumbaras
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 5)
          .map((k) => ({
            id: k.id,
            name: k.name,
            location: k.location,
            amount: k.totalAmount,
            collections: 0, // Gerçek veri API'den gelecek
          })),
        recent_collections: [], // Gerçek veri API'den gelecek
        maintenance_alerts: kumbaras.kumbaras
          .filter((k) => k.status === 'maintenance')
          .map((k) => ({
            kumbara_id: k.id,
            kumbara_name: k.name,
            issue: k.notes || 'Bakım gerekli',
            priority: 'medium' as const,
          })),
        performance_trends: [
          { date: '2024-01-01', total_amount: 1000, collection_count: 10 },
          { date: '2024-01-02', total_amount: 1200, collection_count: 12 },
          { date: '2024-01-03', total_amount: 950, collection_count: 8 },
        ],
      };

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Dashboard istatistikleri alınamadı');
    }
  }

  /**
   * Get analytics for a specific kumbara
   */
  async getKumbaraAnalytics(
    kumbaraId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<KumbaraAnalytics> {
    try {
      // Mock analytics data - replace with real API call
      const analytics: KumbaraAnalytics = {
        kumbara_id: kumbaraId,
        period_start: periodStart,
        period_end: periodEnd,
        total_collections: 25,
        total_amount: 2500.75,
        average_amount: 100.03,
        collection_frequency: 3, // days
        performance_score: 85,
        trend: 'increasing',
        peak_months: ['Aralık', 'Ocak'],
        low_months: ['Temmuz', 'Ağustos'],
        recommendations: [
          'Koleksiyon sıklığı artırılabilir',
          'QR kod tanıtımı yapılabilir',
          'Lokasyon trafiği incelenmeli',
        ],
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching kumbara analytics:', error);
      throw new Error('Kumbara analitikleri alınamadı');
    }
  }

  // ==========================================
  // QR CODE OPERATIONS
  // ==========================================

  /**
   * Generate QR code data for kumbara
   */
  generateQRData(kumbara: Kumbara): KumbaraQRData {
    return {
      kumbaraId: kumbara.id,
      code: kumbara.code,
      name: kumbara.name,
      location: kumbara.location,
      url: `https://bagis.dernek.org/kumbara/${kumbara.code}`,
      donationUrl: `https://bagis.dernek.org/donate/kumbara/${kumbara.code}`,
      contactInfo: {
        phone: kumbara.phone || '',
        person: kumbara.contactPerson || '',
      },
      metadata: {
        installDate: kumbara.installDate,
        lastUpdated: kumbara.updated_at,
        version: '1.0',
      },
    };
  }

  /**
   * Generate printable QR code HTML
   */
  generatePrintableQR(kumbara: Kumbara): string {
    const qrData = this.generateQRData(kumbara);

    return `
      <html>
        <head>
          <title>Kumbara QR Kod - ${kumbara.code}</title>
          <style>
            @page { size: 40mm 30mm; margin: 2mm; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 26mm;
              width: 36mm;
            }
            .qr-container {
              text-align: center;
              border: 1px solid #ddd;
              padding: 2mm;
              border-radius: 2mm;
            }
            .qr-placeholder {
              width: 20mm;
              height: 20mm;
              border: 2px solid #333;
              margin: 0 auto 1mm auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              background: #f9f9f9;
            }
            .qr-info {
              font-size: 6px;
              margin: 0;
              line-height: 1.2;
            }
            .qr-code {
              font-weight: bold;
              margin-bottom: 0.5mm;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-placeholder">QR KOD</div>
            <div class="qr-info qr-code">${kumbara.code}</div>
            <div class="qr-info">${kumbara.name}</div>
            <div class="qr-info">${kumbara.location}</div>
          </div>
        </body>
      </html>
    `;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Generate unique kumbara code
   */
  private generateKumbaraCode(): string {
    const prefix = 'KMB';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate QR code string
   */
  private generateQRCode(code: string): string {
    return `QR-${code}-${new Date().getFullYear()}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validate kumbara data
   */
  validateKumbaraData(data: KumbaraInsert): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push('Kumbara adı en az 3 karakter olmalıdır');
    }

    if (!data.location || data.location.trim().length < 3) {
      errors.push('Lokasyon en az 3 karakter olmalıdır');
    }

    if (!data.address || data.address.trim().length < 10) {
      errors.push('Adres en az 10 karakter olmalıdır');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Geçerli bir telefon numarası giriniz');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate phone number
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Export kumbara data
   */
  async exportKumbaras(format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const kumbaras = await this.getKumbaras();

      if (format === 'csv') {
        const csvContent = this.generateCSV(kumbaras.kumbaras);
        return new Blob([csvContent], { type: 'text/csv' });
      }

      // For other formats, implement accordingly
      throw new Error(`${format} formatı henüz desteklenmiyor`);
    } catch (error) {
      console.error('Error exporting kumbaras:', error);
      throw new Error('Kumbara verileri dışa aktarılamadı');
    }
  }

  /**
   * Generate CSV content
   */
  private generateCSV(kumbaras: Kumbara[]): string {
    const headers = [
      'Kod',
      'İsim',
      'Lokasyon',
      'Adres',
      'Durum',
      'Kurulum Tarihi',
      'Son Toplama',
      'Toplam Tutar',
      'Aylık Ortalama',
      'İletişim Kişisi',
      'Telefon',
      'Notlar',
    ];

    const rows = kumbaras.map((k) => [
      k.code,
      k.name,
      k.location,
      k.address,
      k.status,
      k.installDate,
      k.lastCollection || '',
      k.totalAmount.toString(),
      k.monthlyAverage.toString(),
      k.contactPerson || '',
      k.phone || '',
      k.notes || '',
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  }

  // ==========================================
  // ALERT AND NOTIFICATION METHODS
  // ==========================================

  /**
   * Get alerts for kumbaras
   */
  async getKumbaraAlerts(): Promise<KumbaraAlert[]> {
    try {
      // Mock alerts - replace with real API call
      const alerts: KumbaraAlert[] = [
        {
          id: '1',
          kumbara_id: '3',
          alert_type: 'maintenance_due',
          severity: 'warning',
          title: 'Bakım Gerekli',
          message: 'Market Kumbarası kilit arızası nedeniyle bakım gerektiriyor',
          action_required: true,
          action_url: '/kumbara/3/maintenance',
          acknowledged: false,
          resolved: false,
          created_at: new Date().toISOString(),
        },
      ];

      return alerts;
    } catch (error) {
      console.error('Error fetching kumbara alerts:', error);
      throw new Error('Kumbara uyarıları alınamadı');
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    try {
      // Mock API call - replace with real implementation
      return true;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw new Error('Uyarı onaylanamadı');
    }
  }
}

// Export singleton instance
export const kumbaraService = new KumbaraService();
export default kumbaraService;
