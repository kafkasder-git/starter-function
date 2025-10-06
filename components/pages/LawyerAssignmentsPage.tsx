/**
 * @fileoverview LawyerAssignmentsPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { useSearch } from '@/hooks/useSearch';
import type { Lawyer } from '@/types/lawyer';
import type { SearchConfig, FilterValue } from '@/types/search';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

type TabKey = 'all' | 'available' | 'busy' | 'top';

// Search configuration for lawyers
const LAWYER_SEARCH_CONFIG: SearchConfig = {
  searchableFields: ['name', 'barNumber', 'barAssociation', 'specializations'],
  filterableFields: ['specializations', 'barAssociation', 'experience', 'rating'],
  sortableFields: ['name', 'rating', 'experience', 'totalCases', 'successRate'],
  defaultSort: { field: 'rating', direction: 'desc' },
  itemsPerPage: 12,
  enableFuzzySearch: true,
  enableTurkishSearch: true,
  debounceMs: 300,
};

// Lawyer data - will be fetched from API in the future

const lawyers: Lawyer[] = [
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
 * LawyerAssignmentsPage component
 */
export function LawyerAssignmentsPage() {
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    lawyerId: '',
    caseTitle: '',
    caseType: '',
    description: '',
    clientName: '',
    clientPhone: '',
  });

  // Use the optimized search hook
  const { searchState, setQuery, setFilters, clearFilters, isEmpty } = useSearch<Lawyer>({
    config: LAWYER_SEARCH_CONFIG,
    data: lawyers,
    initialFilters: [],
  });

  // Memoized filtered lawyers based on active tab
  const filteredLawyers = useMemo(() => {
    return searchState.results.filter((lawyer: Lawyer) => {
      // Apply tab-specific filters
      switch (activeTab) {
        case 'available':
          return lawyer.status === 'musait';
        case 'busy':
          return lawyer.status === 'dolu';
        case 'top':
          return lawyer.rating >= 4.7;
        case 'all':
        default:
          return true;
      }
    });
  }, [searchState.results, activeTab]);

  // Handler for tab changes
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    clearFilters(); // Clear existing filters when changing tabs
  };

  const handleAssignLawyer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignmentData.lawyerId || !assignmentData.caseTitle || !assignmentData.clientName) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Integrate with actual API
      // const result = await legalService.assignLawyer(assignmentData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Avukat başarıyla atandı!');
      setShowAssignDialog(false);

      // Reset form
      setAssignmentData({
        lawyerId: '',
        caseTitle: '',
        caseType: '',
        description: '',
        clientName: '',
        clientPhone: '',
      });
    } catch {
      toast.error('Avukat ataması yapılırken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lawyer-assignments space-y-6 p-6">
      {/* Header with Assign Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Avukat Atamaları</h1>
        <Button
          onClick={() => {
            setShowAssignDialog(true);
          }}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Avukat Ata
        </Button>
      </div>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => {
            handleTabChange('all');
          }}
        >
          Tüm Avukatlar
        </button>
        <button
          className={activeTab === 'available' ? 'active' : ''}
          onClick={() => {
            handleTabChange('available');
          }}
        >
          Müsait
        </button>
        <button
          className={activeTab === 'busy' ? 'active' : ''}
          onClick={() => {
            handleTabChange('busy');
          }}
        >
          Dolu
        </button>
        <button
          className={activeTab === 'top' ? 'active' : ''}
          onClick={() => {
            handleTabChange('top');
          }}
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
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
        <select
          value={
            searchState.filters.find((f: FilterValue) => f.field === 'specialization')?.value ?? ''
          }
          onChange={(e) => {
            setFilters([{ field: 'specialization', value: e.target.value }]);
          }}
          title="Uzmanlık alanı seçin"
          aria-label="Uzmanlık alanı filtresi"
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
          {filteredLawyers.map((lawyer: Lawyer) => (
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
            <button
              onClick={() => {
                setIsDetailOpen(false);
              }}
            >
              Kapat
            </button>
            <h2>{selectedLawyer.name}</h2>
            {/* Add more lawyer details */}
          </div>
        </div>
      )}

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Avukat Ataması
            </DialogTitle>
            <DialogDescription>
              Bir davaya avukat atayın. Zorunlu alanları (*) doldurmanız gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignLawyer} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lawyerId">Avukat Seçin *</Label>
              <Select
                value={assignmentData.lawyerId}
                onValueChange={(value) => {
                  setAssignmentData({ ...assignmentData, lawyerId: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Avukat seçin" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLawyers.map((lawyer: Lawyer) => (
                    <SelectItem key={lawyer.id} value={lawyer.id.toString()}>
                      {lawyer.name} - {lawyer.specializations[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Müvekkil Adı *</Label>
              <Input
                id="clientName"
                value={assignmentData.clientName}
                onChange={(e) => {
                  setAssignmentData({ ...assignmentData, clientName: e.target.value });
                }}
                placeholder="Müvekkil adı"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">Müvekkil Telefonu</Label>
              <Input
                id="clientPhone"
                type="tel"
                value={assignmentData.clientPhone}
                onChange={(e) => {
                  setAssignmentData({ ...assignmentData, clientPhone: e.target.value });
                }}
                placeholder="0555 123 45 67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseTitle">Dava Başlığı *</Label>
              <Input
                id="caseTitle"
                value={assignmentData.caseTitle}
                onChange={(e) => {
                  setAssignmentData({ ...assignmentData, caseTitle: e.target.value });
                }}
                placeholder="Dava konusu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseType">Dava Türü</Label>
              <Select
                value={assignmentData.caseType}
                onValueChange={(value) => {
                  setAssignmentData({ ...assignmentData, caseType: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dava türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="is_hukuku">İş Hukuku</SelectItem>
                  <SelectItem value="aile_hukuku">Aile Hukuku</SelectItem>
                  <SelectItem value="ceza_hukuku">Ceza Hukuku</SelectItem>
                  <SelectItem value="medeni_hukuk">Medeni Hukuk</SelectItem>
                  <SelectItem value="idare_hukuku">İdare Hukuku</SelectItem>
                  <SelectItem value="diger">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={assignmentData.description}
                onChange={(e) => {
                  setAssignmentData({ ...assignmentData, description: e.target.value });
                }}
                placeholder="Dava detayları ve notlar"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAssignDialog(false);
                }}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Atanıyor...' : 'Avukat Ata'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default export
export default LawyerAssignmentsPage;
