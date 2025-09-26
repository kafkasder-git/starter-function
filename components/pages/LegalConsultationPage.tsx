/**
 * @fileoverview LegalConsultationPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */






interface LegalConsultation {
  id: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  subject: string;
  description: string;
  category: 'medeni' | 'ceza' | 'is' | 'ticaret' | 'idare' | 'aile' | 'icra' | 'diger';
  urgency: 'acil' | 'orta' | 'normal';
  status: 'bekliyor' | 'incelemede' | 'atandi' | 'tamamlandi';
  assignedLawyer?: string;
  lawyerPhone?: string;
  consultationDate?: string;
  notes?: string;
  createdDate: string;
  expectedDate?: string;
  rating?: number;
}

// Mock data kaldırıldı - gerçek veriler API'den gelecek

import { useState, useMemo } from 'react';
import { useSearch } from '../../hooks/useSearch';
import type { Consultation } from '../../types/consultation';
import { CONSULTATION_SEARCH_CONFIG } from '../../config/search';

const mockConsultations: Consultation[] = [
  // ... existing mock data ...
];

/**
 * LegalConsultationPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function LegalConsultationPage() {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Use the optimized search hook
  const {
    searchState,
    setQuery,
    setFilters,
    clearFilters,
    hasResults,
    isEmpty,
  } = useSearch<Consultation>({
    config: CONSULTATION_SEARCH_CONFIG,
    data: mockConsultations,
    initialFilters: [],
  });

  // Memoized filter transformations
  const filterConfig = useMemo(() => ({
    tabs: {
      all: {},
      pending: { status: 'pending' },
      scheduled: { status: 'scheduled' },
      completed: { status: 'completed' },
      urgent: { priority: 'high' },
    },
  }), []);

  // Memoized filtered consultations based on active tab
  const filteredConsultations = useMemo(() => {
    const tabFilters = filterConfig.tabs[activeTab as keyof typeof filterConfig.tabs] || {};
    
    return searchState.results.filter((consultation) => {
      // Apply tab-specific filters
      if (tabFilters.status && consultation.status !== tabFilters.status) return false;
      if (tabFilters.priority && consultation.priority !== tabFilters.priority) return false;
      
      return true;
    });
  }, [searchState.results, activeTab, filterConfig.tabs]);

  // Handler for tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    clearFilters(); // Clear existing filters when changing tabs
  };

  return (
    <div className="legal-consultation">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => { handleTabChange('all'); }}
        >
          Tüm Danışmalar
        </button>
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => { handleTabChange('pending'); }}
        >
          Bekleyen
        </button>
        <button
          className={activeTab === 'scheduled' ? 'active' : ''}
          onClick={() => { handleTabChange('scheduled'); }}
        >
          Planlanmış
        </button>
        <button
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => { handleTabChange('completed'); }}
        >
          Tamamlanmış
        </button>
        <button
          className={activeTab === 'urgent' ? 'active' : ''}
          onClick={() => { handleTabChange('urgent'); }}
        >
          Acil
        </button>
      </div>

      {/* Search and filters */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Danışma ara..."
          value={searchState.query}
          onChange={(e) => { setQuery(e.target.value); }}
        />
        <select
          value={searchState.filters.find((f) => f.field === 'category')?.value ?? ''}
          onChange={(e) => { setFilters([{ field: 'category', value: e.target.value }]); }}
        >
          <option value="">Tüm Kategoriler</option>
          {/* Add category options */}
        </select>
      </div>

      {/* Results */}
      {searchState.isLoading ? (
        <div>Yükleniyor...</div>
      ) : isEmpty ? (
        <div>Sonuç bulunamadı</div>
      ) : (
        <div className="consultations-grid">
          {filteredConsultations.map((consultation) => (
            <div
              key={consultation.id}
              className="consultation-card"
              onClick={() => {
                setSelectedConsultation(consultation);
                setIsDetailOpen(true);
              }}
            >
              {/* Consultation card content */}
              <h3>{consultation.title}</h3>
              <p>{consultation.description}</p>
              <p>Kategori: {consultation.category}</p>
              <div className={`status ${consultation.status}`}>
                {consultation.status === 'pending' ? 'Bekliyor' :
                 consultation.status === 'scheduled' ? 'Planlandı' :
                 'Tamamlandı'}
              </div>
              <div className={`priority ${consultation.priority}`}>
                {consultation.priority === 'high' ? 'Acil' :
                 consultation.priority === 'medium' ? 'Normal' :
                 'Düşük'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultation detail modal */}
      {isDetailOpen && selectedConsultation && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => { setIsDetailOpen(false); }}>Kapat</button>
            <h2>{selectedConsultation.title}</h2>
            {/* Add more consultation details */}
          </div>
        </div>
      )}
    </div>
  );
}

// Default export
export default LegalConsultationPage;
