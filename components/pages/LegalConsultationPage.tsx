/**
 * @fileoverview LegalConsultationPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useMemo, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { legalConsultationsService } from '../../services/legalConsultationsService';
import { logger } from '../../lib/logging/logger';
import type { Consultation } from '../../types/consultation';
import type { SearchConfig } from '../../types/search';

// Search configuration for consultations
const CONSULTATION_SEARCH_CONFIG: SearchConfig = {
  searchableFields: ['clientName', 'subject', 'description', 'category', 'assignedLawyer'],
  filterableFields: ['category', 'urgency', 'status', 'assignedLawyer'],
  sortableFields: ['createdDate', 'consultationDate', 'clientName', 'urgency'],
  defaultSort: { field: 'createdDate', direction: 'desc' },
  itemsPerPage: 10,
  enableFuzzySearch: true,
  enableTurkishSearch: true,
  debounceMs: 300,
};

/**
 * LegalConsultationPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function LegalConsultationPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch consultations on mount
  useEffect(() => {
    const loadConsultations = async () => {
      try {
        setLoading(true);
        const result = await legalConsultationsService.getConsultations(1, 100, {}); // Adjust pagination as needed
        if (result.error) {
          logger.error('Failed to load consultations:', result.error);
          setError('Danışmalar yüklenirken hata oluştu');
        } else {
          setConsultations(result.data || []);
        }
      } catch (err) {
        logger.error('Error loading consultations:', err);
        setError('Danışmalar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    loadConsultations();
  }, []);

  // Use the optimized search hook with fetched data
  const { searchState, setQuery, setFilters, clearFilters, isEmpty } = useSearch<Consultation>({
    config: CONSULTATION_SEARCH_CONFIG,
    data: consultations,
    initialFilters: [],
  });

  // Memoized filter transformations
  const filterConfig = useMemo(
    () => ({
      tabs: {
        all: {},
        pending: { status: 'bekliyor' },
        scheduled: { status: 'incelemede' },
        completed: { status: 'tamamlandi' },
        urgent: { urgency: 'acil' },
      },
    }),
    []
  );

  // Memoized filtered consultations based on active tab
  const filteredConsultations = useMemo(() => {
    const tabFilters = filterConfig.tabs[activeTab as keyof typeof filterConfig.tabs] || {};

    return searchState.results.filter((consultation) => {
      // Apply tab-specific filters
      if (tabFilters.status && consultation.status !== tabFilters.status) return false;
      if (tabFilters.urgency && consultation.urgency !== tabFilters.urgency) return false;

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
          onClick={() => {
            handleTabChange('all');
          }}
        >
          Tüm Danışmalar
        </button>
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => {
            handleTabChange('pending');
          }}
        >
          Bekleyen
        </button>
        <button
          className={activeTab === 'scheduled' ? 'active' : ''}
          onClick={() => {
            handleTabChange('scheduled');
          }}
        >
          Planlanmış
        </button>
        <button
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => {
            handleTabChange('completed');
          }}
        >
          Tamamlanmış
        </button>
        <button
          className={activeTab === 'urgent' ? 'active' : ''}
          onClick={() => {
            handleTabChange('urgent');
          }}
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
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
        <select
          value={searchState.filters.find((f) => f.field === 'category')?.value ?? ''}
          onChange={(e) => {
            setFilters([{ field: 'category', value: e.target.value }]);
          }}
          title="Kategori seçin"
          aria-label="Kategori filtresi"
        >
          <option value="">Tüm Kategoriler</option>
          {/* Add category options */}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div>Yükleniyor...</div>
      ) : error ? (
        <div className="error">{error}</div>
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
                {consultation.status === 'pending'
                  ? 'Bekliyor'
                  : consultation.status === 'scheduled'
                    ? 'Planlandı'
                    : 'Tamamlandı'}
              </div>
              <div className={`priority ${consultation.priority}`}>
                {consultation.priority === 'high'
                  ? 'Acil'
                  : consultation.priority === 'medium'
                    ? 'Normal'
                    : 'Düşük'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultation detail modal */}
      {isDetailOpen && selectedConsultation && (
        <div className="modal">
          <div className="modal-content">
            <button
              onClick={() => {
                setIsDetailOpen(false);
              }}
            >
              Kapat
            </button>
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
