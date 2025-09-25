/**
 * @fileoverview LawyerAssignmentsPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */



import { useState } from 'react';


import { useSearch } from '../../hooks/useSearch';
import type { Lawyer } from '../../types/lawyer';
import { LAWYER_SEARCH_CONFIG } from '../../config/search';

interface Lawyer {
  id: number;
  name: string;
  barNumber: string;
  barAssociation: string;
  phone: string;
  email: string;
  specializations: string[];
  experience: number;
  rating: number;
  totalCases: number;
  activeCases: number;
  successRate: number;
  status: 'musait' | 'dolu' | 'izinli';
  office: string;
  consultationFee?: number;
  languages: string[];
  education: string;
  notes?: string;
}

const mockLawyers: Lawyer[] = [
  {
    id: 1,
    name: 'Av. Fatma Demir',
    barNumber: '12345',
    barAssociation: 'Ankara Barosu',
    phone: '0312 555 0201',
    email: 'fatma.demir@hukuk.com',
    specializations: ['İş Hukuku', 'Sosyal Güvenlik Hukuku', 'İdare Hukuku'],
    experience: 12,
    rating: 4.8,
    totalCases: 245,
    activeCases: 8,
    successRate: 87,
    status: 'musait',
    office: 'Kızılay, Ankara',
    consultationFee: 500,
    languages: ['Türkçe', 'İngilizce'],
    education: 'Ankara Üniversitesi Hukuk Fakültesi',
    notes: 'İş hukuku konusunda uzman. Sosyal yardım davalarında deneyimli.',
  },
  {
    id: 2,
    name: 'Av. Mehmet Özkan',
    barNumber: '23456',
    barAssociation: 'Ankara Barosu',
    phone: '0312 555 0301',
    email: 'mehmet.ozkan@hukuk.com',
    specializations: ['Aile Hukuku', 'Medeni Hukuk', 'Miras Hukuku'],
    experience: 8,
    rating: 4.6,
    totalCases: 189,
    activeCases: 12,
    successRate: 82,
    status: 'musait',
    office: 'Çankaya, Ankara',
    consultationFee: 400,
    languages: ['Türkçe'],
    education: 'Gazi Üniversitesi Hukuk Fakültesi',
  },
  {
    id: 3,
    name: 'Av. Dr. Zeynep Kaya',
    barNumber: '34567',
    barAssociation: 'Ankara Barosu',
    phone: '0312 555 0401',
    email: 'zeynep.kaya@hukuk.com',
    specializations: ['Ceza Hukuku', 'İnsan Hakları', 'Anayasa Hukuku'],
    experience: 15,
    rating: 4.9,
    totalCases: 312,
    activeCases: 6,
    successRate: 91,
    status: 'dolu',
    office: 'Kızılay, Ankara',
    consultationFee: 750,
    languages: ['Türkçe', 'İngilizce', 'Fransızca'],
    education: 'İstanbul Üniversitesi Hukuk Fakültesi (Doktora)',
  },
];

/**
 * LawyerAssignmentsPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function LawyerAssignmentsPage() {
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
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
  } = useSearch<Lawyer>({
    config: LAWYER_SEARCH_CONFIG,
    data: mockLawyers,
    initialFilters: [],
  });

  // Memoized filter transformations
  const filterConfig = useMemo(() => ({
    tabs: {
      all: {},
      available: { status: 'musait' },
      busy: { status: 'dolu' },
      top: { minRating: 4.7 },
    },
  }), []);

  // Memoized filtered lawyers based on active tab
  const filteredLawyers = useMemo(() => {
    const tabFilters = filterConfig.tabs[activeTab as keyof typeof filterConfig.tabs] || {};
    
    return searchState.results.filter((lawyer) => {
      // Apply tab-specific filters
      if (tabFilters.status && lawyer.status !== tabFilters.status) return false;
      if (tabFilters.minRating && lawyer.rating < tabFilters.minRating) return false;
      
      return true;
    });
  }, [searchState.results, activeTab, filterConfig.tabs]);

  // Handler for tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    clearFilters(); // Clear existing filters when changing tabs
  };

  return (
    <div className="lawyer-assignments">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => { handleTabChange('all'); }}
        >
          Tüm Avukatlar
        </button>
        <button
          className={activeTab === 'available' ? 'active' : ''}
          onClick={() => { handleTabChange('available'); }}
        >
          Müsait
        </button>
        <button
          className={activeTab === 'busy' ? 'active' : ''}
          onClick={() => { handleTabChange('busy'); }}
        >
          Dolu
        </button>
        <button
          className={activeTab === 'top' ? 'active' : ''}
          onClick={() => { handleTabChange('top'); }}
        >
          En İyiler
        </button>
      </div>

      {/* Search and filters */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Avukat ara..."
          value={searchState.query}
          onChange={(e) => { setQuery(e.target.value); }}
        />
        <select
          value={searchState.filters.find((f) => f.field === 'specialization')?.value ?? ''}
          onChange={(e) => { setFilters([{ field: 'specialization', value: e.target.value }]); }}
        >
          <option value="">Tüm Uzmanlıklar</option>
          {/* Add specialization options */}
        </select>
      </div>

      {/* Results */}
      {searchState.isLoading ? (
        <div>Yükleniyor...</div>
      ) : isEmpty ? (
        <div>Sonuç bulunamadı</div>
      ) : (
        <div className="lawyers-grid">
          {filteredLawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="lawyer-card"
              onClick={() => {
                setSelectedLawyer(lawyer);
                setIsDetailOpen(true);
              }}
            >
              {/* Lawyer card content */}
              <h3>{lawyer.name}</h3>
              <p>{lawyer.specializations.join(', ')}</p>
              <p>Baro No: {lawyer.barNumber}</p>
              <div className="rating">⭐ {lawyer.rating}</div>
              <div className={`status ${lawyer.status}`}>
                {lawyer.status === 'musait' ? 'Müsait' : 'Dolu'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lawyer detail modal */}
      {isDetailOpen && selectedLawyer && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => { setIsDetailOpen(false); }}>Kapat</button>
            <h2>{selectedLawyer.name}</h2>
            {/* Add more lawyer details */}
          </div>
        </div>
      )}
    </div>
  );
}

// Default export
export default LawyerAssignmentsPage;
