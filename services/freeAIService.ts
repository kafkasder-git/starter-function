import { ihtiyacSahipleriService } from './ihtiyacSahipleriService';
import { donationsService } from './donationsService';
import { membersService } from './membersService';

// 🆓 Ücretsiz AI Servisi
// Hugging Face, Ollama ve diğer ücretsiz AI provider'ları

interface FreeAIConfig {
  provider: 'huggingface' | 'ollama' | 'local' | 'groq' | 'cohere';
  model: string;
  apiEndpoint: string;
  apiKey?: string; // Bazı ücretsiz servisler için
  maxTokens: number;
  temperature: number;
}

interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  confidence: number;
  executionTime: number;
  provider: string;
}

class FreeAIService {
  private config: FreeAIConfig;
  private conversationHistory: any[] = [];

  constructor() {
    this.config = {
      provider: 'openrouter',
      model: 'microsoft/phi-3-mini-128k-instruct:free',
      apiEndpoint: 'https://openrouter.ai/api/v1',
      apiKey: (import.meta?.env?.VITE_OPENROUTER_API_KEY) || process.env.VITE_OPENROUTER_API_KEY || '',
      maxTokens: 1000,
      temperature: 0.7,
    };

    this.initializeSystemPrompt();
  }

  // 🎯 Sistem prompt'ını başlat
  private initializeSystemPrompt() {
    const systemPrompt = `Sen bir dernek yönetim sistemi AI asistanısın. Adın "Dernek AI" ve Türkçe konuşuyorsun.

GÖREV: Kullanıcının dernek yönetim sistemindeki işlemlerini yapabilir, veri analizi yapabilir ve yardımcı olabilirsin.

YETENEKLER:
- İhtiyaç sahipleri yönetimi
- Bağış yönetimi  
- Üye yönetimi
- Veri analizi
- Sistem yönlendirme
- Türkçe dil desteği

KULLANIM PRENSİPLERİ:
1. Her zaman Türkçe yanıt ver
2. Kısa ve net ol
3. Kullanıcı dostu ol
4. Pratik öneriler sun
5. Güvenli işlemler yap

Kullanıcı isteklerini analiz et ve uygun yanıtlar ver.`;

    this.conversationHistory = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];
  }

  // 🚀 Ana AI işleme fonksiyonu
  async processWithFreeAI(userInput: string, context?: any): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Komut analizi yap
      const commandAnalysis = this.analyzeCommand(userInput);

      // Eğer sistem komutu ise direkt çalıştır
      if (commandAnalysis.isSystemCommand) {
        const result = await this.executeSystemCommand(commandAnalysis);
        return {
          success: true,
          message: result.message,
          data: result.data,
          confidence: 95,
          executionTime: Date.now() - startTime,
          provider: this.config.provider,
        };
      }

      // AI yanıtı için ücretsiz provider'ı çağır
      const aiResponse = await this.callFreeAI(userInput, context);

      return {
        success: true,
        message: aiResponse,
        confidence: 85,
        executionTime: Date.now() - startTime,
        provider: this.config.provider,
      };
    } catch (error: any) {
      console.error('Ücretsiz AI işleme hatası:', error);

      // Fallback yanıt
      const fallbackResponse = this.generateFallbackResponse(userInput);

      return {
        success: true,
        message: fallbackResponse,
        confidence: 60,
        executionTime: Date.now() - startTime,
        provider: 'fallback',
      };
    }
  }

  // 📝 Komut analizi
  private analyzeCommand(input: string): any {
    const lowerInput = input.toLowerCase();

    // Sistem komutları
    const systemCommands = {
      // Listeleme komutları
      'ihtiyaç sahiplerini listele': { action: 'list', module: 'beneficiaries' },
      'yardım başvurularını göster': { action: 'list', module: 'beneficiaries' },
      'bağışları listele': { action: 'list', module: 'donations' },
      'bağışçıları göster': { action: 'list', module: 'donations' },
      'üyeleri listele': { action: 'list', module: 'members' },
      'üye listesi': { action: 'list', module: 'members' },

      // Analiz komutları
      'bağışları analiz et': { action: 'analyze', module: 'donations' },
      'üye analizini yap': { action: 'analyze', module: 'members' },
      'sistem durumunu kontrol et': { action: 'status', module: 'system' },

      // Navigasyon komutları
      'bağışlar sayfasına git': { action: 'navigate', module: 'donations', page: 'list' },
      'üyeler sayfasına git': { action: 'navigate', module: 'members', page: 'list' },
      'ihtiyaç sahipleri sayfasına git': {
        action: 'navigate',
        module: 'beneficiaries',
        page: 'list',
      },
      'ana sayfaya git': { action: 'navigate', module: 'dashboard', page: 'home' },
    };

    // Tam eşleşme ara
    for (const [command, config] of Object.entries(systemCommands)) {
      if (lowerInput.includes(command)) {
        return {
          isSystemCommand: true,
          ...config,
          originalInput: input,
        };
      }
    }

    // Anahtar kelime bazlı analiz
    if (lowerInput.includes('listele') || lowerInput.includes('göster')) {
      if (lowerInput.includes('bağış')) {
        return { isSystemCommand: true, action: 'list', module: 'donations' };
      }
      if (lowerInput.includes('üye')) {
        return { isSystemCommand: true, action: 'list', module: 'members' };
      }
      if (lowerInput.includes('ihtiyaç') || lowerInput.includes('yardım')) {
        return { isSystemCommand: true, action: 'list', module: 'beneficiaries' };
      }
    }

    if (lowerInput.includes('analiz')) {
      if (lowerInput.includes('bağış')) {
        return { isSystemCommand: true, action: 'analyze', module: 'donations' };
      }
      if (lowerInput.includes('üye')) {
        return { isSystemCommand: true, action: 'analyze', module: 'members' };
      }
    }

    if (lowerInput.includes('git') || lowerInput.includes('aç')) {
      if (lowerInput.includes('bağış')) {
        return { isSystemCommand: true, action: 'navigate', module: 'donations' };
      }
      if (lowerInput.includes('üye')) {
        return { isSystemCommand: true, action: 'navigate', module: 'members' };
      }
      if (lowerInput.includes('ana sayfa') || lowerInput.includes('dashboard')) {
        return { isSystemCommand: true, action: 'navigate', module: 'dashboard' };
      }
    }

    return { isSystemCommand: false };
  }

  // ⚡ Sistem komutu çalıştır
  private async executeSystemCommand(command: any): Promise<any> {
    const { action, module } = command;

    try {
      switch (action) {
        case 'list':
          return await this.executeListCommand(module);

        case 'analyze':
          return await this.executeAnalyzeCommand(module);

        case 'navigate':
          return this.executeNavigateCommand(module, command.page);

        case 'status':
          return await this.executeStatusCommand();

        default:
          return {
            message: 'Bu komutu henüz desteklemiyorum.',
            data: null,
          };
      }
    } catch (error: any) {
      return {
        message: `Komut çalıştırılırken hata oluştu: ${error.message}`,
        data: null,
      };
    }
  }

  // 📋 Listeleme komutu
  private async executeListCommand(module: string): Promise<any> {
    switch (module) {
      case 'beneficiaries':
        const beneficiaries = await ihtiyacSahipleriService.getIhtiyacSahipleri(1, 10, {});
        return {
          message: `✅ ${beneficiaries.data?.length || 0} ihtiyaç sahibi listelendi.\n\n${this.formatBeneficiariesList(beneficiaries.data || [])}`,
          data: beneficiaries.data,
        };

      case 'donations':
        const donations = await donationsService.getDonations(1, 10, {});
        return {
          message: `✅ ${donations.data?.length || 0} bağış kaydı listelendi.\n\n${this.formatDonationsList(donations.data || [])}`,
          data: donations.data,
        };

      case 'members':
        const members = await membersService.getMembers(1, 10, {});
        return {
          message: `✅ ${members.data?.length || 0} üye listelendi.\n\n${this.formatMembersList(members.data || [])}`,
          data: members.data,
        };

      default:
        return {
          message: 'Bu modül için listeleme desteklenmiyor.',
          data: null,
        };
    }
  }

  // 📊 Analiz komutu
  private async executeAnalyzeCommand(module: string): Promise<any> {
    switch (module) {
      case 'donations':
        const donations = await donationsService.getDonations(1, 100, {});
        const analysis = this.analyzeDonations(donations.data || []);
        return {
          message: `📊 Bağış Analizi:\n\n${analysis}`,
          data: donations.data,
        };

      case 'members':
        const members = await membersService.getMembers(1, 100, {});
        const memberAnalysis = this.analyzeMembers(members.data || []);
        return {
          message: `📊 Üye Analizi:\n\n${memberAnalysis}`,
          data: members.data,
        };

      default:
        return {
          message: 'Bu modül için analiz desteklenmiyor.',
          data: null,
        };
    }
  }

  // 🧭 Navigasyon komutu
  private executeNavigateCommand(module: string, page?: string): any {
    const routes: Record<string, string> = {
      donations: '/donations',
      members: '/members',
      beneficiaries: '/beneficiaries',
      dashboard: '/dashboard',
    };

    const route = routes[module];
    if (route) {
      // Navigation event gönder
      window.dispatchEvent(
        new CustomEvent('ai-navigate', {
          detail: { module, page, route },
        }),
      );

      return {
        message: `🧭 ${module} sayfasına yönlendiriliyor...`,
        data: { route, module, page },
      };
    }

    return {
      message: 'Bu sayfa bulunamadı.',
      data: null,
    };
  }

  // 🔍 Sistem durumu komutu
  private async executeStatusCommand(): Promise<any> {
    try {
      const [beneficiaries, donations, members] = await Promise.all([
        ihtiyacSahipleriService.getIhtiyacSahipleri(1, 1, {}),
        donationsService.getDonations(1, 1, {}),
        membersService.getMembers(1, 1, {}),
      ]);

      return {
        message: `🔍 Sistem Durumu:

📊 **Genel İstatistikler:**
• İhtiyaç Sahipleri: ${beneficiaries.total || 0}
• Toplam Bağış: ${donations.total || 0}
• Aktif Üyeler: ${members.total || 0}

✅ **Sistem Sağlığı:**
• Veritabanı: Çalışıyor
• API: Aktif
• AI Asistan: Çevrimiçi

🕐 **Son Güncelleme:** ${new Date().toLocaleString('tr-TR')}`,
        data: {
          beneficiaries: beneficiaries.total,
          donations: donations.total,
          members: members.total,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        message: '❌ Sistem durumu alınırken hata oluştu.',
        data: null,
      };
    }
  }

  // 🤖 Ücretsiz AI çağrısı
  private async callFreeAI(input: string, context?: any): Promise<string> {
    const { provider } = this.config;

    switch (provider) {
      case 'openrouter':
        return await this.callOpenRouter(input);

      case 'huggingface':
        return await this.callHuggingFace(input);

      case 'ollama':
        return await this.callOllama(input);

      case 'local':
        return this.callLocalAI(input);

      case 'groq':
        return await this.callGroq(input);

      default:
        return this.generateSmartResponse(input, context);
    }
  }

  // 🌐 OpenRouter API
  private async callOpenRouter(input: string): Promise<string> {
    if (!this.config.apiKey) {
      return this.generateSmartResponse(input);
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Dernek AI Asistan',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content:
                'Sen Türkçe konuşan bir dernek yönetim AI asistanısın. Kısa ve net yanıtlar ver.',
            },
            {
              role: 'user',
              content: input,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error('OpenRouter API hatası');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.generateSmartResponse(input);
    } catch (error) {
      console.error('OpenRouter hatası:', error);
      return this.generateSmartResponse(input);
    }
  }

  // 🤗 Hugging Face API
  private async callHuggingFace(input: string): Promise<string> {
    if (!this.config.apiKey) {
      return this.generateSmartResponse(input);
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/${this.config.model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: input,
          parameters: {
            max_length: this.config.maxTokens,
            temperature: this.config.temperature,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Hugging Face API hatası');
      }

      const data = await response.json();
      return data[0]?.generated_text || this.generateSmartResponse(input);
    } catch (error) {
      console.error('Hugging Face hatası:', error);
      return this.generateSmartResponse(input);
    }
  }

  // 🦙 Ollama (Local AI)
  private async callOllama(input: string): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2', // veya başka bir model
          prompt: input,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Ollama bağlantı hatası');
      }

      const data = await response.json();
      return data.response || this.generateSmartResponse(input);
    } catch (error) {
      console.error('Ollama hatası:', error);
      return this.generateSmartResponse(input);
    }
  }

  // 🏠 Yerel AI (Basit NLP)
  private callLocalAI(input: string): string {
    return this.generateSmartResponse(input);
  }

  // ⚡ Groq API (Ücretsiz tier)
  private async callGroq(input: string): Promise<string> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2-70b-4096',
          messages: [
            { role: 'system', content: 'Sen Türkçe konuşan bir dernek yönetim asistanısın.' },
            { role: 'user', content: input },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || this.generateSmartResponse(input);
    } catch (error) {
      console.error('Groq hatası:', error);
      return this.generateSmartResponse(input);
    }
  }

  // 🧠 Akıllı yanıt üretici (Fallback)
  private generateSmartResponse(input: string, context?: any): string {
    const lowerInput = input.toLowerCase();

    // Selamlaşma
    if (lowerInput.includes('merhaba') || lowerInput.includes('selam')) {
      return 'Merhaba! Ben Dernek AI asistanınızım. Size nasıl yardımcı olabilirim? 🤖\n\n**Yapabileceklerim:**\n• İhtiyaç sahiplerini listele\n• Bağışları analiz et\n• Üyeleri yönet\n• Sayfalara yönlendir\n• Sistem durumunu kontrol et';
    }

    // Yardım
    if (lowerInput.includes('yardım') || lowerInput.includes('help')) {
      return '🆘 **Yardım Menüsü:**\n\n**Komut Örnekleri:**\n• "İhtiyaç sahiplerini listele"\n• "Bağışları analiz et"\n• "Üyeler sayfasına git"\n• "Sistem durumunu kontrol et"\n\n**İpucu:** Doğal dilde yazabilirsiniz!';
    }

    // Teşekkür
    if (lowerInput.includes('teşekkür') || lowerInput.includes('sağol')) {
      return 'Rica ederim! Başka bir konuda yardım edebilirim. 😊';
    }

    // Genel yanıt
    const responses = [
      'Anlayamadım. Daha açık bir şekilde sorabilir misiniz?',
      'Bu konuda size yardımcı olamıyorum. Başka bir şey deneyebilirsiniz.',
      'Komutunuzu anlamadım. "Yardım" yazarak mevcut komutları görebilirsiniz.',
      'Üzgünüm, bu isteği yerine getiremiyorum. Farklı bir şey deneyebilirsiniz.',
    ];

    return (
      responses[Math.floor(Math.random() * responses.length)] +
      '\n\n💡 **Öneri:** "İhtiyaç sahiplerini listele" veya "Bağışları analiz et" komutlarını deneyebilirsiniz.'
    );
  }

  // 🎯 Fallback yanıt
  private generateFallbackResponse(input: string): string {
    return `🤖 AI servisi şu anda kullanılamıyor, ancak yine de yardımcı olmaya çalışıyorum!

**Girdiniz:** ${input}

**Önerilerim:**
• İnternet bağlantınızı kontrol edin
• Sayfayı yenileyin
• Daha sonra tekrar deneyin

**Hızlı Komutlar:**
• "İhtiyaç sahiplerini listele"
• "Bağışlar sayfasına git"  
• "Sistem durumunu kontrol et"

Ben yine de buradayım! 😊`;
  }

  // 📊 Formatters
  private formatBeneficiariesList(data: any[]): string {
    if (data.length === 0) return 'Henüz kayıt bulunmuyor.';

    return (
      data
        .slice(0, 5)
        .map(
          (item, index) =>
            `${index + 1}. **${item.ad_soyad || 'İsim yok'}** - ${item.sehri || 'Şehir yok'} (${item.status || item.durum || 'Durum yok'})`,
        )
        .join('\n') + (data.length > 5 ? `\n\n... ve ${data.length - 5} kayıt daha` : '')
    );
  }

  private formatDonationsList(data: any[]): string {
    if (data.length === 0) return 'Henüz bağış kaydı bulunmuyor.';

    return (
      data
        .slice(0, 5)
        .map(
          (item, index) =>
            `${index + 1}. **${item.bagisci_adi || 'Bağışçı yok'}** - ${(item.miktar || 0).toLocaleString('tr-TR')} ₺`,
        )
        .join('\n') + (data.length > 5 ? `\n\n... ve ${data.length - 5} kayıt daha` : '')
    );
  }

  private formatMembersList(data: any[]): string {
    if (data.length === 0) return 'Henüz üye kaydı bulunmuyor.';

    return (
      data
        .slice(0, 5)
        .map(
          (item, index) =>
            `${index + 1}. **${item.ad_soyad || item.name || 'İsim yok'}** - ${item.status || item.durum || 'Aktif'}`,
        )
        .join('\n') + (data.length > 5 ? `\n\n... ve ${data.length - 5} kayıt daha` : '')
    );
  }

  private analyzeDonations(data: any[]): string {
    if (data.length === 0) return 'Analiz için yeterli veri yok.';

    const totalAmount = data.reduce((sum, item) => sum + (item.miktar || item.amount || 0), 0);
    const avgAmount = totalAmount / data.length;

    return `💰 **Toplam Bağış:** ${totalAmount.toLocaleString('tr-TR')} ₺
📊 **Ortalama Bağış:** ${avgAmount.toFixed(2)} ₺  
👥 **Bağışçı Sayısı:** ${data.length}
📈 **Durum:** ${totalAmount > 0 ? 'Pozitif' : 'Veri yok'}`;
  }

  private analyzeMembers(data: any[]): string {
    if (data.length === 0) return 'Analiz için yeterli veri yok.';

    const activeMembers = data.filter((m) => m.status === 'active' || m.durum === 'aktif').length;
    const activeRate = (activeMembers / data.length) * 100;

    return `👥 **Toplam Üye:** ${data.length}
✅ **Aktif Üye:** ${activeMembers}  
📊 **Aktiflik Oranı:** %${activeRate.toFixed(1)}
📈 **Durum:** ${activeRate > 80 ? 'Çok İyi' : activeRate > 60 ? 'İyi' : 'Geliştirilmeli'}`;
  }

  // 🔧 Konfigürasyon güncelle
  updateConfig(newConfig: Partial<FreeAIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // 📝 Conversation history'i al
  getHistory() {
    return this.conversationHistory;
  }

  // 💾 Conversation history'i temizle
  clearHistory() {
    this.initializeSystemPrompt();
  }
}

// 🚀 Singleton instance
export const freeAIService = new FreeAIService();
export default freeAIService;
