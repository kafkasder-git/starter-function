/**
 * @fileoverview LawyerAssignmentsPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { useSearch } from '@/hooks/useSearch';
import type { Lawyer } from '@/types/lawyer';
import type { SearchConfig, FilterValue } from '@/types/search';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { legalConsultationsService } from '../../services/legalConsultationsService';
import { logger } from '../../lib/logging/logger';
import type { Consultation } from '../../types/consultation';

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

/**
 * LawyerAssignmentsPage component
 */
export function LawyerAssignmentsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    consultationId: '',
    lawyerId: '',
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingConsultations(true);
        const consResult = await legalConsultationsService.getConsultationsNeedingAssignment();
        if (consResult.error) {
          logger.error('Failed to load consultations:', consResult.error);
        } else {
          setConsultations(consResult.data || []);
        }
      } catch (err) {
        logger.error('Error loading consultations:', err);
      } finally {
        setLoadingConsultations(false);
      }

      try {
        setLoadingLawyers(true);
        const lawResult = await legalConsultationsService.getAvailableLawyers();
        if (lawResult.error) {
          logger.error('Failed to load lawyers:', lawResult.error);
        } else {
          setLawyers(lawResult.data || []);
        }
      } catch (err) {
        logger.error('Error loading lawyers:', err);
      } finally {
        setLoadingLawyers(false);
      }
    };
    loadData();
  }, []);

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

    if (!assignmentData.consultationId || !assignmentData.lawyerId) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await legalConsultationsService.assignLawyer(
        assignmentData.consultationId,
        assignmentData.lawyerId
      );

      if (result.error) {
        logger.error('Failed to assign lawyer:', result.error);
        toast.error('Avukat ataması başarısız');
      } else {
        toast.success('Avukat başarıyla atandı!');
        setShowAssignDialog(false);

        // Reset form
        setAssignmentData({
          consultationId: '',
          lawyerId: '',
        });

        // Reload consultations
        const consResult = await legalConsultationsService.getConsultationsNeedingAssignment();
        if (!consResult.error) {
          setConsultations(consResult.data || []);
        }
      }
    } catch (err) {
      logger.error('Error assigning lawyer:', err);
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
              Bir danışmaya avukat atayın. Zorunlu alanları (*) doldurmanız gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignLawyer} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="consultationId">Danışma Seçin *</Label>
              <Select
                value={assignmentData.consultationId}
                onValueChange={(value) => {
                  setAssignmentData({ ...assignmentData, consultationId: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Danışma seçin" />
                </SelectTrigger>
                <SelectContent>
                  {consultations.map((consultation) => (
                    <SelectItem key={consultation.id} value={consultation.id}>
                      {consultation.title} - {consultation.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
